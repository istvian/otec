import { Request, Response } from "express";
import Curso from "../models/Curso";

// CREATE (POST)
async function crearCurso(req: Request, res: Response): Promise<void> {
  try {
    console.log(req.body);
    await Curso.create(req.body);
    res.send({
      message: "Curso creado exitosamente",
      error: false,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al crear el curso",
      error: true,
    });
  }
}

// READ (GET) - Obtener todos
async function obtenerCursos(req: Request, res: Response): Promise<void> {
  try {
    const cursos = await Curso.findAll({ where: { deleted: false } });
    res.send({
      message: "Cursos enviados correctamente",
      error: false,
      data: cursos,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al obtener los cursos",
      error: true,
    });
  }
}

// READ (GET) - Obtener por ID
async function obtenerCursoPorId(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);

    if (!curso) {
      res.status(404).json({ message: "Curso no encontrado", error: true });
      return;
    }

    res.send({ data: curso, error: false, message: "Enviado por ID" });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al obtener el curso",
      error: true,
    });
  }
}

// UPDATE (PATCH)
async function actualizarCurso(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    console.log(id);
    const curso = await Curso.findByPk(id);

    if (!curso) {
      res.status(404).send({ message: "Curso no encontrado", error: true });
      return;
    }

    await curso.update(req.body);

    res.send({
      message: "Curso actualizado exitosamente",
      error: false,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al actualizar el curso",
      error: true,
    });
  }
}

// DELETE (DELETE lógico - marca activo en false)
async function eliminarCurso(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);

    if (!curso) {
      res.send({ message: "Curso no encontrado", error: true });
      return;
    }

    await curso.update({ deleted: true });

    res.send({
      message: "Curso marcado como inactivo (eliminación lógica) exitosamente",
      error: false,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al eliminar (desactivar) el curso",
      error: true,
    });
  }
}

export {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso,
};
