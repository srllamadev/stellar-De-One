
from liquidacion_stellar import preparar_transferencia_testnet

print("DE ONE - PRUEBA DE PREPARACION")
print("--------------------------------")

try:
    datos = preparar_transferencia_testnet()

    print("Red:", datos["red"])
    print("Monto:", datos["monto_xlm"], "XLM")
    print("Hash previsto:", datos["hash"])
    print("Estado: preparada y firmada")
    print("No se ha enviado a Stellar Testnet")

except Exception as error:
    print("No se pudo preparar la transaccion")
    print("Tipo de error:", type(error).__name__)
