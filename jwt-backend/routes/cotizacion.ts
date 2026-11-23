import express from "express";
import * as cotizacionController from "../controllers/cotizacionController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";

const router = express.Router();

// ================= RUTAS PÚBLICAS (solo lectura, sin sesión) =================
router.get(
  "/public/:token/pdf",
  cotizacionController.descargarPdfCotizacionPublica,
);
router.get(
  "/public/:token",
  cotizacionController.obtenerCotizacionPublica,
);

// ================= RUTAS PRIVADAS =================
router.get(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.obtenerCotizaciones,
);
router.post(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.crearCotizacion,
);
router.get(
  "/vencidas",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.obtenerCotizacionesVencidas,
);
router.get(
  "/:id/pdf",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.descargarPdfCotizacion,
);
router.get(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.obtenerCotizacionPorId,
);
router.patch(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.actualizarCotizacion,
);
for (const ruta of ["/:id/revalidar", "/:id/reactivar", "/:id/extender", "/:id/revalidacion"]) {
  router.post(
    ruta,
    verificarRol(RolEnum.CUALQUIERA),
    cotizacionController.revalidarCotizacion,
  );
  router.patch(
    ruta,
    verificarRol(RolEnum.CUALQUIERA),
    cotizacionController.revalidarCotizacion,
  );
}

router.delete(
  "/:id",
  verificarRol(RolEnum.CUALQUIERA),
  cotizacionController.eliminarCotizacion,
);

export default router;
