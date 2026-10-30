import axios from "axios";
import type { LoginData, RegisterData, Response } from "../types/general";

const BASE_URL = import.meta.env.VITE_BASE_URL;

console.log(BASE_URL);

const api = axios.create({
  baseURL: BASE_URL, // Pon aquí la URL de tu backend
  withCredentials: true, // La clave: todas las peticiones de esta instancia llevarán credenciales
});

export async function Login(
  formData: LoginData,
  onEnd: (response: Response) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/user/login");
    const response = await api.post("/api/user/login", formData);
    console.log(response.data);
    onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

export async function Register(
  formData: RegisterData,
  onEnd: (response: Response) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/user/register");
    console.log("Data");
    console.log(formData);
    const response = await api.post("/api/user/register", formData);
    console.log(response.data);
    onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}
export async function CheckAuth(): Promise<Response | null> {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/user/check");
    const response = await api.get("/api/user/check");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
export async function LogOut(): Promise<Response | null> {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/user/logout");
    const response = await api.get("/api/user/logout");
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
