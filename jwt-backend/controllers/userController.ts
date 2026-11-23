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
      res
        .status(400)
        .send({ message: "Error: Datos incorrectos", error: true });
    }
  } catch (e) {
    console.error(e);
    res.status(400).send({ message: "Ocurrio un error", error: true });
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
    // CHEQUEAR SI LA CONTRASEÑA ES SEGURA: MINIMO 8 CARACTERES, 1 MAYUSCULA, 1 MINUSCULA, 1 NUMERO Y 1 SIMBOLO
    const passwordRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_]).{8,}$",
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
    if (!req.cookies.token) {
      res.send({ message: "Usuario no logueado", error: true });
      return;
    }
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

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rolIdQuery = req.query.rolID ? Number(req.query.rolID) : null;
    const whereClause: any = { deleted: false };
    if (rolIdQuery) whereClause.rolID = rolIdQuery;

    const users = await Usuario.findAll({
      where: whereClause,
      attributes: ["id", "nombre", "correo", "rolID", "activo", "deleted"],
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre", "descripcion"] }],
      order: [["id", "DESC"]],
    });

    res.send({
      message: "Usuarios obtenidos correctamente",
      error: false,
      data: users,
    });
  } catch (e) {
    console.error(e);
    res.send({ message: "Ocurrio un error", error: true });
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await Usuario.findOne({
      where: { id, deleted: false },
      attributes: { exclude: ["contraseña"] },
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre", "descripcion"] }],
    });
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado", error: true });
      return;
    }
    res.send({ message: "Usuario obtenido correctamente", error: false, data: user });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Ocurrio un error", error: true });
  }
};

const validatePassword = (password: string) => {
  const passwordRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_]).{8,}$",
  );
  return passwordRegex.test(password);
};

const createUserAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, correo, contraseña, rolID } = req.body || {};
    if (!nombre || !correo || !contraseña) throw new Error("Datos erroneos");

    const mailRegex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
    if (!mailRegex.test(correo)) throw new Error("El mail no es valido");
    if (!validatePassword(contraseña))
      throw new Error("La contraseña no cumple con los requisitos");

    const hashedPassword = await passwordHelper.HashPassword(contraseña);
    const user = await Usuario.create({
      correo,
      contraseña: hashedPassword,
      nombre,
      rolID: rolID ? Number(rolID) : 1,
      activo: true,
      deleted: false,
    });
    const safeUser = await Usuario.findByPk((user as any).id, {
      attributes: { exclude: ["contraseña"] },
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre", "descripcion"] }],
    });
    res.status(201).send({ message: "Usuario creado correctamente", error: false, data: safeUser });
  } catch (e: any) {
    console.error(e);
    res.status(400).send({ message: e?.message || "Ocurrio un error", error: true });
  }
};

const updateUserAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user: any = await Usuario.findOne({ where: { id, deleted: false } });
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado", error: true });
      return;
    }
    const { nombre, correo, contraseña, rolID, activo } = req.body || {};
    if (nombre !== undefined) user.set("nombre", nombre);
    if (correo !== undefined) {
      const mailRegex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
      if (!mailRegex.test(correo)) {
        res.status(400).json({ message: "El mail no es valido", error: true });
        return;
      }
      user.set("correo", correo);
    }
    if (rolID !== undefined) user.set("rolID", Number(rolID));
    if (activo !== undefined) user.set("activo", !!activo);
    if (contraseña) {
      if (!validatePassword(contraseña)) {
        res.status(400).json({ message: "La contraseña no cumple con los requisitos", error: true });
        return;
      }
      const hashedPassword = await passwordHelper.HashPassword(contraseña);
      user.set("contraseña", hashedPassword);
    }
    await user.save();
    const safeUser = await Usuario.findByPk(id, {
      attributes: { exclude: ["contraseña"] },
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre", "descripcion"] }],
    });
    res.send({ message: "Usuario actualizado correctamente", error: false, data: safeUser });
  } catch (e: any) {
    console.error(e);
    res.status(400).send({ message: e?.message || "Ocurrio un error", error: true });
  }
};

const deleteUserAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    if (currentUser?.id && Number(currentUser.id) === Number(id)) {
      res.status(400).json({ message: "No puedes eliminar tu propio usuario", error: true });
      return;
    }
    const user: any = await Usuario.findOne({ where: { id, deleted: false } });
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado", error: true });
      return;
    }
    await user.update({ deleted: true, activo: false });
    res.send({ message: "Usuario eliminado correctamente", error: false });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Ocurrio un error", error: true });
  }
};

export default { login, register, logout, checkAuth, getAllUsers, getUserById, createUserAdmin, updateUserAdmin, deleteUserAdmin };
