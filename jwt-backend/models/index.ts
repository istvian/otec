import sequelize from "../config/database";
import Rol from "./Rol";
import Curso from "./Curso"; // En diagrama: Curso_SENCE
import Usuario from "./Usuario";
import Contacto from "./Contacto";
import Empresa from "./Empresa";
import CursoComercial from "./CursoComercial";
import Negocio from "./Negocio";
import Cotizacion from "./Cotizacion";
import Adjunto from "./Adjunto";
import Relator from "./Relator";

// --- ROL & USUARIO ---
Rol.hasMany(Usuario, {
  foreignKey: "rolID",
  as: "usuarios",
});
Usuario.belongsTo(Rol, {
  foreignKey: "rolID", // Corregido (antes decía "id")
  as: "rol",
});

// --- EMPRESA & CONTACTO ---
Empresa.hasMany(Contacto, {
  foreignKey: "empresaID",
  as: "contactos",
});
Contacto.belongsTo(Empresa, {
  foreignKey: "empresaID",
  as: "empresa",
});

// --- NEGOCIO (con Empresa, Contacto y Usuario/Vendedor) ---
Empresa.hasMany(Negocio, {
  foreignKey: "empresaID",
  as: "negocios",
});
Negocio.belongsTo(Empresa, {
  foreignKey: "empresaID",
  as: "empresa",
});

// Corregido: la FK vive en Negocio, no en Contacto
Contacto.hasMany(Negocio, {
  foreignKey: "contactoID",
  as: "negocios",
});
Negocio.belongsTo(Contacto, {
  foreignKey: "contactoID",
  as: "contacto",
});

Usuario.hasMany(Negocio, {
  foreignKey: "vendedorID",
  as: "negocios",
});
Negocio.belongsTo(Usuario, {
  foreignKey: "vendedorID",
  as: "vendedor",
});

// --- CURSO & CURSO COMERCIAL ---
Curso.hasMany(CursoComercial, {
  foreignKey: "cursoID",
  as: "cursosComerciales",
});
CursoComercial.belongsTo(Curso, {
  foreignKey: "cursoID",
  as: "curso",
});

// --- COTIZACION (con Negocio y CursoComercial) ---
Negocio.hasMany(Cotizacion, {
  foreignKey: "negocioID",
  as: "cotizaciones",
});
Cotizacion.belongsTo(Negocio, {
  foreignKey: "negocioID",
  as: "negocio", // Corregido a singular
});

CursoComercial.hasMany(Cotizacion, {
  foreignKey: "cursoComercialID",
  as: "cotizaciones",
});
Cotizacion.belongsTo(CursoComercial, {
  foreignKey: "cursoComercialID",
  as: "cursoComercial",
});

// --- COTIZACION (snapshots de Empresa, Contacto, Vendedor y Curso SENCE) ---
Empresa.hasMany(Cotizacion, {
  foreignKey: "empresaID",
  as: "cotizaciones",
});
Cotizacion.belongsTo(Empresa, {
  foreignKey: "empresaID",
  as: "empresa",
});

Contacto.hasMany(Cotizacion, {
  foreignKey: "contactoID",
  as: "cotizaciones",
});
Cotizacion.belongsTo(Contacto, {
  foreignKey: "contactoID",
  as: "contacto",
});

Usuario.hasMany(Cotizacion, {
  foreignKey: "vendedorID",
  as: "cotizaciones",
});
Cotizacion.belongsTo(Usuario, {
  foreignKey: "vendedorID",
  as: "vendedor",
});

Curso.hasMany(Cotizacion, {
  foreignKey: "cursoID",
  as: "cotizaciones",
});
Cotizacion.belongsTo(Curso, {
  foreignKey: "cursoID",
  as: "curso",
});

// --- ADJUNTO (respaldo OC y nómina) ---
Negocio.hasMany(Adjunto, {
  foreignKey: "negocioID",
  as: "adjuntos",
});
Adjunto.belongsTo(Negocio, {
  foreignKey: "negocioID",
  as: "negocio",
});

Curso.hasMany(Adjunto, {
  foreignKey: "cursoID",
  as: "adjuntos",
});
Adjunto.belongsTo(Curso, {
  foreignKey: "cursoID",
  as: "curso",
});

Usuario.hasMany(Adjunto, {
  foreignKey: "usuarioID",
  as: "adjuntos",
});
Adjunto.belongsTo(Usuario, {
  foreignKey: "usuarioID",
  as: "usuario",
});

// --- RELATOR & ADJUNTO (contrato de servicios) ---
Relator.hasMany(Adjunto, {
  foreignKey: "relatorID",
  as: "contratos",
});
Adjunto.belongsTo(Relator, {
  foreignKey: "relatorID",
  as: "relator",
});

// Exportar todos los modelos asociados
export {
  sequelize,
  Usuario,
  Rol,
  Curso,
  Contacto,
  Empresa,
  CursoComercial,
  Negocio,
  Cotizacion,
  Adjunto,
  Relator,
};
