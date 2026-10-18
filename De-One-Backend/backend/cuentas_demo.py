
from stellar_sdk import Keypair

# Generar dos identidades de prueba
remitente = Keypair.random()
destinatario = Keypair.random()

print("DE ONE - CUENTAS DE DEMOSTRACION")
print("--------------------------------")

print("REMITENTE:")
print("Clave publica:", remitente.public_key)

print("\nDESTINATARIO:")
print("Clave publica:", destinatario.public_key)

print("\nValidaciones:")
print("Remitente:", len(remitente.public_key) == 56)
print("Destinatario:", len(destinatario.public_key) == 56)

print("\nLas claves secretas no se muestran.")
print("Estas identidades aun no estan activadas en Testnet.")
