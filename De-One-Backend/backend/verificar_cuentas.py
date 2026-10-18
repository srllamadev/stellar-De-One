
from pathlib import Path
from dotenv import dotenv_values
from stellar_sdk import Keypair

archivo = Path(__file__).parent / ".cuentas_testnet"

datos = dotenv_values(archivo)

cuentas = [
    ("REMITENTE", "REMITENTE_PUBLICA", "REMITENTE_SECRETA"),
    ("DESTINATARIO", "DESTINATARIO_PUBLICA", "DESTINATARIO_SECRETA")
]

print("VERIFICACION DE CUENTAS DE ONE")
print("--------------------------------")

for nombre, campo_publico, campo_secreto in cuentas:

    publica = datos.get(campo_publico)
    secreta = datos.get(campo_secreto)

    if not publica or not secreta:
        print(f"{nombre}: Faltan credenciales")
        continue

    try:
        cuenta = Keypair.from_secret(secreta)

        if cuenta.public_key == publica:
            print(f"{nombre}: Cuenta valida")
            print(f"Clave publica: {publica}")
        else:
            print(f"{nombre}: Las claves no coinciden")

    except ValueError:
        print(f"{nombre}: Credenciales invalidas")

print("--------------------------------")
print("Verificacion finalizada")
