import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as adjuntoController from "../controllers/adjuntoController";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "adjuntos");
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido. Solo PDF o Excel."));
  },
});

// Listado
router.get("/", verificarRol(RolEnum.CUALQUIERA), adjuntoController.listarAdjuntos);

// Validación de OC (varias rutas/alias)
for (const ruta of [
  "/validar-oc/:negocioID",
  "/validar/:negocioID",
  "/tiene-oc/:negocioID",
  "/oc/:negocioID",
]) {
  router.get(ruta, verificarRol(RolEnum.CUALQUIERA), adjuntoController.tieneOC);
}
router.get(
  "/validar-oc",
  verificarRol(RolEnum.CUALQUIERA),
  adjuntoController.tieneOC,
);

// Descarga
router.get(
  "/:id/descargar",
  verificarRol(RolEnum.CUALQUIERA),
  adjuntoController.descargarAdjunto,
);
router.get(
  "/:id/download",
  verificarRol(RolEnum.CUALQUIERA),
  adjuntoController.descargarAdjunto,
);

// Detalle
router.get("/:id", verificarRol(RolEnum.CUALQUIERA), adjuntoController.obtenerAdjunto);

// Subida
router.post(
  "/",
  verificarRol(RolEnum.CUALQUIERA),
  upload.any(),
  adjuntoController.subirAdjunto,
);

// Subida con negocioID en la ruta
router.post(
  "/:negocioID",
  verificarRol(RolEnum.CUALQUIERA),
  upload.any(),
  (req, res, next) => {
    if (!req.body) req.body = {};
    if (!req.body.negocioID) req.body.negocioID = req.params.negocioID;
    next();
  },
  adjuntoController.subirAdjunto,
);
router.post(
  "/upload",
  verificarRol(RolEnum.CUALQUIERA),
  upload.any(),
  adjuntoController.subirAdjunto,
);
router.post(
  "/subir",
  verificarRol(RolEnum.CUALQUIERA),
  upload.any(),
  adjuntoController.subirAdjunto,
);

// Eliminación
router.delete("/:id", verificarRol(RolEnum.CUALQUIERA), adjuntoController.eliminarAdjunto);

export default router;