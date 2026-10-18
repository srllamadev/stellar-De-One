
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from stellar_sdk import Server
from stellar_sdk.exceptions import NotFoundError

from database import engine
from servicio_liquidacion import confirmar_en_base_datos

server = Server(
    horizon_url="https://horizon-testnet.stellar.org"
)


def verificar_liquidacion(id_remesa: int):

    # 1. Recuperar el hash guardado
    with engine.connect() as conexion:
        remesa = conexion.execute(
            text("""
                SELECT
                    r.id_remesa,
                    r.estado,
                    r.hash_stellar_pendiente,
                    t.hash_transaccion
                FROM remesas r
                LEFT JOIN transacciones_stellar t
                    ON r.id_remesa = t.id_remesa
                WHERE r.id_remesa = :id
            """),
            {"id": id_remesa}
        ).mappings().first()

    if remesa is None:
        return {
            "estado": "no_encontrada",
            "mensaje": "La remesa no existe"
        }

    # 2. Si ya tenemos confirmacion registrada
    if remesa["hash_transaccion"]:
        return {
            "id_remesa": id_remesa,
            "estado": "confirmada",
            "hash": remesa["hash_transaccion"]
        }

    hash_tx = remesa["hash_stellar_pendiente"]

    if not hash_tx:
        return {
            "id_remesa": id_remesa,
            "estado": "sin_transferencia",
            "mensaje": "La remesa no tiene una transaccion preparada"
        }

    # 3. Consultar Stellar Horizon
    try:
        transaccion = (
            server.transactions()
            .transaction(hash_tx)
            .call()
        )

    except NotFoundError:
        return {
            "id_remesa": id_remesa,
            "estado": "verificacion_pendiente",
            "hash": hash_tx,
            "mensaje": (
                "La transaccion todavia no aparece en Horizon. "
                "No generar otra transferencia automaticamente."
            )
        }

    # 4. Verificar confirmacion
    if not transaccion.get("successful"):
        return {
            "id_remesa": id_remesa,
            "estado": "verificacion_pendiente",
            "hash": hash_tx,
            "mensaje": "La transaccion no figura como exitosa"
        }

    # 5. Registrar confirmacion en PostgreSQL
    return confirmar_en_base_datos(
        id_remesa,
        hash_tx
    )
