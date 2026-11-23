import express from "express";
import * as relatorController from "../controllers/relatorController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";

const router = express.Router();

router.get("/", verificarRol(RolEnum.CUALQUIERA), relatorController.listarRelatores);
router.get("/:id", verificarRol(RolEnum.CUALQUIERA), relatorController.obtenerRelator);
router.post("/", verificarRol(RolEnum.CUALQUIERA), relatorController.crearRelator);
router.patch("/:id", verificarRol(RolEnum.CUALQUIERA), relatorController.actualizarRelator);
router.delete("/:id", verificarRol(RolEnum.CUALQUIERA), relatorController.eliminarRelator);

export default router;
