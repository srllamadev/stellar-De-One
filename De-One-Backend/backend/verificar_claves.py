
from stellar_sdk import Keypair

cuenta = Keypair.random()

print("STELLAR TESTNET - CUENTA DE PRUEBA")
print("--------------------------------")

print("Clave pública:", cuenta.public_key)
print("Longitud:", len(cuenta.public_key))

print("Clave secreta generada correctamente:",
      bool(cuenta.secret))

print("La clave secreta no se muestra.")
