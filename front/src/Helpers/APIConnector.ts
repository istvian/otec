import axios from "axios";
import type {
  Curso,
  Empresa,
  LoginData,
  RegisterData,
  ResponseBase,
} from "../types/general";

const BASE_URL = import.meta.env.VITE_BASE_URL;

console.log(BASE_URL);

const api = axios.create({
  baseURL: BASE_URL, // Pon aquí la URL de tu backend
  withCredentials: true, // La clave: todas las peticiones de esta instancia llevarán credenciales
});

export async function Login(
  formData: LoginData,
  onEnd: (response: ResponseBase) => void,
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
  onEnd: (response: ResponseBase) => void,
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
export async function CheckAuth(): Promise<ResponseBase | null> {
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
export async function LogOut(): Promise<ResponseBase | null> {
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

// ================= CRUD CURSO =================

export async function CreateCurso(
  formData: Curso,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/curso");
    console.log("Data");
    console.log(formData);
    const response = await api.post("/api/curso", formData);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

export async function GetCursos(
  onEnd: (response: ResponseBase<Curso[]>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/curso");
    const response = await api.get("/api/curso");
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Curso[]>);
  } catch (e) {
    console.error(e);
  }
}

export async function GetCursoById(
  id: string,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/curso/" + id);
    const response = await api.get("/api/curso/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase);
  } catch (e) {
    console.error(e);
  }
}

export async function UpdateCurso(
  curso: Curso,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición PATH:" + BASE_URL + "/api/curso/" + curso.id);
    console.log("Data");
    const response = await api.patch("/api/curso/" + curso.id, curso);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

export async function DeleteCurso(
  id: string,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición DELETE:" + BASE_URL + "/api/curso/" + id);
    const response = await api.delete("/api/curso/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

// ================= CRUD EMPRESAS =================

export async function CreateEmpresa(
  formData: Empresa,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/empresa");
    console.log("Data");
    console.log(formData);
    const response = await api.post("/api/empresa", formData);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}
export async function GetEmpresas(
  onEnd: (response: ResponseBase<Empresa[]>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/empresa");
    const response = await api.get("/api/empresa");
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Empresa[]>);
  } catch (e) {
    console.error(e);
  }
}

export async function GetEmpresaByID(
  id: string,
  onEnd: (response: ResponseBase<Empresa>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/empresa/" + id);
    const response = await api.get("/api/empresa/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Empresa>);
  } catch (e) {
    console.error(e);
  }
}

export async function UpdateEmpresa(
  empresa: Empresa,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición PATH:" + BASE_URL + "/api/empresa/" + empresa.id);
    console.log("Data");
    const response = await api.patch("/api/empresa/" + empresa.id, empresa);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

export async function DeleteEmpresa(
  id: string,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición DELETE:" + BASE_URL + "/api/empresa/" + id);
    const response = await api.delete("/api/empresa/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}
