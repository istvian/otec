import express from "express";
import * as cursoController from "../controllers/cursoController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";
import Adjunto from "../models/Adjunto";
import Negocio from "../models/Negocio";
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

async function tieneOCParaCurso(cursoID: number): Promise<boolean> {
  // Adjunto directo al curso
  const directos = await Adjunto.findAll({ where: { cursoID, deleted: false } });
  if (directos.some((a: any) => {
    const t = String(a.tipo || "").toUpperCase();
    return t === "OC" || t.includes("ORDEN");
  })) return true;
  // O adjunto a un negocio asociado al curso
  const negocios = await Negocio.findAll({ where: { cursoID } });
  for (const n of negocios as any[]) {
    const adjs = await Adjunto.findAll({ where: { negocioID: n.id, deleted: false } });
    if (adjs.some((a: any) => {
      const t = String(a.tipo || "").toUpperCase();
      return t === "OC" || t.includes("ORDEN");
    })) return true;
  }
  return false;
}

for (const ruta of ["/:id/coordinar", "/:id/ejecutar", "/:id/coordinar-curso", "/:id/ejecutar-curso"]) {
  const esCoord = ruta.includes("coordinar");
  router.patch(ruta, verificarRol(RolEnum.CUALQUIERA), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await tieneOCParaCurso(id);
      if (!ok) {
        res.status(400).json({
          message: `No se puede ${esCoord ? "coordinar" : "ejecutar"} el curso: falta la Orden de Compra (OC) adjunta.`,
          error: true,
          code: "OC_REQUERIDA",
        });
        return;
      }
      res.json({
        message: `Curso ${esCoord ? "coordinado" : "en ejecucion"} exitosamente`,
        error: false,
      });
    } catch (e) {
      res.status(500).json({ message: "Error", error: true });
    }
  });
  router.post(ruta, verificarRol(RolEnum.CUALQUIERA), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await tieneOCParaCurso(id);
      if (!ok) {
        res.status(400).json({
          message: `No se puede ${esCoord ? "coordinar" : "ejecutar"} el curso: falta la Orden de Compra (OC) adjunta.`,
          error: true,
          code: "OC_REQUERIDA",
        });
        return;
      }
      res.json({
        message: `Curso ${esCoord ? "coordinado" : "en ejecucion"} exitosamente`,
        error: false,
      });
    } catch (e) {
      res.status(500).json({ message: "Error", error: true });
    }
  });
}

export default router;
