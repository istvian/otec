import { Request, Response } from "express";
import Rol from "../models/Rol";
import Usuario from "../models/Usuario";

export async function listarRoles(req: Request, res: Response): Promise<void> {
  try {
    const where: any = { deleted: false };
    const roles = await Rol.findAll({ where, order: [["id", "ASC"]] });
    res.json({ message: "Roles obtenidos correctamente", error: false, data: roles });
  } catch (error: any) {
    console.error("Error al listar roles:", error);
    res.status(500).json({ message: "Error al obtener roles", error: true });
  }
}

export async function obtenerRol(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const rol: any = await Rol.findOne({ where: { id, deleted: false } });
    if (!rol) {
      res.status(404).json({ message: "Rol no encontrado", error: true });
      return;
    }
    res.json({ message: "Rol obtenido correctamente", error: false, data: rol });
  } catch (error: any) {
    console.error("Error al obtener rol:", error);
    res.status(500).json({ message: "Error al obtener el rol", error: true });
  }
}

export async function crearRol(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, descripcion } = req.body || {};
    if (!nombre) {
      res.status(400).json({ message: "El nombre del rol es obligatorio", error: true });
      return;
    }
    const rol = await Rol.create({
      nombre,
      descripcion: descripcion || null,
      activo: true,
      deleted: false,
    });
    res.status(201).json({ message: "Rol creado exitosamente", error: false, data: rol });
  } catch (error: any) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ message: "Error al crear el rol", error: true });
  }
}

export async function actualizarRol(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const rol: any = await Rol.findOne({ where: { id, deleted: false } });
    if (!rol) {
      res.status(404).json({ message: "Rol no encontrado", error: true });
      return;
    }
    const { nombre, descripcion, activo } = req.body || {};
    if (nombre !== undefined) rol.set("nombre", nombre);
    if (descripcion !== undefined) rol.set("descripcion", descripcion || null);
    if (activo !== undefined) rol.set("activo", !!activo);
    await rol.save();
    res.json({ message: "Rol actualizado exitosamente", error: false, data: rol });
  } catch (error: any) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ message: "Error al actualizar el rol", error: true });
  }
}

export async function eliminarRol(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const rol: any = await Rol.findOne({ where: { id, deleted: false } });
    if (!rol) {
      res.status(404).json({ message: "Rol no encontrado", error: true });
      return;
    }
    const usuariosAsignados = await Usuario.count({ where: { rolID: id, deleted: false } });
    if (usuariosAsignados > 0) {
      res.status(400).json({
        message: "No se puede eliminar un rol con usuarios asignados",
        error: true,
      });
      return;
    }
    await rol.update({ deleted: true, activo: false });
    res.json({ message: "Rol eliminado exitosamente", error: false });
  } catch (error: any) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ message: "Error al eliminar el rol", error: true });
  }
}

export default { listarRoles, obtenerRol, crearRol, actualizarRol, eliminarRol };