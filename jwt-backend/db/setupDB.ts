import { DataTypes } from "sequelize";
import crypto from "crypto";
import { Rol, sequelize, Adjunto, Relator } from "../models";

async function LoadRoles() {
  try {
    const rolesDef = [
      { id: 1, nombre: "nuevo", descripcion: "" },
      { id: 2, nombre: "vendedor", descripcion: "" },
      { id: 3, nombre: "operador", descripcion: "" },
      { id: 4, nombre: "legal", descripcion: "" },
      { id: 5, nombre: "administrador", descripcion: "" },
      { id: 6, nombre: "rrhh", descripcion: "" },
    ];

    for (const def of rolesDef) {
      const existe = await Rol.findByPk(def.id);
      if (!existe) {
        await Rol.create(def as any);
        console.log("Rol creado:", def.nombre);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Agrega las columnas nuevas de la HU-05 a la tabla Cotizacions.
 * sequelize.sync() no modifica tablas existentes, por lo que se hace de
 * forma explícita y tolerante a errores para no romper instalaciones previas.
 */
async function EnsureCotizacionSchema() {
  const qi = sequelize.getQueryInterface();

  try {
    const descripcion: Record<string, unknown> = await qi.describeTable(
      "Cotizacions",
    );

    const columnasNuevas: Record<string, Record<string, unknown>> = {
      empresaID: { type: DataTypes.INTEGER, allowNull: true },
      contactoID: { type: DataTypes.INTEGER, allowNull: true },
      vendedorID: { type: DataTypes.INTEGER, allowNull: true },
      cursoID: { type: DataTypes.INTEGER, allowNull: true },
      nombreCurso: { type: DataTypes.STRING, allowNull: true },
      nombreCliente: { type: DataTypes.STRING, allowNull: true },
      clienteRut: { type: DataTypes.STRING, allowNull: true },
      clienteDireccion: { type: DataTypes.STRING, allowNull: true },
      contactoNombre: { type: DataTypes.STRING, allowNull: true },
      contactoCorreo: { type: DataTypes.STRING, allowNull: true },
      contactoTelefono: { type: DataTypes.STRING, allowNull: true },
      objetivosCustom: { type: DataTypes.TEXT, allowNull: true },
      valorAlumno: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      descuento: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Borrador",
      },
      validezDias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      observaciones: { type: DataTypes.TEXT, allowNull: true },
      condiciones: { type: DataTypes.TEXT, allowNull: true },
      tokenPublico: { type: DataTypes.STRING, allowNull: true },
      fechaEmision: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      revalidada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fechaRevalidacion: { type: DataTypes.DATE, allowNull: true },
      revalidaciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      historialRevalidaciones: { type: DataTypes.TEXT, allowNull: true },
      tokensHistoricos: { type: DataTypes.TEXT, allowNull: true },
    };

    for (const [nombre, definicion] of Object.entries(columnasNuevas)) {
      if (!descripcion[nombre]) {
        await qi.addColumn("Cotizacions", nombre, definicion);
      }
    }

    // Garantiza que toda cotización existente tenga un token público único.
    const [filas] = await sequelize.query(
      "SELECT id FROM Cotizacions WHERE tokenPublico IS NULL OR tokenPublico = ''",
    );
    for (const fila of filas as { id: number }[]) {
      await sequelize.query(
        "UPDATE Cotizacions SET tokenPublico = :token WHERE id = :id",
        {
          replacements: {
            token: crypto.randomBytes(18).toString("hex"),
            id: fila.id,
          },
        },
      );
    }

    const indices = await qi.showIndex("Cotizacions");
    const existeIndice = indices.some(
      (indice: any) => indice.name === "cotizaciones_token_publico",
    );
    if (!existeIndice) {
      await qi.addIndex("Cotizacions", ["tokenPublico"], {
        unique: true,
        name: "cotizaciones_token_publico",
      });
    }
  } catch (e) {
    console.error("No se pudo actualizar el esquema de Cotizacions:", e);
  }
}

async function EnsureNegocioSchema() {
  const qi = sequelize.getQueryInterface();
  try {
    const descripcion: Record<string, unknown> = await qi.describeTable("Negocios");
    const columnasNuevas: Record<string, Record<string, unknown>> = {
      estadoOperacion: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pendiente",
      },
      fechaCoordinacion: { type: DataTypes.DATE, allowNull: true },
      fechaEjecucion: { type: DataTypes.DATE, allowNull: true },
      condicionCobro: { type: DataTypes.STRING, allowNull: true },
      plazoCobroDias: { type: DataTypes.INTEGER, allowNull: true },
      fechaRecepcionOC: { type: DataTypes.DATE, allowNull: true },
      fechaEstimadaCobro: { type: DataTypes.DATE, allowNull: true },
      estadoCobro: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pendiente",
      },
      observacionesCobro: { type: DataTypes.TEXT, allowNull: true },
    };
    for (const [nombre, definicion] of Object.entries(columnasNuevas)) {
      if (!descripcion[nombre]) {
        await qi.addColumn("Negocios", nombre, definicion);
      }
    }
  } catch (e) {
    console.error("No se pudo actualizar el esquema de Negocios:", e);
  }
}

async function EnsureAdjuntoSchema() {
  const qi = sequelize.getQueryInterface();
  try {
    const descripcion: Record<string, unknown> = await qi.describeTable("Adjuntos");
    const columnasNuevas: Record<string, Record<string, unknown>> = {
      relatorID: { type: DataTypes.INTEGER, allowNull: true },
      modalidad: { type: DataTypes.STRING, allowNull: true },
      honorarios: { type: DataTypes.FLOAT, allowNull: true },
    };
    for (const [nombre, definicion] of Object.entries(columnasNuevas)) {
      if (!descripcion[nombre]) {
        await qi.addColumn("Adjuntos", nombre, definicion);
      }
    }
    await sequelize.sync({ logging: false });
  } catch (e) {
    console.error("No se pudo sincronizar Adjuntos:", e);
    try { await sequelize.sync({ logging: false }); } catch {}
  }
}

async function EnsureRelatorSchema() {
  try {
    await sequelize.sync({ logging: false });
  } catch (e) {
    console.error("No se pudo sincronizar Relatores:", e);
  }
}

async function EnsureUsuarioSchema() {
  const qi = sequelize.getQueryInterface();
  try {
    const descripcion: Record<string, unknown> = await qi.describeTable("Usuarios");
    const columnasNuevas: Record<string, Record<string, unknown>> = {
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    };
    for (const [nombre, definicion] of Object.entries(columnasNuevas)) {
      if (!descripcion[nombre]) {
        await qi.addColumn("Usuarios", nombre, definicion);
      }
    }
  } catch (e) {
    console.error("No se pudo actualizar el esquema de Usuarios:", e);
    try { await sequelize.sync({ logging: false }); } catch {}
  }
}

async function EnsureRolSchema() {
  const qi = sequelize.getQueryInterface();
  try {
    const descripcion: Record<string, unknown> = await qi.describeTable("Rols");
    const columnasNuevas: Record<string, Record<string, unknown>> = {
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    };
    for (const [nombre, definicion] of Object.entries(columnasNuevas)) {
      if (!descripcion[nombre]) {
        await qi.addColumn("Rols", nombre, definicion);
      }
    }
  } catch (e) {
    console.error("No se pudo actualizar el esquema de Rols:", e);
    try { await sequelize.sync({ logging: false }); } catch {}
  }
}

export default { LoadRoles, EnsureCotizacionSchema, EnsureNegocioSchema, EnsureAdjuntoSchema, EnsureRelatorSchema, EnsureUsuarioSchema, EnsureRolSchema };
