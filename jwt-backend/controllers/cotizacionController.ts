import { Request, Response } from "express";
import crypto from "crypto";
import {
  Contacto,
  Cotizacion,
  Curso,
  CursoComercial,
  Empresa,
  Negocio,
  Usuario,
} from "../models";
import { generarCotizacionPdf } from "../helpers/cotizacionPdfHelper";

const ESTADOS_VALIDOS = ["Borrador", "Enviada", "Aceptada", "Rechazada"];

const incluirRelaciones = [
  {
    model: Empresa,
    as: "empresa",
    attributes: ["id", "rut", "razon", "direccion"],
  },
  {
    model: Contacto,
    as: "contacto",
    attributes: ["id", "nombre", "cargo", "correo", "telefono"],
  },
  {
    model: Usuario,
    as: "vendedor",
    attributes: ["id", "nombre", "correo"],
  },
  {
    model: Curso,
    as: "curso",
    attributes: [
      "id",
      "codigo",
      "nombre",
      "modalidad",
      "modo",
      "horas",
      "valorEfectivoParticipante",
      "valorImputableParticipante",
    ],
  },
  {
    model: CursoComercial,
    as: "cursoComercial",
    attributes: ["id", "nombre", "objetivos", "temario", "cursoID"],
  },
  {
    model: Negocio,
    as: "negocio",
    attributes: ["id", "estado", "montoTotal"],
  },
];

const generarToken = () => crypto.randomBytes(18).toString("hex");

const numeroSeguro = (valor: unknown, defecto = 0) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : defecto;
};

const calcularTotales = (
  valorAlumno: number,
  cantidadAlumnos: number,
  descuento: number,
) => {
  const cantidad = Math.max(1, Math.floor(numeroSeguro(cantidadAlumnos, 1)));
  const valor = Math.max(0, numeroSeguro(valorAlumno, 0));
  const desc = Math.max(0, numeroSeguro(descuento, 0));
  const subtotal = Math.round(valor * cantidad);
  const total = Math.max(0, Math.round(subtotal - desc));
  return { cantidad, valor, desc, subtotal, total };
};

const urlPublicaFrontend = () => {
  const base =
    process.env.FRONTEND_URL ||
    process.env.ORIGIN ||
    "http://localhost:5173";
  return base.replace(/\/$/, "");
};

const normalizarEstado = (estado: unknown) =>
  typeof estado === "string" && ESTADOS_VALIDOS.includes(estado)
    ? estado
    : "Borrador";

const parseJsonSeguro = (valor: unknown) => {
  if (Array.isArray(valor)) return valor;
  if (typeof valor !== "string" || !valor.trim()) return [];
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const fechaVencimientoDe = (cotizacion: any) => {
  const base =
    cotizacion?.fechaEmision ||
    cotizacion?.dataValues?.fechaEmision ||
    cotizacion?.createdAt ||
    cotizacion?.dataValues?.createdAt ||
    new Date();
  const emision = new Date(base);
  const dias = Math.max(
    1,
    Math.floor(
      numeroSeguro(
        cotizacion?.validezDias ?? cotizacion?.dataValues?.validezDias,
        15,
      ),
    ),
  );
  const vencimiento = new Date(emision);
  vencimiento.setDate(vencimiento.getDate() + dias);
  return vencimiento;
};

const estaVencidaCotizacion = (cotizacion: any, ahora = new Date()) =>
  fechaVencimientoDe(cotizacion) < ahora;

async function buscarCotizacionPorToken(token: string) {
  const todas = await Cotizacion.findAll({
    where: { deleted: false },
    include: incluirRelaciones,
  });
  return (
    todas.find((cot: any) => {
      const actual = cot.dataValues?.tokenPublico || cot.tokenPublico;
      if (actual === token) return true;
      const historicos = parseJsonSeguro(
        cot.dataValues?.tokensHistoricos || cot.tokensHistoricos,
      );
      return historicos.includes(token);
    }) || null
  );
}

const enriquecerCotizacion = (cotizacion: any) => {
  if (!cotizacion) return cotizacion;
  const json =
    typeof cotizacion.toJSON === "function"
      ? cotizacion.toJSON()
      : { ...cotizacion };
  const vencimiento = fechaVencimientoDe(json);
  json.fechaVencimiento = vencimiento.toISOString();
  json.vencida = vencimiento < new Date();
  json.tokensHistoricos = parseJsonSeguro(json.tokensHistoricos);
  json.historialRevalidaciones = parseJsonSeguro(json.historialRevalidaciones);
  return json;
};

const enriquecerLista = (lista: any[]) =>
  Array.isArray(lista) ? lista.map(enriquecerCotizacion) : lista;

async function obtenerDependencias(body: any) {
  const empresaID = body.empresaID ? Number(body.empresaID) : null;
  const contactoID = body.contactoID ? Number(body.contactoID) : null;
  const cursoID = body.cursoID ? Number(body.cursoID) : null;
  const cursoComercialID = body.cursoComercialID
    ? Number(body.cursoComercialID)
    : null;

  const [empresa, contacto, curso, cursoComercial] = await Promise.all([
    empresaID ? Empresa.findByPk(empresaID) : null,
    contactoID ? Contacto.findByPk(contactoID) : null,
    cursoID ? Curso.findByPk(cursoID) : null,
    cursoComercialID ? CursoComercial.findByPk(cursoComercialID) : null,
  ]);

  return {
    empresaID,
    contactoID,
    cursoID,
    cursoComercialID,
    empresa,
    contacto,
    curso,
    cursoComercial,
  };
}

// CREATE (POST)
async function crearCotizacion(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body || {};
    const dependencias = await obtenerDependencias(body);

    if (!dependencias.cursoID && !dependencias.cursoComercialID) {
      res.status(400).json({
        message:
          "Debes vincular la cotización a un curso SENCE o a un curso comercial.",
        error: true,
      });
      return;
    }

    if (dependencias.empresaID && !dependencias.empresa) {
      res.status(404).json({ message: "Empresa no encontrada", error: true });
      return;
    }

    if (dependencias.cursoID && !dependencias.curso) {
      res
        .status(404)
        .json({ message: "Curso SENCE no encontrado", error: true });
      return;
    }

    if (dependencias.cursoComercialID && !dependencias.cursoComercial) {
      res
        .status(404)
        .json({ message: "Curso comercial no encontrado", error: true });
      return;
    }

    const valorAlumno =
      body.valorAlumno !== undefined && body.valorAlumno !== ""
        ? numeroSeguro(body.valorAlumno, 0)
        : numeroSeguro(dependencias.curso?.dataValues.valorEfectivoParticipante, 0);

    const totales = calcularTotales(
      valorAlumno,
      body.cantidadAlumnos,
      body.descuento,
    );

    const usuarioJwt: any = (req as any).user;
    const vendedorID = body.vendedorID
      ? Number(body.vendedorID)
      : usuarioJwt?.id
        ? Number(usuarioJwt.id)
        : null;

    const cotizacion = await Cotizacion.create({
      negocioID: body.negocioID ? Number(body.negocioID) : null,
      empresaID: dependencias.empresaID,
      contactoID: dependencias.contactoID,
      vendedorID,
      cursoID: dependencias.cursoID,
      cursoComercialID: dependencias.cursoComercialID,
      nombreCurso:
        body.nombreCurso ||
        dependencias.cursoComercial?.dataValues.nombre ||
        dependencias.curso?.dataValues.nombre ||
        "",
      nombreCliente:
        body.nombreCliente || dependencias.empresa?.dataValues.razon || "",
      clienteRut:
        body.clienteRut || dependencias.empresa?.dataValues.rut || "",
      clienteDireccion:
        body.clienteDireccion ||
        dependencias.empresa?.dataValues.direccion ||
        "",
      contactoNombre:
        body.contactoNombre || dependencias.contacto?.dataValues.nombre || "",
      contactoCorreo:
        body.contactoCorreo || dependencias.contacto?.dataValues.correo || "",
      contactoTelefono:
        body.contactoTelefono ||
        dependencias.contacto?.dataValues.telefono ||
        "",
      objetivosCustom:
        body.objetivosCustom ??
        dependencias.cursoComercial?.dataValues.objetivos ??
        "",
      temarioCustom:
        body.temarioCustom ??
        dependencias.cursoComercial?.dataValues.temario ??
        "",
      cantidadAlumnos: totales.cantidad,
      valorAlumno: totales.valor,
      descuento: totales.desc,
      subtotal: totales.subtotal,
      total: totales.total,
      estado: normalizarEstado(body.estado),
      validezDias: Math.max(1, Math.floor(numeroSeguro(body.validezDias, 15))),
      observaciones: body.observaciones || "",
      condiciones: body.condiciones || "",
      tokenPublico: generarToken(),
      fechaEmision: body.fechaEmision
        ? new Date(body.fechaEmision)
        : new Date(),
      deleted: false,
    });

    const creada = await Cotizacion.findByPk(cotizacion.dataValues.id, {
      include: incluirRelaciones,
    });

    res.status(201).json({
      message: "Cotización creada exitosamente",
      error: false,
      data: enriquecerCotizacion(creada),
    });
  } catch (error: any) {
    console.error("Error al crear cotización:", error);
    res.status(500).json({
      message: "Error al crear la cotización",
      error: true,
    });
  }
}

// READ (GET) - Obtener todas
async function obtenerCotizaciones(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const where: any = { deleted: false };
    if (req.query.vendedorID) {
      where.vendedorID = Number(req.query.vendedorID);
    }
    if (req.query.estado) {
      where.estado = String(req.query.estado);
    }

    let cotizaciones = await Cotizacion.findAll({
      where,
      include: incluirRelaciones,
      order: [["id", "DESC"]],
    });

    const filtroVencida =
      String(req.query.vencida || req.query.vencidas || "").toLowerCase() ===
        "true" ||
      String(req.query.estado || "").toLowerCase() === "vencida";

    if (filtroVencida) {
      cotizaciones = cotizaciones.filter((cot: any) =>
        estaVencidaCotizacion(cot),
      );
    }

    res.send({
      message: "Cotizaciones enviadas correctamente",
      error: false,
      data: enriquecerLista(cotizaciones),
    });
  } catch (error: any) {
    console.error("Error al obtener cotizaciones:", error);
    res.status(500).send({
      message: "Error al obtener las cotizaciones",
      error: true,
    });
  }
}

// READ (GET) - Obtener por ID
async function obtenerCotizacionPorId(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findOne({
      where: { id, deleted: false },
      include: incluirRelaciones,
    });

    if (!cotizacion) {
      res.status(404).json({ message: "Cotización no encontrada", error: true });
      return;
    }

    res.send({
      message: "Cotización enviada correctamente",
      error: false,
      data: enriquecerCotizacion(cotizacion),
    });
  } catch (error: any) {
    console.error("Error al obtener cotización:", error);
    res.status(500).send({
      message: "Error al obtener la cotización",
      error: true,
    });
  }
}

// UPDATE (PATCH)
async function actualizarCotizacion(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const cotizacion = await Cotizacion.findOne({
      where: { id, deleted: false },
    });

    if (!cotizacion) {
      res.status(404).json({ message: "Cotización no encontrada", error: true });
      return;
    }

    const actual: any = cotizacion.dataValues;
    const dependencias = await obtenerDependencias({
      empresaID:
        body.empresaID !== undefined ? body.empresaID : actual.empresaID,
      contactoID:
        body.contactoID !== undefined ? body.contactoID : actual.contactoID,
      cursoID: body.cursoID !== undefined ? body.cursoID : actual.cursoID,
      cursoComercialID:
        body.cursoComercialID !== undefined
          ? body.cursoComercialID
          : actual.cursoComercialID,
    });

    const valorAlumno =
      body.valorAlumno !== undefined
        ? numeroSeguro(body.valorAlumno, actual.valorAlumno)
        : numeroSeguro(actual.valorAlumno, 0);

    const totales = calcularTotales(
      valorAlumno,
      body.cantidadAlumnos ?? actual.cantidadAlumnos,
      body.descuento ?? actual.descuento,
    );

    await cotizacion.update({
      negocioID:
        body.negocioID !== undefined
          ? body.negocioID
            ? Number(body.negocioID)
            : null
          : actual.negocioID,
      empresaID: dependencias.empresaID,
      contactoID: dependencias.contactoID,
      cursoID: dependencias.cursoID,
      cursoComercialID: dependencias.cursoComercialID,
      nombreCurso:
        body.nombreCurso ??
        dependencias.cursoComercial?.dataValues.nombre ??
        dependencias.curso?.dataValues.nombre ??
        actual.nombreCurso,
      nombreCliente:
        body.nombreCliente ??
        dependencias.empresa?.dataValues.razon ??
        actual.nombreCliente,
      clienteRut:
        body.clienteRut ??
        dependencias.empresa?.dataValues.rut ??
        actual.clienteRut,
      clienteDireccion:
        body.clienteDireccion ??
        dependencias.empresa?.dataValues.direccion ??
        actual.clienteDireccion,
      contactoNombre:
        body.contactoNombre ??
        dependencias.contacto?.dataValues.nombre ??
        actual.contactoNombre,
      contactoCorreo:
        body.contactoCorreo ??
        dependencias.contacto?.dataValues.correo ??
        actual.contactoCorreo,
      contactoTelefono:
        body.contactoTelefono ??
        dependencias.contacto?.dataValues.telefono ??
        actual.contactoTelefono,
      objetivosCustom:
        body.objetivosCustom ??
        dependencias.cursoComercial?.dataValues.objetivos ??
        actual.objetivosCustom,
      temarioCustom:
        body.temarioCustom ??
        dependencias.cursoComercial?.dataValues.temario ??
        actual.temarioCustom,
      cantidadAlumnos: totales.cantidad,
      valorAlumno: totales.valor,
      descuento: totales.desc,
      subtotal: totales.subtotal,
      total: totales.total,
      estado:
        body.estado !== undefined
          ? normalizarEstado(body.estado)
          : actual.estado,
      validezDias:
        body.validezDias !== undefined
          ? Math.max(1, Math.floor(numeroSeguro(body.validezDias, 15)))
          : actual.validezDias,
      observaciones:
        body.observaciones !== undefined
          ? body.observaciones
          : actual.observaciones,
      condiciones:
        body.condiciones !== undefined ? body.condiciones : actual.condiciones,
      tokenPublico: actual.tokenPublico || generarToken(),
      fechaEmision: body.fechaEmision
        ? new Date(body.fechaEmision)
        : actual.fechaEmision,
    });

    const actualizada = await Cotizacion.findByPk(id, {
      include: incluirRelaciones,
    });

    res.send({
      message: "Cotización actualizada exitosamente",
      error: false,
      data: enriquecerCotizacion(actualizada),
    });
  } catch (error: any) {
    console.error("Error al actualizar cotización:", error);
    res.status(500).send({
      message: "Error al actualizar la cotización",
      error: true,
    });
  }
}

// DELETE lógico
async function eliminarCotizacion(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findOne({
      where: { id, deleted: false },
    });

    if (!cotizacion) {
      res.status(404).json({ message: "Cotización no encontrada", error: true });
      return;
    }

    await cotizacion.update({ deleted: true });

    res.send({
      message: "Cotización eliminada exitosamente",
      error: false,
    });
  } catch (error: any) {
    console.error("Error al eliminar cotización:", error);
    res.status(500).send({
      message: "Error al eliminar la cotización",
      error: true,
    });
  }
}

// PÚBLICO (sin autenticación) - solo lectura
async function obtenerCotizacionPublica(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { token } = req.params;
    const cotizacion = await buscarCotizacionPorToken(token);

    if (!cotizacion) {
      res.status(404).json({
        message: "Cotización no encontrada o enlace no válido",
        error: true,
      });
      return;
    }

    res.send({
      message: "Cotización enviada correctamente",
      error: false,
      data: enriquecerCotizacion(cotizacion),
    });
  } catch (error: any) {
    console.error("Error al obtener cotización pública:", error);
    res.status(500).send({
      message: "Error al obtener la cotización",
      error: true,
    });
  }
}

const enviarPdf = async (
  cotizacion: any,
  res: Response,
  descargar: boolean,
): Promise<void> => {
  const token = cotizacion.dataValues.tokenPublico;
  const urlPublica = `${urlPublicaFrontend()}/cotizaciones/publica/${token}`;
  const doc = generarCotizacionPdf(cotizacion.toJSON(), {
    urlPublica,
    nombreEmpresa: process.env.NOMBRE_EMPRESA || "KeepLearning",
  });

  const codigo = `COT-${String(cotizacion.dataValues.id).padStart(5, "0")}`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${descargar ? "attachment" : "inline"}; filename="${codigo}.pdf"`,
  );

  doc.pipe(res);
  doc.end();
};

// PDF privado (requiere sesión)
async function descargarPdfCotizacion(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findOne({
      where: { id, deleted: false },
      include: incluirRelaciones,
    });

    if (!cotizacion) {
      res.status(404).json({ message: "Cotización no encontrada", error: true });
      return;
    }

    await enviarPdf(cotizacion, res, req.query.download !== "0");
  } catch (error: any) {
    console.error("Error al generar PDF de cotización:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error al generar el PDF de la cotización",
        error: true,
      });
    }
  }
}

// PDF público (enlace de solo lectura)
async function descargarPdfCotizacionPublica(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { token } = req.params;
    const cotizacion = await buscarCotizacionPorToken(token);

    if (!cotizacion) {
      res.status(404).json({
        message: "Cotización no encontrada o enlace no válido",
        error: true,
      });
      return;
    }

    await enviarPdf(cotizacion, res, req.query.download !== "0");
  } catch (error: any) {
    console.error("Error al generar PDF público:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error al generar el PDF de la cotización",
        error: true,
      });
    }
  }
}


// REVALIDAR / EXTENDER VIGENCIA
async function revalidarCotizacion(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findOne({
      where: { id, deleted: false },
      include: incluirRelaciones,
    });

    if (!cotizacion) {
      res.status(404).json({ message: "Cotización no encontrada", error: true });
      return;
    }

    const actual: any = cotizacion.dataValues;
    const body = req.body || {};

    let validezDias = actual.validezDias;
    if (body.validezDias !== undefined) {
      validezDias = Math.max(
        1,
        Math.floor(numeroSeguro(body.validezDias, actual.validezDias)),
      );
    } else if (body.diasExtension !== undefined) {
      validezDias = Math.max(
        1,
        Math.floor(
          numeroSeguro(actual.validezDias, 15) +
            numeroSeguro(body.diasExtension, 0),
        ),
      );
    } else if (body.dias !== undefined) {
      validezDias = Math.max(
        1,
        Math.floor(numeroSeguro(body.dias, actual.validezDias)),
      );
    }

    const nuevaFechaEmision = body.fechaEmision
      ? new Date(body.fechaEmision)
      : new Date();

    const regenerarEnlace =
      body.regenerarEnlace !== false &&
      body.regenerarToken !== false &&
      body.nuevoEnlace !== false;

    const historial = parseJsonSeguro(actual.historialRevalidaciones);
    const tokensHistoricos = parseJsonSeguro(actual.tokensHistoricos);

    let nuevoToken = actual.tokenPublico;
    if (regenerarEnlace) {
      if (actual.tokenPublico) tokensHistoricos.push(actual.tokenPublico);
      nuevoToken = generarToken();
    }

    historial.push({
      fecha: new Date().toISOString(),
      usuarioID: (req as any).user?.id || null,
      fechaEmisionAnterior: actual.fechaEmision,
      validezDiasAnterior: actual.validezDias,
      tokenAnterior: actual.tokenPublico,
      nuevoToken,
      nuevaFechaEmision: nuevaFechaEmision.toISOString(),
      nuevaValidezDias: validezDias,
    });

    const nuevoEstado =
      body.estado !== undefined
        ? normalizarEstado(body.estado)
        : actual.estado;

    await cotizacion.update({
      fechaEmision: nuevaFechaEmision,
      validezDias,
      estado: nuevoEstado,
      tokenPublico: nuevoToken || actual.tokenPublico || generarToken(),
      revalidada: true,
      fechaRevalidacion: new Date(),
      revalidaciones: Math.max(0, Number(actual.revalidaciones || 0)) + 1,
      historialRevalidaciones: JSON.stringify(historial),
      tokensHistoricos: JSON.stringify(tokensHistoricos),
    });

    const actualizada = await Cotizacion.findByPk(id, {
      include: incluirRelaciones,
    });

    res.send({
      message: "Cotización revalidada y vigencia extendida exitosamente",
      error: false,
      data: enriquecerCotizacion(actualizada),
    });
  } catch (error: any) {
    console.error("Error al revalidar cotización:", error);
    res.status(500).send({
      message: "Error al revalidar la cotización",
      error: true,
    });
  }
}

// Listado de vencidas
async function obtenerCotizacionesVencidas(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const cotizaciones = await Cotizacion.findAll({
      where: { deleted: false },
      include: incluirRelaciones,
      order: [["id", "DESC"]],
    });
    const vencidas = cotizaciones.filter((cot: any) =>
      estaVencidaCotizacion(cot),
    );
    res.send({
      message: "Cotizaciones vencidas enviadas correctamente",
      error: false,
      data: enriquecerLista(vencidas),
    });
  } catch (error: any) {
    console.error("Error al obtener cotizaciones vencidas:", error);
    res.status(500).send({
      message: "Error al obtener las cotizaciones vencidas",
      error: true,
    });
  }
}

export {
  actualizarCotizacion,
  crearCotizacion,
  descargarPdfCotizacion,
  descargarPdfCotizacionPublica,
  eliminarCotizacion,
  obtenerCotizacionPorId,
  obtenerCotizacionPublica,
  obtenerCotizacionesVencidas,
  revalidarCotizacion,
  obtenerCotizaciones,
};
