import express from "express";
import userController from "../controllers/userController";
var router = express.Router();
import rateLimit from "express-rate-limit";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de bloqueo: 15 minutos
  max: 3, // Máximo 3 intentos fallidos
  skipSuccessfulRequests: true, // Clave: si el login responde 2xx (éxito), no suma al contador
  standardHeaders: true, // Devuelve info del límite en los headers `RateLimit-*`
  legacyHeaders: false,

  // Opción A: Mensaje directo en JSON
  message: {
    error: true,
    message:
      "Demasiados intentos fallidos. Por seguridad, intenta nuevamente en 15 minutos.",
  },
});
router.post("/login", loginLimiter, userController.login);
router.post("/register", userController.register);
router.get("/check", userController.checkAuth);
router.get("/logout", userController.logout);
router.get("/", userController.getAllUsers);
router.get("/:id", verificarRol(RolEnum.CUALQUIERA), userController.getUserById);
router.post("/", verificarRol(RolEnum.ADMINISTRADOR), userController.createUserAdmin);
router.patch("/:id", verificarRol(RolEnum.ADMINISTRADOR), userController.updateUserAdmin);
router.delete("/:id", verificarRol(RolEnum.ADMINISTRADOR), userController.deleteUserAdmin);

export default router;
