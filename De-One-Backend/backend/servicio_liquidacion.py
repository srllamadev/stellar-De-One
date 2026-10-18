
from sqlalchemy import text
from database import engine

from control_liquidacion import (
    reservar_liquidacion,
    guardar_transaccion_preparada
)

from liquidacion_stellar import (
    preparar_transferencia_testnet,
    enviar_transferencia_testnet
)


def liberar_reserva(id_remesa):
    """
    Liberar una reserva solamente si todavia
    no existe una transaccion preparada.
    """
    with engine.begin() as conexion:
        conexion.execute(
            text("""
                UPDATE remesas
                SET estado = 'pago_simulado'
                WHERE id_remesa = :id
                  AND estado = 'procesando'
                  AND hash_stellar_pendiente IS NULL
            """),
            {"id": id_remesa}
        )



def confirmar_en_base_datos(id_remesa, hash_tx):

    with engine.begin() as conexion:

        # Comprobar si la transacción ya está registrada
        existente = conexion.execute(
            text("""
                SELECT id_transaccion, hash_transaccion
                FROM transacciones_stellar
                WHERE id_remesa = :id
            """),
            {"id": id_remesa}
        ).mappings().first()

        if existente:
            if existente["hash_transaccion"] != hash_tx:
                raise RuntimeError(
                    "La remesa tiene otra transacción asociada"
                )

        else:
            # Comprobar que el hash corresponde
            # a la remesa preparada
            remesa = conexion.execute(
                text("""
                    SELECT id_remesa
                    FROM remesas
                    WHERE id_remesa = :id
                      AND hash_stellar_pendiente = :hash
                      AND estado IN (
                          'verificacion_pendiente',
                          'procesando'
                      )
                    FOR UPDATE
                """),
                {"id": id_remesa, "hash": hash_tx}
            ).first()

            if remesa is None:
                raise RuntimeError(
                    "No existe una liquidación preparada válida"
                )

            conexion.execute(
                text("""
                    INSERT INTO transacciones_stellar (
                        id_remesa,
                        hash_transaccion,
                        red,
                        estado
                    )
                    VALUES (
                        :id,
                        :hash,
                        'TESTNET',
                        'confirmada'
                    )
                """),
                {"id": id_remesa, "hash": hash_tx}
            )

        # Mantener la remesa en procesamiento:
        # no equivale a entregar BOB
        conexion.execute(
            text("""
                UPDATE remesas
                SET estado = 'procesando'
                WHERE id_remesa = :id
                  AND estado IN (
                      'verificacion_pendiente',
                      'procesando'
                  )
            """),
            {"id": id_remesa}
        )

    return {
        "id_remesa": id_remesa,
        "hash": hash_tx,
        "estado_stellar": "confirmada",
        "estado_remesa": "procesando",
        "red": "TESTNET",
        "mensaje": "Transferencia Stellar de prueba confirmada"
    }


def liquidar_remesa_testnet(id_remesa):

    # PASO 1: Reservar la remesa
    reserva = reservar_liquidacion(id_remesa)

    if reserva is None:
        raise ValueError(
            "Remesa no disponible para liquidacion. "
            "Consulta su estado antes de reintentar."
        )

    # PASO 2: Preparar y firmar
    try:
        datos = preparar_transferencia_testnet()
    except Exception:
        liberar_reserva(id_remesa)
        raise

    # PASO 3: Guardar XDR y hash antes del envio
    guardado = guardar_transaccion_preparada(
        id_remesa,
        datos["hash"],
        datos["xdr"]
    )

    if guardado is None:
        raise RuntimeError(
            "No se pudo guardar la transaccion preparada"
        )

    # PASO 4: Enviar la transaccion a Testnet
    try:
        respuesta = enviar_transferencia_testnet(
            datos["transaccion"]
        )
    except Exception:
        return {
            "id_remesa": id_remesa,
            "estado": "verificacion_pendiente",
            "hash": datos["hash"],
            "mensaje": (
                "No se pudo confirmar el resultado. "
                "No generes otra transferencia. "
                "Es necesario consultar Stellar."
            )
        }

    # PASO 5: Revisar resultado
    if not respuesta["confirmada"]:
        return {
            "id_remesa": id_remesa,
            "estado": "verificacion_pendiente",
            "hash": datos["hash"],
            "mensaje": "Resultado pendiente de verificacion"
        }

    if respuesta["hash"] != datos["hash"]:
        raise RuntimeError(
            "El hash recibido no coincide "
            "con la transaccion preparada"
        )

    # PASO 6: Registrar confirmacion
    return confirmar_en_base_datos(
        id_remesa,
        respuesta["hash"]
    )
