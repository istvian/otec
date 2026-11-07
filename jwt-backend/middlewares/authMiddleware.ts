import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RolEnum } from "./rolEnum";

dotenv.config();

export const verificarRol = (rolRequerido: RolEnum) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Intentar obtener el token desde las cookies o desde el header Authorization (Bearer token)
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(401).json({ message: "Acceso denegado. Token no proporcionado.", error: true });
        return;
      }

      const secret = process.env.SECRET || "";

      jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
          res.status(403).json({ message: "Token inválido o expirado.", error: true });
          return;
        }

        // Extraer el rol del payload del JWT
        // Puede venir como un objeto rol con id o directamente como numero/id según cómo se haya generado el token
        const userRolId = decoded.rol?.id !== undefined ? Number(decoded.rol.id) : Number(decoded.rol);

        // Si el rol requerido es CUALQUIERA (6), solo basta con que esté autenticado (token válido)
        if (rolRequerido === RolEnum.CUALQUIERA) {
          (req as any).user = decoded;
          return next();
        }

        // Si el usuario es ADMINISTRADOR (5), siempre tiene acceso
        if (userRolId === RolEnum.ADMINISTRADOR) {
          (req as any).user = decoded;
          return next();
        }

        // Revisar si el rol del usuario es idéntico al requerido
        if (userRolId === rolRequerido) {
          (req as any).user = decoded;
          return next();
        }

        res.status(403).json({ message: "No tienes permisos suficientes para realizar esta acción.", error: true });
      });
    } catch (e: any) {
      res.status(500).json({ message: "Error interno en el middleware de autenticación", error: e.message });
    }
  };
};
