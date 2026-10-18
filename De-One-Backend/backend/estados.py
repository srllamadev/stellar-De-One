
from sqlalchemy import text
from database import engine


def confirmar_pago_simulado(id_remesa: int):

    consulta = text("""
        UPDATE remesas
        SET estado = 'pago_simulado'
        WHERE id_remesa = :id_remesa
          AND estado = 'pendiente'
        RETURNING id_remesa, estado
    """)

    with engine.begin() as conexion:
        resultado = conexion.execute(
            consulta,
            {"id_remesa": id_remesa}
        ).mappings().first()

        if resultado is None:
            return None

        return dict(resultado)
