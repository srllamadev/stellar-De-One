
from sqlalchemy import text
from database import engine


def registrar_usuario(nombre, alias, correo, telefono, pais):

    consulta = text("""
        INSERT INTO usuarios (
            nombre,
            alias,
            correo,
            telefono,
            pais
        )
        VALUES (
            :nombre,
            :alias,
            :correo,
            :telefono,
            :pais
        )
        RETURNING id_usuario
    """)

    with engine.begin() as conexion:
        resultado = conexion.execute(
            consulta,
            {
                "nombre": nombre,
                "alias": alias,
                "correo": correo,
                "telefono": telefono,
                "pais": pais
            }
        )

        id_usuario = resultado.scalar_one()

    return {
        "id_usuario": id_usuario,
        "nombre": nombre,
        "alias": alias,
        "correo": correo,
        "telefono": telefono,
        "pais": pais
    }
