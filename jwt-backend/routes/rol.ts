import express from "express";
import * as rolController from "../controllers/rolController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";

const router = express.Router();

router.get("/", verificarRol(RolEnum.CUALQUIERA), rolController.listarRoles);
router.get("/:id", verificarRol(RolEnum.CUALQUIERA), rolController.obtenerRol);
router.post("/", verificarRol(RolEnum.ADMINISTRADOR), rolController.crearRol);
router.patch("/:id", verificarRol(RolEnum.ADMINISTRADOR), rolController.actualizarRol);
router.delete("/:id", verificarRol(RolEnum.ADMINISTRADOR), rolController.eliminarRol);

export default router;