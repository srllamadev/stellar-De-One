
from pathlib import Path
from dotenv import dotenv_values

from stellar_sdk import (
    Asset,
    Keypair,
    Network,
    Server,
    TransactionBuilder
)

# 1. Configurar Stellar Testnet
HORIZON_URL = "https://horizon-testnet.stellar.org"

server = Server(horizon_url=HORIZON_URL)

# 2. Leer credenciales guardadas
archivo = Path(__file__).parent / ".cuentas_testnet"
datos = dotenv_values(archivo)

# 3. Recuperar las cuentas
remitente = Keypair.from_secret(
    datos["REMITENTE_SECRETA"]
)

destinatario = Keypair.from_secret(
    datos["DESTINATARIO_SECRETA"]
)

# 4. Verificar que coincidan con las claves públicas
assert remitente.public_key == datos["REMITENTE_PUBLICA"]
assert destinatario.public_key == datos["DESTINATARIO_PUBLICA"]

# 5. Consultar la cuenta del remitente
cuenta_origen = server.load_account(
    remitente.public_key
)

# Verificar que exista la cuenta destinataria
server.load_account(destinatario.public_key)

# 6. Crear una transacción de prueba
transaccion = (
    TransactionBuilder(
        source_account=cuenta_origen,
        network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
        base_fee=100,
    )
    .append_payment_op(
        destination=destinatario.public_key,
        asset=Asset.native(),
        amount="1"
    )
    .add_text_memo("DE ONE DEMO")
    .set_timeout(60)
    .build()
)

# 7. Mostrar resumen sin enviar la operación
print("\nDE ONE - TRANSFERENCIA TESTNET")
print("--------------------------------")

print("Red: Stellar Testnet")
print("Origen:", remitente.public_key)
print("Destino:", destinatario.public_key)
print("Monto: 1 XLM de prueba")
print("Estado: preparada, NO enviada")

print("--------------------------------")
print("No se ha realizado ninguna transferencia.")


# 8. Firmar y enviar la transacción de prueba

from stellar_sdk.exceptions import (
    BadRequestError,
    BadResponseError,
    ConnectionError,
)

confirmacion = input(
    "\n¿Enviar 1 XLM de prueba en Stellar Testnet? (SI/NO): "
)

if confirmacion.strip().upper() != "SI":
    print("Operación cancelada. No se envió ninguna transacción.")
    raise SystemExit(0)

try:
    # Firmar con la cuenta del remitente
    transaccion.sign(remitente)

    # Enviar a Stellar Testnet
    respuesta = server.submit_transaction(transaccion)

    # Comprobar el resultado
    if respuesta.get("successful"):
        print("\nTRANSACCION CONFIRMADA")
        print("------------------------------")
        print("Red: Stellar Testnet")
        print("Estado: Exitosa")
        print("Monto: 1 XLM de prueba")
        print("Hash:", respuesta["hash"])
        print("------------------------------")
    else:
        print("La red no confirmó la transacción.")

except (BadRequestError, BadResponseError, ConnectionError) as error:
    print("\nNo se pudo confirmar la transacción.")
    print("Tipo de error:", type(error).__name__)
    print("No se debe asumir que el envío fue exitoso.")
