import { Request, Response } from "express";
import Curso from "../models/Curso";

// CREATE (POST)
async function crearCurso(req: Request, res: Response): Promise<void> {
  try {
    console.log(req.body);
    const curso = await Curso.create(req.body);
    res.send({
      message: "Curso creado exitosamente",
      curso,
    });
  } catch (error: any) {
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
      cursos: cursos,
    });
  } catch (error: any) {
    res.send({
      message: "Error al obtener los cursos",
      error: error.message,
    });
  }
}

// READ (GET) - Obtener por ID
async function obtenerCursoPorId(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);

    if (!curso) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }

    res.send(curso);
  } catch (error: any) {
    res.send({
      message: "Error al obtener el curso",
      error: error.message,
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
      res.status(404).send({ message: "Curso no encontrado" });
      return;
    }

    await curso.update(req.body);

    res.send({
      message: "Curso actualizado exitosamente",
      curso,
    });
  } catch (error: any) {
    res.send({
      message: "Error al actualizar el curso",
      error: error.message,
    });
  }
}

// DELETE (DELETE lógico - marca activo en false)
async function eliminarCurso(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);

    if (!curso) {
      res.send({ message: "Curso no encontrado" });
      return;
    }

    await curso.update({ deleted: true });

    res.send({
      message: "Curso marcado como inactivo (eliminación lógica) exitosamente",
      curso,
    });
  } catch (error: any) {
    res.send({
      message: "Error al eliminar (desactivar) el curso",
      error: error.message,
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
