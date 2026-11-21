import express from "express";
import * as cursoComercialController from "../controllers/cursoComercialController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";
var router = express.Router();

router.get(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  cursoComercialController.obtenerCursosComercial,
);
router.get(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cursoComercialController.obtenerCursoComercialPorId,
);
router.post(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  cursoComercialController.crearCursoComercial,
);
router.patch(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cursoComercialController.obtenerCursoComercialPorId,
);
router.delete(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cursoComercialController.eliminarCursoComercial,
);

export default router;
