
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import text

from database import engine
from cotizaciones import calcular_cotizacion


def guardar_cotizacion(monto_brl: Decimal):

    # Calcular la cotización simulada
    datos = calcular_cotizacion(monto_brl)

    # La cotización será válida durante 5 minutos
    fecha_expiracion = (
        datetime.now(timezone.utc) + timedelta(minutes=5)
    )

    # Insertar los datos en PostgreSQL
    consulta = text("""
        INSERT INTO cotizaciones (
            monto_brl,
            tipo_cambio,
            comision_brl,
            monto_bob,
            fecha_expiracion
        )
        VALUES (
            :monto_brl,
            :tipo_cambio,
            :comision_brl,
            :monto_bob,
            :fecha_expiracion
        )
        RETURNING id_cotizacion
    """)

    with engine.begin() as conexion:
        resultado = conexion.execute(
            consulta,
            {
                "monto_brl": datos["monto_enviado"],
                "tipo_cambio": datos["tipo_cambio"],
                "comision_brl": datos["comision"],
                "monto_bob": datos["monto_recibido"],
                "fecha_expiracion": fecha_expiracion
            }
        )

        id_cotizacion = resultado.scalar_one()

    return {
        "id_cotizacion": id_cotizacion,
        **datos,
        "fecha_expiracion": fecha_expiracion.isoformat()
    }
