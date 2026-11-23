import { Request, Response } from "express";
import { Relator } from "../models";
import { RolEnum } from "../middlewares/rolEnum";



export async function listarRelatores(req: Request, res: Response): Promise<void> {
  try {
    const where: any = { deleted: false };
    if (req.query.activo !== undefined) {
      where.activo = req.query.activo === "true" || req.query.activo === "1";
    }
    const relatores = await Relator.findAll({ where, order: [["id", "DESC"]] });
    res.json({ message: "Relatores obtenidos correctamente", error: false, data: relatores });
  } catch (error: any) {
    console.error("Error al listar relatores:", error);
    res.status(500).json({ message: "Error al obtener relatores", error: true });
  }
}

export async function obtenerRelator(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const relator: any = await Relator.findOne({ where: { id, deleted: false } });
    if (!relator) {
      res.status(404).json({ message: "Relator no encontrado", error: true });
      return;
    }
    res.json({ message: "Relator obtenido correctamente", error: false, data: relator });
  } catch (error: any) {
    console.error("Error al obtener relator:", error);
    res.status(500).json({ message: "Error al obtener el relator", error: true });
  }
}

export async function crearRelator(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, correo, telefono, rut, especialidad, activo } = req.body || {};
    if (!nombre) {
      res.status(400).json({ message: "El nombre del relator es obligatorio", error: true });
      return;
    }
    const relator = await Relator.create({
      nombre,
      correo: correo || null,
      telefono: telefono || null,
      rut: rut || null,
      especialidad: especialidad || null,
      activo: activo === undefined ? true : !!activo,
      deleted: false,
    });
    res.status(201).json({ message: "Relator creado exitosamente", error: false, data: relator });
  } catch (error: any) {
    console.error("Error al crear relator:", error);
    res.status(500).json({ message: "Error al crear el relator", error: true });
  }
}

export async function actualizarRelator(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const relator: any = await Relator.findOne({ where: { id, deleted: false } });
    if (!relator) {
      res.status(404).json({ message: "Relator no encontrado", error: true });
      return;
    }
    const { nombre, correo, telefono, rut, especialidad, activo } = req.body || {};
    if (nombre !== undefined) relator.set("nombre", nombre);
    if (correo !== undefined) relator.set("correo", correo || null);
    if (telefono !== undefined) relator.set("telefono", telefono || null);
    if (rut !== undefined) relator.set("rut", rut || null);
    if (especialidad !== undefined) relator.set("especialidad", especialidad || null);
    if (activo !== undefined) relator.set("activo", !!activo);
    await relator.save();
    res.json({ message: "Relator actualizado exitosamente", error: false, data: relator });
  } catch (error: any) {
    console.error("Error al actualizar relator:", error);
    res.status(500).json({ message: "Error al actualizar el relator", error: true });
  }
}

export async function eliminarRelator(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const relator: any = await Relator.findOne({ where: { id, deleted: false } });
    if (!relator) {
      res.status(404).json({ message: "Relator no encontrado", error: true });
      return;
    }
    await relator.update({ deleted: true, activo: false });
    res.json({ message: "Relator eliminado exitosamente", error: false });
  } catch (error: any) {
    console.error("Error al eliminar relator:", error);
    res.status(500).json({ message: "Error al eliminar el relator", error: true });
  }
}
