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
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
}
export interface CursoComercial {
  id?: number;
  nombre: string;
  objetivos: string;
  temario: string;
  cursoID: number;
}

export interface Correo {
  id?: number;
  from: string;
  to: string;
  date: string;
  asunto: string;
  contenido: string;
}

export interface NegocioType {
  id?: number;
  empresaID: number;
  contactoID: number;
  vendedorID: number;
  estado: boolean;
  montoTotal: number;
  fechaCreacion: Date;
  fechaCierre: Date;
}
