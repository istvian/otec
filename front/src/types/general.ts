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
