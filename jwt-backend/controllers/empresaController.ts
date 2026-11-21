import { Request, Response } from "express";
import { Contacto, Empresa, sequelize } from "../models";
import { EmpresaType } from "../models/Empresa";
import { GetMails } from "../helpers/emailHelper";

// CREATE (POST)
async function crearEmpresa(req: Request, res: Response): Promise<void> {
  try {
    console.log(req.body);
    const datos: EmpresaType = req.body;

    await Empresa.create(
      {
        ...datos,
        Contacto: [datos.contactos],
      },
      {
        include: [{ model: Contacto, as: "contactos" }],
      },
    );
    res.send({
      message: "Empresa creada exitosamente",
      error: false,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al crear la empresa",
      error: true,
    });
  }
}

// READ (GET) - Obtener todos
async function obtenerEmpresas(req: Request, res: Response): Promise<void> {
  try {
    const empresas = await Empresa.findAll({
      include: [{ model: Contacto, as: "contactos" }],
    });
    res.send({
      message: "Empresas enviadas correctamente",
      error: false,
      data: empresas,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al obtener las Empresas",
      error: true,
    });
  }
}
async function obtenerEmpresaPorId(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const curso = await Empresa.findByPk(id, {
      include: [{ model: Contacto, as: "contactos" }],
    });

    if (!curso) {
      res.status(404).json({ message: "Empresa no encontrada", error: true });
      return;
    }

    res.send({
      data: curso,
      error: false,
      message: "Enviado por ID correctamente",
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al obtener la empresa",
      error: true,
    });
  }
}
async function obtenerCorreosEmpresa(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const mails = await GetMails();
    res.send({
      data: mails,
      error: false,
      message: "Enviado correctamente",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({
      message: "Error al obtener la empresa",
      error: true,
    });
  }
}
async function actualizarEmpresa(req: Request, res: Response): Promise<void> {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { contactos, ...datosEmpresa } = req.body;

    const empresa = await Empresa.findByPk(id, { transaction: t });

    if (!empresa) {
      await t.rollback();
      res.status(404).send({ message: "Empresa no encontrada", error: true });
      return;
    }

    // 1. Actualizamos solo los datos propios de la empresa
    await empresa.update(datosEmpresa, { transaction: t });

    // 2. Si vienen contactos en el body, los gestionamos
    if (Array.isArray(contactos)) {
      // Eliminamos los contactos anteriores de esta empresa
      await Contacto.destroy({
        where: { empresaID: empresa.dataValues.id },
        transaction: t,
      });

      // Preparamos los nuevos asignándoles el empresaID
      const nuevosContactos = contactos.map((c: any) => ({
        ...c,
        id: undefined, // Nos aseguramos de que no choque si traía un id viejo
        empresaID: empresa.dataValues.id,
      }));

      // Insertamos todos de golpe
      await Contacto.bulkCreate(nuevosContactos, { transaction: t });
    }

    // Si todo salió bien, confirmamos los cambios en la BD
    await t.commit();

    res.send({
      message: "Empresa actualizada exitosamente",
      error: false,
    });
  } catch (error: any) {
    // Si algo falló, revertimos todo
    await t.rollback();
    console.error(error);
    res.status(500).send({
      message: "Error al actualizar la empresa",
      error: true,
    });
  }
}
async function eliminarEmpresa(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      res.send({ message: "Empresa no encontrado", error: true });
      return;
    }

    await empresa.update({ deleted: true });

    res.send({
      message:
        "Empresa marcado como inactivo (eliminación lógica) exitosamente",
      error: false,
    });
  } catch (error: any) {
    console.error(error);
    res.send({
      message: "Error al eliminar (desactivar) Empresa",
      error: true,
    });
  }
}

export {
  actualizarEmpresa,
  crearEmpresa,
  eliminarEmpresa,
  obtenerEmpresas,
  obtenerEmpresaPorId,
  obtenerCorreosEmpresa,
};
