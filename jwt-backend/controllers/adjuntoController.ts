import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { Adjunto, Negocio, Relator } from "../models";
import { RolEnum } from "../middlewares/rolEnum";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "adjuntos");

// Asegura que el directorio de uploads exista.
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // ignore
}

const normalizarTipo = (tipo: unknown): string => {
  const t = String(tipo || "").trim().toLowerCase();
  if (t === "oc" || t === "orden_compra" || t === "orden de compra") {
    return "OC";
  }
  if (t === "nomina" || t === "nómina" || t === "nomina_participantes") {
    return "Nomina";
  }
  if (
    t === "contrato" ||
    t === "contract" ||
    t === "contrato_servicios" ||
    t === "contrato de servicios"
  ) {
    return "Contrato";
  }
  // Permitir valores ya normalizados.
  if (tipo === "OC" || tipo === "Nomina") return String(tipo);
  return tipo ? String(tipo) : "OC";
};

const esTipoOC = (tipo: string) =>
  String(tipo).toUpperCase() === "OC" ||
  String(tipo).toLowerCase().includes("orden");

export async function listarAdjuntos(req: Request, res: Response): Promise<void> {
  try {
    const where: any = { deleted: false };
    const nid =
      req.query.negocioID || req.query.negocioId || req.query.negocio_id || req.query.idNegocio;
    const cid = req.query.cursoID || req.query.cursoId || req.query.curso_id || req.query.idCurso;
    if (nid) where.negocioID = Number(nid);
    if (cid) where.cursoID = Number(cid);
    if (req.query.tipo) where.tipo = normalizarTipo(req.query.tipo);

    const adjuntosRaw = await Adjunto.findAll({
      where,
      order: [["id", "DESC"]],
      include: [{ model: Relator, as: "relator" }],
    });

    let adjuntos = adjuntosRaw;
    if (!esPerfilAutorizadoRelator(req)) {
      // Los contratos de relator (y sus honorarios) solo son visibles para perfiles autorizados.
      adjuntos = adjuntosRaw.filter((a: any) => !esTipoContrato(a.tipo));
    }

    // Sanitizar honorarios para perfiles no autorizados (por seguridad).
    const data = adjuntos.map((a: any) => {
      const json = a.toJSON ? a.toJSON() : a;
      if (!esPerfilAutorizadoRelator(req)) {
        delete json.honorarios;
        delete json.relator;
      }
      return json;
    });

    res.json({ message: "Adjuntos obtenidos correctamente", error: false, data });
  } catch (error: any) {
    console.error("Error al listar adjuntos:", error);
    res.status(500).json({ message: "Error al obtener adjuntos", error: true });
  }
}

export async function obtenerAdjunto(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adjunto: any = await Adjunto.findOne({
      where: { id, deleted: false },
      include: [{ model: Relator, as: "relator" }],
    });
    if (!adjunto) {
      res.status(404).json({ message: "Adjunto no encontrado", error: true });
      return;
    }
    if (esTipoContrato(adjunto.tipo) && !esPerfilAutorizadoRelator(req)) {
      res.status(403).json({ message: "No tienes permisos para ver este contrato.", error: true });
      return;
    }
    const json = adjunto.toJSON ? adjunto.toJSON() : adjunto;
    if (!esPerfilAutorizadoRelator(req)) {
      delete json.honorarios;
      delete json.relator;
    }
    res.json({ message: "Adjunto obtenido correctamente", error: false, data: json });
  } catch (error: any) {
    console.error("Error al obtener adjunto:", error);
    res.status(500).json({ message: "Error al obtener el adjunto", error: true });
  }
}

export async function subirAdjunto(req: Request, res: Response): Promise<void> {
  try {
    const files = (req as any).files;
    let file =
      (req as any).file ||
      (Array.isArray(files) && files.length ? files[0] : null);

    // Soporte para carga en base64 vía JSON (compatibilidad)
    if (!file) {
      const body = req.body || {};
      const b64 =
        body.archivoBase64 ||
        body.fileBase64 ||
        body.base64 ||
        body.archivo ||
        body.file;
      if (typeof b64 === "string" && b64.trim()) {
        const cleaned = b64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(cleaned, "base64");
        const nombre = body.nombreArchivo || body.nombre || "adjunto";
        const ext = path.extname(nombre) || "";
        const filename = `${Date.now()}_${path.basename(nombre, ext).replace(/[^a-zA-Z0-9_-]/g, "_")}${ext}`;
        const filePath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        file = {
          originalname: nombre,
          filename,
          path: filePath,
          mimetype: body.mimeType || body.tipoMime || "application/octet-stream",
          size: buffer.length,
        };
      }
    }

    if (!file) {
      res.status(400).json({ message: "Debe adjuntar un archivo", error: true });
      return;
    }

    const body = req.body || {};
    const tipo = normalizarTipo(body.tipo || body.tipoAdjunto || body.tipo_archivo);

    if (esTipoContrato(tipo) && !esPerfilAutorizadoRelator(req)) {
      if (file?.path) try { fs.unlinkSync(file.path); } catch {}
      res.status(403).json({
        message: "No tienes permisos para subir contratos de relator.",
        error: true,
      });
      return;
    }
    const negocioID = (body.negocioID || body.negocioId || body.negocio_id || body.idNegocio)
      ? Number(body.negocioID || body.negocioId || body.negocio_id || body.idNegocio)
      : null;
    const cursoID = (body.cursoID || body.cursoId || body.curso_id || body.idCurso)
      ? Number(body.cursoID || body.cursoId || body.curso_id || body.idCurso)
      : null;

    if (negocioID) {
      const negocio = await Negocio.findByPk(negocioID);
      if (!negocio) {
        // limpiar archivo subido
        try { fs.unlinkSync(file.path); } catch {}
        res.status(404).json({ message: "Negocio no encontrado", error: true });
        return;
      }
    }

    const usuarioJwt: any = (req as any).user;
    const usuarioID = usuarioJwt?.id ? Number(usuarioJwt.id) : null;

    const relatorID = body.relatorID || body.relatorId || body.relator_id
      ? Number(body.relatorID || body.relatorId || body.relator_id)
      : null;
    const modalidad = body.modalidad ? String(body.modalidad) : null;
    const honorarios =
      body.honorarios !== undefined && body.honorarios !== null && body.honorarios !== ""
        ? Number(body.honorarios)
        : null;

    if (relatorID) {
      const relator = await Relator.findByPk(relatorID);
      if (!relator) {
        if (file?.path) try { fs.unlinkSync(file.path); } catch {}
        res.status(404).json({ message: "Relator no encontrado", error: true });
        return;
      }
    }

    const adjunto = await Adjunto.create({
      negocioID,
      cursoID,
      tipo,
      nombreArchivo: file.originalname,
      ruta: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      descripcion: body.descripcion || null,
      usuarioID,
      relatorID,
      modalidad,
      honorarios,
      deleted: false,
    });

    res.status(201).json({
      message: "Adjunto subido exitosamente",
      error: false,
      data: adjunto,
    });
  } catch (error: any) {
    console.error("Error al subir adjunto:", error);
    const file = (req as any).file;
    if (file?.path) try { fs.unlinkSync(file.path); } catch {}
    res.status(500).json({ message: "Error al subir el adjunto", error: true });
  }
}

export async function descargarAdjunto(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adjunto: any = await Adjunto.findOne({ where: { id, deleted: false } });
    if (!adjunto) {
      res.status(404).json({ message: "Adjunto no encontrado", error: true });
      return;
    }
    if (esTipoContrato(adjunto.tipo) && !esPerfilAutorizadoRelator(req)) {
      res.status(403).json({ message: "No tienes permisos para descargar este contrato.", error: true });
      return;
    }
    const filePath = path.join(UPLOAD_DIR, adjunto.ruta);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Archivo no encontrado en el servidor", error: true });
      return;
    }
    res.setHeader("Content-Type", adjunto.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${adjunto.nombreArchivo}"`,
    );
    res.sendFile(filePath);
  } catch (error: any) {
    console.error("Error al descargar adjunto:", error);
    res.status(500).json({ message: "Error al descargar el adjunto", error: true });
  }
}

export async function eliminarAdjunto(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adjunto: any = await Adjunto.findOne({ where: { id, deleted: false } });
    if (!adjunto) {
      res.status(404).json({ message: "Adjunto no encontrado", error: true });
      return;
    }
    await adjunto.update({ deleted: true });
    res.json({ message: "Adjunto eliminado exitosamente", error: false });
  } catch (error: any) {
    console.error("Error al eliminar adjunto:", error);
    res.status(500).json({ message: "Error al eliminar el adjunto", error: true });
  }
}

export async function tieneOC(req: Request, res: Response): Promise<void> {
  try {
    const paramId =
      req.params.negocioID ||
      req.params.id ||
      req.params.negocioId ||
      req.params.cursoID ||
      req.params.cursoId;
    const queryId =
      req.query.negocioID ||
      req.query.negocioId ||
      req.query.negocio_id ||
      req.query.idNegocio ||
      req.query.cursoID ||
      req.query.cursoId ||
      req.query.curso_id ||
      req.query.idCurso ||
      req.query.id;
    const id = paramId ? Number(paramId) : queryId ? Number(queryId) : null;

    // Determinar si se consulta por curso o por negocio
    const esCurso =
      !!(req.params.cursoID || req.params.cursoId || req.query.cursoID || req.query.cursoId || req.query.curso_id || req.query.idCurso);

    if (!id) {
      res.status(400).json({ message: "id es obligatorio", error: true });
      return;
    }

    const where: any = { deleted: false };
    if (esCurso) where.cursoID = id;
    else where.negocioID = id;

    const adjuntos = await Adjunto.findAll({ where });
    // Si es por negocio, también considerar adjuntos por curso asociado
    let todos = adjuntos;
    if (!esCurso) {
      // buscar negocio para obtener cursoID
      try {
        const neg: any = await Negocio.findByPk(id);
        if (neg?.cursoID) {
          const porCurso = await Adjunto.findAll({
            where: { cursoID: neg.cursoID, deleted: false },
          });
          todos = adjuntos.concat(porCurso);
        }
      } catch {}
    }

    const oc = todos.find((a: any) => esTipoOC(a.tipo));
    const key = esCurso ? "cursoID" : "negocioID";
    res.json({
      message: "Validación realizada",
      error: false,
      data: { [key]: id, tieneOC: !!oc, oc: oc || null },
    });
  } catch (error: any) {
    console.error("Error al validar OC:", error);
    res.status(500).json({ message: "Error al validar OC", error: true });
  }
}

const ROLES_AUTORIZADOS_RELATOR = [
  RolEnum.OPERADOR,
  RolEnum.RRHH,
  RolEnum.ADMINISTRADOR,
];

export const esPerfilAutorizadoRelator = (req: Request): boolean => {
  const userRolId = Number(
    (req as any).user?.rol?.id !== undefined
      ? (req as any).user.rol.id
      : (req as any).user?.rol,
  );
  return ROLES_AUTORIZADOS_RELATOR.includes(userRolId);
};

export const esTipoContrato = (tipo: string) =>
  String(tipo).toLowerCase() === "contrato";

export { esTipoOC, normalizarTipo };