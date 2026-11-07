export interface LoginData {
  correo: string;
  contraseña: string;
}

export interface RegisterData {
  correo: string;
  contraseña: string;
  nombre: string;
}

export interface Response {
  message: string;
  error: boolean;
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

export interface CursosResponse extends Response {
  cursos?: Curso[];
}
