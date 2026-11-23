import { Router } from "express";
import Negocio from "../models/Negocio";
import Adjunto from "../models/Adjunto";

const router = Router();

// GET /api/negocios
router.get("/", async (_req, res) => {
  try {
    const negocios = await Negocio.findAll({
      order: [["id", "DESC"]],
    });
    res.json(negocios);
  } catch (error) {
    console.error("Error al obtener negocios:", error);
    res.status(500).json({ message: "Error al obtener negocios" });
  }
});

// POST /api/negocios
router.post("/", async (req, res) => {
  try {
    const {
      empresaID,
      contactoID,
      vendedorID,
      cursoID,
      estado,
      montoTotal,
      fechaCierre,
    } = req.body;

    if (!empresaID || !vendedorID || !fechaCierre) {
      res.status(400).json({
        message: "empresaID, vendedorID y fechaCierre son obligatorios",
      });
      return;
    }

    const nuevoNegocio = await Negocio.create({
      empresaID: Number(empresaID),
      contactoID: contactoID ? Number(contactoID) : null,
      vendedorID: Number(vendedorID),
      cursoID: cursoID ? Number(cursoID) : null,
      estado: estado || "Abierto",
      montoTotal: Number(montoTotal) || 0,
      fechaCreacion: new Date(),
      fechaCierre: new Date(fechaCierre),
    });

    res.status(201).json(nuevoNegocio);
  } catch (error) {
    console.error("Error al crear negocio:", error);
    res.status(500).json({ message: "Error al crear el negocio" });
  }
});

// PATCH /api/negocios/:id/estado
router.patch("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ["Abierto", "Ganado", "Perdido/Vencido"];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({ message: "Estado no válido" });
      return;
    }

    const negocio = await Negocio.findByPk(id);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado" });
      return;
    }

    negocio.set("estado", estado);
    await negocio.save();

    res.json({
      negocio,
      derivadoAOperaciones: estado === "Ganado",
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ message: "Error al actualizar estado del negocio" });
  }
});

// Helper: verifica si existe OC adjunta para un negocio
async function tieneOCAdjunta(negocioID: number): Promise<boolean> {
  const adjuntos = await Adjunto.findAll({ where: { negocioID, deleted: false } });
  return adjuntos.some((a: any) => {
    const tipo = String(a.tipo || "").toUpperCase();
    return tipo === "OC" || tipo.includes("ORDEN");
  });
}

// Coordinar curso
async function coordinarCurso(req: any, res: any) {
  try {
    const { id } = req.params;
    const negocio: any = await Negocio.findByPk(id);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }
    const ok = await tieneOCAdjunta(Number(id));
    if (!ok) {
      res.status(400).json({
        message:
          "No se puede coordinar el curso: falta la Orden de Compra (OC) adjunta.",
        error: true,
        code: "OC_REQUERIDA",
      });
      return;
    }
    negocio.set("estadoOperacion", "Coordinado");
    negocio.set("fechaCoordinacion", new Date());
    await negocio.save();
    res.json({
      message: "Curso coordinado exitosamente",
      error: false,
      data: negocio,
    });
  } catch (error) {
    console.error("Error al coordinar curso:", error);
    res.status(500).json({ message: "Error al coordinar el curso", error: true });
  }
}

// Ejecutar curso
async function ejecutarCurso(req: any, res: any) {
  try {
    const { id } = req.params;
    const negocio: any = await Negocio.findByPk(id);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }
    const ok = await tieneOCAdjunta(Number(id));
    if (!ok) {
      res.status(400).json({
        message:
          "No se puede ejecutar el curso: falta la Orden de Compra (OC) adjunta.",
        error: true,
        code: "OC_REQUERIDA",
      });
      return;
    }
    negocio.set("estadoOperacion", "En ejecucion");
    negocio.set("fechaEjecucion", new Date());
    await negocio.save();
    res.json({
      message: "Curso en ejecucion",
      error: false,
      data: negocio,
    });
  } catch (error) {
    console.error("Error al ejecutar curso:", error);
    res.status(500).json({ message: "Error al ejecutar el curso", error: true });
  }
}

const rutasCoordinar = [
  "/:id/coordinar",
  "/:id/coordinacion",
  "/:id/coordinar-curso",
  "/:id/operaciones/coordinar",
];
const rutasEjecutar = [
  "/:id/ejecutar",
  "/:id/ejecucion",
  "/:id/ejecutar-curso",
  "/:id/operaciones/ejecutar",
];

for (const ruta of rutasCoordinar) {
  router.patch(ruta, coordinarCurso);
  router.post(ruta, coordinarCurso);
}
for (const ruta of rutasEjecutar) {
  router.patch(ruta, ejecutarCurso);
  router.post(ruta, ejecutarCurso);
}

// Validación OC para un negocio (alias adicional)
router.get("/:id/oc", async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await tieneOCAdjunta(Number(id));
    res.json({ message: "Validación realizada", error: false, data: { negocioID: Number(id), tieneOC: ok } });
  } catch (error) {
    res.status(500).json({ message: "Error al validar OC", error: true });
  }
});

export default router;
// --- Helpers HU-09: Condiciones y Plazos de Cobro B2B ---
function diasDesdeCondicion(input: any): number | null {
  if (input === null || input === undefined || input === "") return null;
  const s = String(input).trim().toLowerCase();
  if (s === "contado" || s === "0" || s === "0 dias" || s === "0 días") return 0;
  // Aceptar "30", "30 dias", "30 días", 30
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (![0, 30, 45, 60].includes(n)) return null;
  return n;
}

function normalizarCondicion(input: any, dias: number | null): string | null {
  if (dias === null) {
    if (input === null || input === undefined || input === "") return null;
    return String(input).trim();
  }
  if (dias === 0) return "Contado";
  return String(dias);
}

function sumarDias(fecha: any, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + (Number(dias) || 0));
  return d;
}

function enriquecerCobro(negocio: any) {
  const json = negocio && negocio.toJSON ? negocio.toJSON() : negocio;
  const dias =
    json.plazoCobroDias !== undefined && json.plazoCobroDias !== null
      ? Number(json.plazoCobroDias)
      : diasDesdeCondicion(json.condicionCobro);
  let fechaBase = json.fechaRecepcionOC || null;
  let fechaEstimada = json.fechaEstimadaCobro || null;
  if (!fechaEstimada && fechaBase && dias !== null) {
    fechaEstimada = sumarDias(fechaBase, dias).toISOString();
  }
  const estado = json.estadoCobro || "Pendiente";
  const vencida =
    !!fechaEstimada &&
    estado !== "Cobrado" &&
    new Date(fechaEstimada) < new Date();
  return {
    ...json,
    condicionCobro: json.condicionCobro ?? (dias === 0 ? "Contado" : dias !== null ? String(dias) : null),
    plazoCobroDias: dias,
    fechaRecepcionOC: fechaBase,
    fechaEstimadaCobro: fechaEstimada,
    estadoCobro: estado,
    vencida,
  };
}

async function obtenerCobro(req: any, res: any) {
  try {
    const { id } = req.params;
    const negocio: any = await Negocio.findByPk(id);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }
    res.json({
      message: "Condición de cobro obtenida correctamente",
      error: false,
      data: enriquecerCobro(negocio),
    });
  } catch (error) {
    console.error("Error al obtener condición de cobro:", error);
    res.status(500).json({ message: "Error al obtener condición de cobro", error: true });
  }
}

async function guardarCobro(req: any, res: any) {
  try {
    const { id } = req.params;
    const negocio: any = await Negocio.findByPk(id);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }

    const body = req.body || {};
    const plazoInput =
      body.plazo ??
      body.plazoCobro ??
      body.plazoPago ??
      body.condicion ??
      body.condicionCobro ??
      body.condicionPago ??
      body.dias ??
      body.plazoDias ??
      body.plazoCobroDias;

    let dias = diasDesdeCondicion(plazoInput);
    if (dias === null && (body.plazoCobroDias !== undefined || body.plazoDias !== undefined || body.dias !== undefined)) {
      const n = Number(body.plazoCobroDias ?? body.plazoDias ?? body.dias);
      if ([0, 30, 45, 60].includes(n)) dias = n;
    }
    if (dias === null) {
      // Permitir mantener valor previo si no se envía plazo
      dias =
        negocio.plazoCobroDias !== undefined && negocio.plazoCobroDias !== null
          ? Number(negocio.plazoCobroDias)
          : diasDesdeCondicion(negocio.condicionCobro);
    }

    const condicion = normalizarCondicion(plazoInput, dias);

    const fechaRecepcionRaw =
      body.fechaRecepcionOC ??
      body.fechaRecepcion ??
      body.fechaOC ??
      body.fechaBase ??
      body.fecha ??
      negocio.fechaRecepcionOC;
    const fechaRecepcionOC = fechaRecepcionRaw ? new Date(fechaRecepcionRaw) : null;

    const fechaEstimadaRaw =
      body.fechaEstimadaCobro ?? body.fechaEstimada ?? body.fechaVencimientoCobro;
    const fechaEstimadaCobro = fechaEstimadaRaw
      ? new Date(fechaEstimadaRaw)
      : fechaRecepcionOC && dias !== null
      ? sumarDias(fechaRecepcionOC, dias)
      : null;

    const estadoCobro = body.estadoCobro || body.estado || negocio.estadoCobro || "Pendiente";
    const observacionesCobro =
      body.observacionesCobro ?? body.observaciones ?? negocio.observacionesCobro ?? null;

    negocio.set("condicionCobro", condicion);
    negocio.set("plazoCobroDias", dias);
    negocio.set("fechaRecepcionOC", fechaRecepcionOC);
    negocio.set("fechaEstimadaCobro", fechaEstimadaCobro);
    negocio.set("estadoCobro", estadoCobro);
    negocio.set("observacionesCobro", observacionesCobro);
    await negocio.save();

    res.json({
      message: "Condición de cobro registrada correctamente",
      error: false,
      data: enriquecerCobro(negocio),
    });
  } catch (error) {
    console.error("Error al guardar condición de cobro:", error);
    res.status(500).json({ message: "Error al guardar condición de cobro", error: true });
  }
}

async function limpiarCobro(req: any, res: any) {
  try {
    const { id } = req.params;
    const negocio: any = await Negocio.findByPk(id);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }
    negocio.set("condicionCobro", null);
    negocio.set("plazoCobroDias", null);
    negocio.set("fechaRecepcionOC", null);
    negocio.set("fechaEstimadaCobro", null);
    negocio.set("estadoCobro", "Pendiente");
    negocio.set("observacionesCobro", null);
    await negocio.save();
    res.json({ message: "Condición de cobro eliminada", error: false, data: enriquecerCobro(negocio) });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar condición de cobro", error: true });
  }
}

const rutasCobro = [
  "/:id/cobro",
  "/:id/condicion-cobro",
  "/:id/plazo-cobro",
  "/:id/condiciones-cobro",
  "/:id/cobro-condicion",
];
for (const ruta of rutasCobro) {
  router.get(ruta, obtenerCobro);
  router.post(ruta, guardarCobro);
  router.patch(ruta, guardarCobro);
  router.put(ruta, guardarCobro);
}
router.delete("/:id/cobro", limpiarCobro);
router.delete("/:id/condicion-cobro", limpiarCobro);
