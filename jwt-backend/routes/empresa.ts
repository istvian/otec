import express from "express";
import * as empresaController from "../controllers/empresaController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";
var router = express.Router();

router.get(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  empresaController.obtenerEmpresas,
);
router.get(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  empresaController.obtenerEmpresaPorId,
);
router.get(
  "/correos/:id",
  verificarRol(RolEnum.CUALQUIERA),
  empresaController.obtenerCorreosEmpresa,
);
router.post(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  empresaController.crearEmpresa,
);
router.patch(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  empresaController.actualizarEmpresa,
);
router.delete(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  empresaController.eliminarEmpresa,
);

export default router;
