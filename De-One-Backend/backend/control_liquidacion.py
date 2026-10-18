
from sqlalchemy import text
from database import engine


def reservar_liquidacion(id_remesa: int):

    consulta = text("""
        UPDATE remesas
        SET estado = 'procesando'
        WHERE id_remesa = :id_remesa
          AND estado = 'pago_simulado'
          AND hash_stellar_pendiente IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM transacciones_stellar
              WHERE id_remesa = :id_remesa
          )
        RETURNING id_remesa, estado
    """)

    with engine.begin() as conexion:
        resultado = conexion.execute(
            consulta,
            {"id_remesa": id_remesa}
        ).mappings().first()

        return dict(resultado) if resultado else None



def guardar_transaccion_preparada(
    id_remesa: int,
    hash_tx: str,
    xdr: str
):
    consulta = text("""
        UPDATE remesas
        SET
            hash_stellar_pendiente = :hash_tx,
            transaccion_xdr = :xdr,
            estado = 'verificacion_pendiente'
        WHERE id_remesa = :id_remesa
          AND estado = 'procesando'
          AND hash_stellar_pendiente IS NULL
        RETURNING id_remesa, estado
    """)

    with engine.begin() as conexion:
        resultado = conexion.execute(
            consulta,
            {
                "id_remesa": id_remesa,
                "hash_tx": hash_tx,
                "xdr": xdr
            }
        ).mappings().first()

        return dict(resultado) if resultado else None
