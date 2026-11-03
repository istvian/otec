import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Usuario from "../models/Usuario";
import passwordHelper from "../helpers/passwordHelper";
import { NextFunction, Request, Response } from "express";
import Rol from "../models/Rol";
dotenv.config();

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    if (!req.body.correo || !req.body.contraseña)
      // revisa si la petición contiene correo y contraseña en el body y si no lanza error
      throw new Error("Datos erroneos");
    // Busca un usuario dentro de la base de datos que tenga el mismo correo que se indica en la petición e incluye los datos asociados del Rol
    let usuarioEncontrado = await Usuario.findOne({
      where: { correo: req.body.correo },
      include: [{ model: Rol, as: "rol" }],
    });
    // Compara los datos leidos de la base de datos con la contraseña de la petición utilizando bcrypt. La contraseña de la base de datos esta encriptada
    const passwordCompare = await passwordHelper.ComparePassword(
      req.body.contraseña,
      usuarioEncontrado?.dataValues.contraseña,
    );
    console.log(passwordCompare);
    // Valida que el correo sea igual y el resultado de la comparación de contraseñas sea valido
    if (
      usuarioEncontrado?.dataValues.correo == req.body.correo &&
      passwordCompare
    ) {
      // Genera el token jwt y lo firma con la clave ubicada en el archivo .env. Además le agrega el correo, id y rol al payload
      let token = jwt.sign(
        {
          correo: usuarioEncontrado?.dataValues.correo,
          id: usuarioEncontrado?.dataValues.id,
          rol: usuarioEncontrado?.dataValues.rol,
        },
        process.env.SECRET ?? "",
        {
          expiresIn: "1h",
        },
      );
      console.log(token);
      // ENVIA LA COOKIE QUE CADUCA EN 1 HORA
      res
        .cookie("token", token, {
          httpOnly: false, // cambiar a true despues
          secure: false, // en desarrollo puede ser false, en prod debe ser true con https
          sameSite: "strict", // o 'None' si usas secure: true
          maxAge: 1 * 60 * 60 * 1000, // 1 hora en milisegundos
        })
        .send({
          message: "Se ha iniciado sesión correctamente",
          error: false,
        });
    } else {
      res.send({ message: "Error: Datos incorrectos", error: true });
    }
  } catch (e) {
    console.error(e);
    res.send({ message: "Ocurrio un error", error: true });
  }
};

const register = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log(req.body);
    // Revisa si la petición contiene correo, contraseña y nombre
    if (!req.body.correo || !req.body.contraseña || !req.body.nombre)
      throw new Error("Datos erroneos");
    // CHEQUEAR SI LA CONTRASEÑA ES SEGURA MINIMO 8 CARACTERES, 1 MAYUSCULA, 1 MINUSCULA, 1 NUMERO CON REGEX
    const passwordRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})",
    );
    // Chequea con regex si el mail es válido
    const mailRegex = new RegExp(
      "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
    );

    if (!mailRegex.test(req.body.correo))
      throw new Error("El mail no es valido");
    if (!passwordRegex.test(req.body.contraseña))
      throw new Error(
        "La contraseña no cumple con los requisitos (Minimo 8 caracteres, 1 mayuscula, 1 minuscula, 1 número)",
      );
    // Encripta la contraseña recibida
    let hashedPassword = await passwordHelper.HashPassword(req.body.contraseña);

    // Crea un nuevo usuario en la base de datos y se le asigna el rol por defecto
    await Usuario.create({
      correo: req.body.correo,
      contraseña: hashedPassword,
      nombre: req.body.nombre,
      rolID: 1,
    });
    res.send({ message: "Usuario registrado correctamente", error: false });
  } catch (e) {
    console.error(e);
    res.send({ message: "Ocurrio un error", error: true });
  }
};
const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Manda una respuesta a la web que le dice al navegador que elimine la cookie token
    res
      .clearCookie("token")
      .send({ message: "Cookie eliminada", error: false });
  } catch (e) {
    console.error(e);
    res.send({ message: "Ocurrio un error", error: true });
  }
};

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cookies.token) throw new Error("Token no enviado");
    // Utiliza JWT para verificar si el token es válido. Y si es valido envía la información del usuario de vuelta
    jwt.verify(
      req.cookies.token,
      process.env.SECRET ?? "",
      async (err: any, decoded: any) => {
        if (err) {
          res.send({ message: "Token invalido", error: true });
        } else {
          let user = await Usuario.findOne({
            where: { id: decoded?.id },
            attributes: { exclude: ["contraseña"] },
          });
          res.send({ message: "Token valido", error: false, userdata: user });
        }
      },
    );
  } catch (e) {
    console.error(e);
    res.send({ message: "Usuario no logueado", error: true });
  }
};
export default { login, register, logout, checkAuth };
