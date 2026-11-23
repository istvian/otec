import axios from "axios";
import type {
  Correo,
  Cotizacion,
  Curso,
  CursoComercial,
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
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        onEnd({
          error: true,
          message:
            "Demasiados intentos fallidos. Por seguridad, intenta nuevamente en 15 minutos.",
        });
      }
    }
    console.error(error);
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
  onEnd: (response: ResponseBase<Curso>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/curso/" + id);
    const response = await api.get("/api/curso/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Curso>);
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
export async function GetCorreoEmpresaByID(
  id: string,
  onEnd: (response: ResponseBase<Correo[]>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/empresa/correos/" + id);
    const response = await api.get("/api/empresa/correos/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Correo[]>);
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

// ================= CRUD CURSO =================

export async function CreateCursoComercial(
  formData: CursoComercial,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/comercial");
    console.log("Data");
    console.log(formData);
    const response = await api.post("/api/comercial", formData);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

export async function GetCursosComercial(
  onEnd: (response: ResponseBase<CursoComercial[]>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/comercial");
    const response = await api.get("/api/comercial");
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<CursoComercial[]>);
  } catch (e) {
    console.error(e);
  }
}

export async function GetCursoComercialById(
  id: string,
  onEnd: (response: ResponseBase<CursoComercial>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/comercial/" + id);
    const response = await api.get("/api/comercial/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<CursoComercial>);
  } catch (e) {
    console.error(e);
  }
}

export async function UpdateCursoComercial(
  curso: CursoComercial,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición PATH:" + BASE_URL + "/api/comercial/" + curso.id);
    console.log("Data");
    const response = await api.patch("/api/comercial/" + curso.id, curso);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

export async function DeleteCursoComercial(
  id: string,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición DELETE:" + BASE_URL + "/api/comercial/" + id);
    const response = await api.delete("/api/comercial/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data);
  } catch (e) {
    console.error(e);
  }
}

// ================= CRUD COTIZACIONES =================

export async function GetCotizaciones(
  onEnd: (response: ResponseBase<Cotizacion[]>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/cotizaciones");
    const response = await api.get("/api/cotizaciones");
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion[]>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message:
          e?.response?.data?.message || "Error al obtener las cotizaciones",
        error: true,
      });
  }
}

export async function GetCotizacionById(
  id: string,
  onEnd: (response: ResponseBase<Cotizacion>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/cotizaciones/" + id);
    const response = await api.get("/api/cotizaciones/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message: e?.response?.data?.message || "Error al obtener la cotización",
        error: true,
      });
  }
}

export async function CreateCotizacion(
  formData: Partial<Cotizacion>,
  onEnd: (response: ResponseBase<Cotizacion>) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/cotizaciones");
    const response = await api.post("/api/cotizaciones", formData);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message: e?.response?.data?.message || "Error al crear la cotización",
        error: true,
      });
  }
}

export async function UpdateCotizacion(
  cotizacion: Partial<Cotizacion> & { id: number },
  onEnd: (response: ResponseBase<Cotizacion>) => void,
) {
  try {
    console.log(
      "Petición PATCH:" + BASE_URL + "/api/cotizaciones/" + cotizacion.id,
    );
    const response = await api.patch(
      "/api/cotizaciones/" + cotizacion.id,
      cotizacion,
    );
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message:
          e?.response?.data?.message || "Error al actualizar la cotización",
        error: true,
      });
  }
}

export async function DeleteCotizacion(
  id: string | number,
  onEnd: (response: ResponseBase) => void,
) {
  try {
    console.log("Petición DELETE:" + BASE_URL + "/api/cotizaciones/" + id);
    const response = await api.delete("/api/cotizaciones/" + id);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message:
          e?.response?.data?.message || "Error al eliminar la cotización",
        error: true,
      });
  }
}

export async function RevalidarCotizacion(
  id: string | number,
  payload: Partial<Cotizacion> & Record<string, unknown> = {},
  onEnd: (response: ResponseBase<Cotizacion>) => void,
) {
  try {
    console.log("Petición POST:" + BASE_URL + "/api/cotizaciones/" + id + "/revalidar");
    const response = await api.post("/api/cotizaciones/" + id + "/revalidar", payload);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message:
          e?.response?.data?.message || "Error al revalidar la cotización",
        error: true,
      });
  }
}

export async function GetCotizacionesVencidas(
  onEnd: (response: ResponseBase<Cotizacion[]>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/cotizaciones/vencidas");
    const response = await api.get("/api/cotizaciones/vencidas");
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion[]>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message:
          e?.response?.data?.message || "Error al obtener las cotizaciones vencidas",
        error: true,
      });
  }
}

export async function GetCotizacionPublica(
  token: string,
  onEnd: (response: ResponseBase<Cotizacion>) => void,
) {
  try {
    console.log("Petición GET:" + BASE_URL + "/api/cotizaciones/public/" + token);
    const response = await api.get("/api/cotizaciones/public/" + token);
    console.log(response.data);
    if (onEnd) onEnd(response.data as ResponseBase<Cotizacion>);
  } catch (e: any) {
    console.error(e);
    if (onEnd)
      onEnd({
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la cotización. Verifica el enlace.",
        error: true,
      });
  }
}

export function UrlPublicaCotizacion(token?: string | null) {
  if (!token) return "";
  return `${window.location.origin}/cotizaciones/publica/${token}`;
}

export function UrlPdfCotizacion(id: string | number) {
  return `${BASE_URL}/api/cotizaciones/${id}/pdf`;
}

export function UrlPdfCotizacionPublica(token: string) {
  return `${BASE_URL}/api/cotizaciones/public/${token}/pdf`;
}
