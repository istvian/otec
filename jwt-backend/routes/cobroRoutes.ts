import { Router } from "express";
import Negocio from "../models/Negocio";
import { verificarRol } from "../middlewares/authMiddleware";
import { RolEnum } from "../middlewares/rolEnum";

const router = Router();

function diasDesdeCondicion(input: any): number | null {
  if (input === null || input === undefined || input === "") return null;
  const s = String(input).trim().toLowerCase();
  if (s === "contado" || s === "0") return 0;
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (![0, 30, 45, 60].includes(n)) return null;
  return n;
}

function sumarDias(fecha: any, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + (Number(dias) || 0));
  return d;
}

function enriquecer(negocio: any) {
  const json = negocio && negocio.toJSON ? negocio.toJSON() : negocio;
  const dias =
    json.plazoCobroDias !== undefined && json.plazoCobroDias !== null
      ? Number(json.plazoCobroDias)
      : diasDesdeCondicion(json.condicionCobro);
  const fechaBase = json.fechaRecepcionOC || null;
  let fechaEstimada = json.fechaEstimadaCobro || null;
  if (!fechaEstimada && fechaBase && dias !== null) {
    fechaEstimada = sumarDias(fechaBase, dias).toISOString();
  }
  const estado = json.estadoCobro || "Pendiente";
  const vencida =
    !!fechaEstimada && estado !== "Cobrado" && new Date(fechaEstimada) < new Date();
  return {
    ...json,
    condicionCobro:
      json.condicionCobro ?? (dias === 0 ? "Contado" : dias !== null ? String(dias) : null),
    plazoCobroDias: dias,
    fechaRecepcionOC: fechaBase,
    fechaEstimadaCobro: fechaEstimada,
    estadoCobro: estado,
    vencida,
  };
}

// Listado de cuentas por cobrar / condiciones de cobro
router.get("/", verificarRol(RolEnum.CUALQUIERA), async (req, res) => {
  try {
    const where: any = {};
    const nid = req.query.negocioID || req.query.negocioId || req.query.id;
    if (nid) where.id = Number(nid);

    const negocios = await Negocio.findAll({ where, order: [["id", "DESC"]] });
    let data = negocios.map(enriquecer);

    // Filtro: solo los que tienen condición registrada
    if (String(req.query.soloConCobro || req.query.conCobro || "") === "true") {
      data = data.filter((n: any) => n.plazoCobroDias !== null || n.condicionCobro);
    }
    if (req.query.estadoCobro) {
      data = data.filter((n: any) => String(n.estadoCobro) === String(req.query.estadoCobro));
    }
    if (String(req.query.vencida || "") === "true") {
      data = data.filter((n: any) => n.vencida);
    }

    res.json({ message: "Cuentas por cobrar obtenidas correctamente", error: false, data });
  } catch (error) {
    console.error("Error al listar cuentas por cobrar:", error);
    res.status(500).json({ message: "Error al obtener cuentas por cobrar", error: true });
  }
});

// Detalle por negocio
router.get("/:negocioID", verificarRol(RolEnum.CUALQUIERA), async (req, res) => {
  try {
    const negocio: any = await Negocio.findByPk(req.params.negocioID);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }
    res.json({ message: "OK", error: false, data: enriquecer(negocio) });
  } catch (error) {
    res.status(500).json({ message: "Error", error: true });
  }
});

// Crear/actualizar condición por negocio (upsert)
async function upsert(req: any, res: any) {
  try {
    const negocioID = req.params.negocioID || req.body.negocioID || req.body.negocioId || req.body.id;
    const negocio: any = await Negocio.findByPk(negocioID);
    if (!negocio) {
      res.status(404).json({ message: "Negocio no encontrado", error: true });
      return;
    }
    const body = req.body || {};
    const plazoInput =
      body.plazo ?? body.plazoCobro ?? body.plazoPago ?? body.condicion ?? body.condicionCobro ?? body.condicionPago ?? body.dias ?? body.plazoDias ?? body.plazoCobroDias;
    let dias = diasDesdeCondicion(plazoInput);
    if (dias === null && (body.plazoCobroDias !== undefined || body.plazoDias !== undefined || body.dias !== undefined)) {
      const n = Number(body.plazoCobroDias ?? body.plazoDias ?? body.dias);
      if ([0, 30, 45, 60].includes(n)) dias = n;
    }
    if (dias === null) {
      dias =
        negocio.plazoCobroDias !== undefined && negocio.plazoCobroDias !== null
          ? Number(negocio.plazoCobroDias)
          : diasDesdeCondicion(negocio.condicionCobro);
    }
    const condicion = dias === null ? (plazoInput ? String(plazoInput).trim() : negocio.condicionCobro) : dias === 0 ? "Contado" : String(dias);

    const fechaRecepcionRaw =
      body.fechaRecepcionOC ?? body.fechaRecepcion ?? body.fechaOC ?? body.fechaBase ?? body.fecha ?? negocio.fechaRecepcionOC;
    const fechaRecepcionOC = fechaRecepcionRaw ? new Date(fechaRecepcionRaw) : null;

    const fechaEstimadaRaw = body.fechaEstimadaCobro ?? body.fechaEstimada ?? body.fechaVencimientoCobro;
    const fechaEstimadaCobro = fechaEstimadaRaw
      ? new Date(fechaEstimadaRaw)
      : fechaRecepcionOC && dias !== null
      ? sumarDias(fechaRecepcionOC, dias)
      : null;

    const estadoCobro = body.estadoCobro || body.estado || negocio.estadoCobro || "Pendiente";
    const observacionesCobro = body.observacionesCobro ?? body.observaciones ?? negocio.observacionesCobro ?? null;

    negocio.set("condicionCobro", condicion);
    negocio.set("plazoCobroDias", dias);
    negocio.set("fechaRecepcionOC", fechaRecepcionOC);
    negocio.set("fechaEstimadaCobro", fechaEstimadaCobro);
    negocio.set("estadoCobro", estadoCobro);
    negocio.set("observacionesCobro", observacionesCobro);
    await negocio.save();

    res.status(201).json({
      message: "Condición de cobro registrada correctamente",
      error: false,
      data: enriquecer(negocio),
    });
  } catch (error) {
    console.error("Error al guardar condición de cobro:", error);
    res.status(500).json({ message: "Error al guardar condición de cobro", error: true });
  }
}

router.post("/", verificarRol(RolEnum.CUALQUIERA), upsert);
router.post("/:negocioID", verificarRol(RolEnum.CUALQUIERA), upsert);
router.patch("/:negocioID", verificarRol(RolEnum.CUALQUIERA), upsert);
router.put("/:negocioID", verificarRol(RolEnum.CUALQUIERA), upsert);

// Limpiar condición
router.delete("/:negocioID", verificarRol(RolEnum.CUALQUIERA), async (req, res) => {
  try {
    const negocio: any = await Negocio.findByPk(req.params.negocioID);
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
    res.json({ message: "Condición de cobro eliminada", error: false, data: enriquecer(negocio) });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar condición de cobro", error: true });
  }
});

export default router;
