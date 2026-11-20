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
  mensaje: string;
  error: boolean;
  data?: T | null;
}

export interface Curso {
  id?: string;
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
