
from sqlalchemy import text
from database import engine


def registrar_remesa(
    id_remitente: int,
    id_destinatario: int,
    id_cotizacion: int
):

    with engine.begin() as conexion:

        # 1. Comprobar que la cotización existe,
        # no está vencida y no fue utilizada.
        cotizacion = conexion.execute(
            text("""
                SELECT id_cotizacion
                FROM cotizaciones
                WHERE id_cotizacion = :id
                  AND fecha_expiracion > CURRENT_TIMESTAMP
                  AND NOT EXISTS (
                      SELECT 1 FROM remesas
                      WHERE id_cotizacion = :id
                  )
                FOR UPDATE
            """),
            {"id": id_cotizacion}
        ).first()

        if cotizacion is None:
            raise ValueError(
                "Cotización inexistente, vencida o utilizada"
            )

        # 2. Registrar la remesa
        resultado = conexion.execute(
            text("""
                INSERT INTO remesas (
                    id_remitente,
                    id_destinatario,
                    id_cotizacion,
                    estado
                )
                VALUES (
                    :remitente,
                    :destinatario,
                    :cotizacion,
                    'pendiente'
                )
                RETURNING id_remesa, estado, fecha_creacion
            """),
            {
                "remitente": id_remitente,
                "destinatario": id_destinatario,
                "cotizacion": id_cotizacion
            }
        ).mappings().one()

        return dict(resultado)



# Consultar todas las remesas
def listar_remesas():
    consulta = text("""
        SELECT
            r.id_remesa,
            u1.nombre AS remitente,
            u2.nombre AS destinatario,
            c.monto_brl,
            c.monto_bob,
            r.estado,
            r.fecha_creacion
        FROM remesas r
        JOIN usuarios u1
            ON r.id_remitente = u1.id_usuario
        JOIN usuarios u2
            ON r.id_destinatario = u2.id_usuario
        JOIN cotizaciones c
            ON r.id_cotizacion = c.id_cotizacion
        ORDER BY r.id_remesa DESC
    """)

    with engine.connect() as conexion:
        resultado = conexion.execute(consulta)
        return [dict(fila) for fila in resultado.mappings()]


# Consultar una remesa por ID
def buscar_remesa(id_remesa: int):
    consulta = text("""
        SELECT
            r.id_remesa,
            u1.nombre AS remitente,
            u2.nombre AS destinatario,
            c.monto_brl,
            c.monto_bob,
            r.estado,
            r.fecha_creacion
        FROM remesas r
        JOIN usuarios u1
            ON r.id_remitente = u1.id_usuario
        JOIN usuarios u2
            ON r.id_destinatario = u2.id_usuario
        JOIN cotizaciones c
            ON r.id_cotizacion = c.id_cotizacion
        WHERE r.id_remesa = :id_remesa
    """)

    with engine.connect() as conexion:
        resultado = conexion.execute(
            consulta,
            {"id_remesa": id_remesa}
        ).mappings().first()

        return dict(resultado) if resultado else None


def obtener_detalle_remesa(id_remesa: int):

    consulta = text("""
        SELECT
            r.id_remesa,
            u1.nombre AS remitente,
            u2.nombre AS destinatario,
            u2.alias AS alias_destinatario,
            c.monto_brl,
            c.tipo_cambio,
            c.comision_brl,
            c.monto_bob,
            r.estado AS estado_remesa,
            t.hash_transaccion,
            t.estado AS estado_stellar,
            t.red
        FROM remesas r
        JOIN usuarios u1
            ON r.id_remitente = u1.id_usuario
        JOIN usuarios u2
            ON r.id_destinatario = u2.id_usuario
        JOIN cotizaciones c
            ON r.id_cotizacion = c.id_cotizacion
        LEFT JOIN transacciones_stellar t
            ON r.id_remesa = t.id_remesa
        WHERE r.id_remesa = :id_remesa
    """)

    with engine.connect() as conexion:
        resultado = conexion.execute(
            consulta,
            {"id_remesa": id_remesa}
        ).mappings().first()

        if resultado is None:
            return None

        return dict(resultado)
