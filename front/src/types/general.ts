export interface LoginData {
  correo: string;
  contraseña: string;
}

export interface RegisterData {
  correo: string;
  contraseña: string;
  nombre: string;
}

export interface ResponseBase<T = null> {
  message: string;
  error: boolean;
  data?: T | null;
}

export interface Curso {
  id?: string | number;
  codigo: string;
  numeroSolicitud: string;
  nombre: string;
  modalidad: string;
  modo: string;
  tipo: string;
  nivel: string;
  horas: number;
  valorFranquicia: number;
  valorEfectivoParticipante: number;
  valorImputableParticipante: number;
  numeroResolucionAutorizacion: number;
  estado: string;
  numeroDeposito: number;
  ingreso: Date;
  evaluacion: Date;
  resolucion: Date;
  vigencia: Date;
  pago: Date;
  activo: boolean;
}

export interface Empresa {
  id?: number;
  rut: string;
  razon: string;
  direccion: string;
  contactos: Contacto[];
}
export interface Contacto {
  id?: number;
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
  empresaID?: number;
}
export interface CursoComercial {
  id?: number;
  nombre: string;
  objetivos: string;
  temario: string;
  cursoID: number;
}

export type EstadoCotizacion =
  | "Borrador"
  | "Enviada"
  | "Aceptada"
  | "Rechazada";

export interface Cotizacion {
  id?: number;
  negocioID?: number | null;
  empresaID?: number | null;
  contactoID?: number | null;
  vendedorID?: number | null;
  cursoID?: number | null;
  cursoComercialID?: number | null;
  nombreCurso?: string;
  nombreCliente?: string;
  clienteRut?: string;
  clienteDireccion?: string;
  contactoNombre?: string;
  contactoCorreo?: string;
  contactoTelefono?: string;
  objetivosCustom?: string;
  temarioCustom: string;
  cantidadAlumnos: number;
  valorAlumno: number;
  descuento?: number;
  subtotal?: number;
  total: number;
  estado?: EstadoCotizacion | string;
  validezDias?: number;
  observaciones?: string;
  condiciones?: string;
  tokenPublico?: string;
  fechaEmision?: string | Date;
  deleted?: boolean;
  fechaVencimiento?: string | Date;
  vencida?: boolean;
  revalidada?: boolean;
  fechaRevalidacion?: string | Date;
  revalidaciones?: number;
  tokensHistoricos?: string | string[];
  historialRevalidaciones?: string | any[];
  createdAt?: string;
  updatedAt?: string;
  empresa?: Empresa | null;
  contacto?: Contacto | null;
  vendedor?: { id: number; nombre: string; correo: string } | null;
  curso?: Curso | null;
  cursoComercial?: CursoComercial | null;
}


export interface Correo {
  id?: number;
  from: string;
  to: string;
  date: string;
  asunto: string;
  contenido: string;
}

export interface Relator {
  id?: number;
  nombre: string;
  correo?: string | null;
  telefono?: string | null;
  rut?: string | null;
  especialidad?: string | null;
  activo?: boolean;
  deleted?: boolean;
}

export interface NegocioType {
  id?: number;
  empresaID: number;
  contactoID: number;
  vendedorID: number;
  estado: boolean | string;
  montoTotal: number;
  fechaCreacion: Date;
  fechaCierre: Date;
  condicionCobro?: string | null;
  plazoCobroDias?: number | null;
  fechaRecepcionOC?: string | Date | null;
  fechaEstimadaCobro?: string | Date | null;
  estadoCobro?: string | null;
  observacionesCobro?: string | null;
  vencida?: boolean;
}
