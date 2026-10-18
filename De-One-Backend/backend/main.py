
from fastapi import FastAPI
from database import verificar_conexion

from decimal import Decimal
from fastapi import HTTPException, Query
from cotizaciones import calcular_cotizacion

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from guardar_cotizacion import guardar_cotizacion

from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.exc import IntegrityError
from usuarios import registrar_usuario

from remesas import registrar_remesa
from sqlalchemy.exc import IntegrityError

from remesas import listar_remesas, buscar_remesa
#conectar stellar
from stellar import verificar_stellar

from stellar import consultar_cuenta
from fastapi import Path

from guardar_transaccion import guardar_transaccion
from pydantic import BaseModel
from stellar_sdk.exceptions import NotFoundError

from remesas import obtener_detalle_remesa

from fastapi.middleware.cors import CORSMiddleware

from estados import confirmar_pago_simulado

from fastapi import Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from servicio_liquidacion import liquidar_remesa_testnet
from verificar_liquidacion import verificar_liquidacion
import os
import secrets

app = FastAPI(
    title="De one API",
    description="Backend de remesas Brasil - Bolivia",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def inicio():
    return {
        "mensaje": "Bienvenido a De one",
        "estado": "Funcionando"
    }


@app.get("/db-test")
def probar_base_datos():
    return verificar_conexion()



@app.get("/cotizar")
def cotizar(
    monto: Decimal = Query(gt=0, description="Monto en BRL")
):
    try:
        return calcular_cotizacion(monto)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@app.post("/cotizaciones", status_code=201)
def crear_cotizacion(
    monto: Decimal = Query(gt=0, description="Monto en BRL")
):
    try:
        return guardar_cotizacion(monto)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo guardar la cotización"
        )



class UsuarioCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    alias: str = Field(min_length=2, max_length=50)
    correo: EmailStr
    telefono: str | None = None
    pais: str = Field(min_length=2, max_length=50)


@app.post("/usuarios", status_code=201)
def crear_usuario(usuario: UsuarioCrear):

    try:
        return registrar_usuario(
            nombre=usuario.nombre,
            alias=usuario.alias,
            correo=str(usuario.correo),
            telefono=usuario.telefono,
            pais=usuario.pais
        )

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El alias o correo ya está registrado"
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo registrar el usuario"
        )



class RemesaCrear(BaseModel):
    id_remitente: int = Field(gt=0)
    id_destinatario: int = Field(gt=0)
    id_cotizacion: int = Field(gt=0)


@app.post("/remesas", status_code=201)
def crear_remesa(remesa: RemesaCrear):

    if remesa.id_remitente == remesa.id_destinatario:
        raise HTTPException(
            status_code=400,
            detail="El remitente y destinatario deben ser distintos"
        )

    try:
        return registrar_remesa(
            remesa.id_remitente,
            remesa.id_destinatario,
            remesa.id_cotizacion
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Usuarios inválidos o cotización ya utilizada"
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo registrar la remesa"
        )



@app.get("/remesas")
def obtener_remesas():
    try:
        return listar_remesas()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="No se pudieron consultar las remesas"
        )


@app.get("/remesas/{id_remesa}")
def obtener_remesa(id_remesa: int):
    try:
        remesa = buscar_remesa(id_remesa)

        if remesa is None:
            raise HTTPException(
                status_code=404,
                detail="Remesa no encontrada"
            )

        return remesa

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo consultar la remesa"
        )



@app.get("/stellar/status")
def estado_stellar():
    return verificar_stellar()



@app.get("/stellar/cuentas/{direccion}")
def obtener_cuenta_stellar(
    direccion: str = Path(
        min_length=56,
        max_length=56,
        description="Clave publica de Stellar"
    )
):
    return consultar_cuenta(direccion)

#prueb

class TransaccionGuardar(BaseModel):
    id_remesa: int
    hash_tx: str


@app.post("/stellar/transacciones", status_code=201)
def registrar_transaccion(datos: TransaccionGuardar):

    if datos.id_remesa <= 0:
        raise HTTPException(
            status_code=400,
            detail="ID de remesa invalido"
        )

    try:
        return guardar_transaccion(
            datos.id_remesa,
            datos.hash_tx
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except NotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Transaccion no encontrada en Stellar Testnet"
        )

    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Remesa inexistente o transaccion ya registrada"
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Error al guardar en PostgreSQL"
        )



@app.get("/remesas/{id_remesa}/detalle")
def detalle_remesa(id_remesa: int):

    if id_remesa <= 0:
        raise HTTPException(
            status_code=400,
            detail="ID de remesa invalido"
        )

    try:
        resultado = obtener_detalle_remesa(id_remesa)

        if resultado is None:
            raise HTTPException(
                status_code=404,
                detail="Remesa no encontrada"
            )

        return resultado

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Error al consultar la remesa"
        )


@app.post("/remesas/{id_remesa}/simular-pago")
def simular_pago(id_remesa: int):

    if id_remesa <= 0:
        raise HTTPException(
            status_code=400,
            detail="ID de remesa invalido"
        )

    try:
        resultado = confirmar_pago_simulado(id_remesa)

        if resultado is None:
            raise HTTPException(
                status_code=409,
                detail="Remesa inexistente o no esta pendiente"
            )

        return {
            **resultado,
            "mensaje": "Pago PIX simulado correctamente",
            "modo": "simulacion",
            "dinero_real": False
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo actualizar la remesa"
        )



# Endpoint de demostracion Stellar Testnet
@app.post("/remesas/{id_remesa}/liquidar-testnet")
def liquidar_testnet(
    id_remesa: int,
    x_demo_token: str | None = Header(default=None)
):
    # Proteger el endpoint de envio.
    # Solo ejecutar localmente, nunca exponer el token al frontend.
    token_esperado = os.getenv("DEMO_ADMIN_TOKEN")

    if not token_esperado or not x_demo_token:
        raise HTTPException(
            status_code=403,
            detail="Liquidacion no autorizada"
        )

    if not secrets.compare_digest(
        x_demo_token,
        token_esperado
    ):
        raise HTTPException(
            status_code=403,
            detail="Liquidacion no autorizada"
        )

    if id_remesa <= 0:
        raise HTTPException(
            status_code=400,
            detail="ID invalido"
        )

    try:
        return liquidar_remesa_testnet(id_remesa)

    except ValueError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="No se pudo completar la liquidacion. Verifica el estado antes de reintentar."
        )


@app.get("/remesas/{id_remesa}/verificar-stellar")
def verificar_stellar_remesa(id_remesa: int):

    if id_remesa <= 0:
        raise HTTPException(
            status_code=400,
            detail="ID invalido"
        )

    try:
        return verificar_liquidacion(id_remesa)
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="No se pudo verificar Stellar"
        )
