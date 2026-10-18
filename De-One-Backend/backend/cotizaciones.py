
from decimal import Decimal, ROUND_HALF_UP


# Valores simulados para la Ideathon
TIPO_CAMBIO = Decimal("1.30")
PORCENTAJE_COMISION = Decimal("0.01")


def calcular_cotizacion(monto_brl: Decimal):

    # Verificar que el monto sea válido
    if not monto_brl.is_finite() or monto_brl <= 0:
        raise ValueError("El monto debe ser mayor a cero")

    # Calcular comisión
    comision = (monto_brl * PORCENTAJE_COMISION).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # Calcular monto después de comisión
    monto_neto = monto_brl - comision

    # Convertir a bolivianos
    monto_bob = (monto_neto * TIPO_CAMBIO).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    return {
        "moneda_origen": "BRL",
        "moneda_destino": "BOB",
        "monto_enviado": monto_brl,
        "tipo_cambio": TIPO_CAMBIO,
        "comision": comision,
        "monto_a_convertir": monto_neto,
        "monto_recibido": monto_bob,
        "modo": "simulacion"
    }
