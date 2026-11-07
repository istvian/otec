import express from "express";
import * as cursoController from "../controllers/cursoController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";
var router = express.Router();

router.get(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  cursoController.obtenerCursos,
);
router.get(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cursoController.obtenerCursoPorId,
);
router.post("/", verificarRol(RolEnum.CUALQUIERA), cursoController.crearCurso);
router.patch(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cursoController.actualizarCurso,
);
router.delete(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cursoController.eliminarCurso,
);

export default router;
