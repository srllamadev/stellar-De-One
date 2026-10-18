
from stellar_sdk import Keypair

# Generar una cuenta de prueba
cuenta = Keypair.random()

print("CUENTA DE STELLAR TESTNET")
print("------------------------")
print("Clave publica:", cuenta.public_key)
print("Cuenta generada localmente.")
print("La clave secreta no se muestra.")
