import { Router } from "express";
import Negocio from "../models/Negocio";

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

export default router;