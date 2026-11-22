import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "../../../Components/Box/Box";
import { Btn } from "../../../Components/Btn/Btn";
import { Frame } from "../../../Components/Frame/Frame";
import { InputDate } from "../../../Components/InputDate/InputDate";
import { InputText } from "../../../Components/InputText/InputText";
import { Selector } from "../../../Components/Selector/Selector";
import { Title } from "../../../Components/Title/Title";
import css from "./CrearNegocio.module.css";

interface EmpresaOption {
  id: number;
  nombre?: string;
  razon_social?: string;
  razonSocial?: string;
}

interface VendedorOption {
  id: number;
  nombre: string;
  rolID?: number;
}

interface CursoOption {
  id: number;
  nombre?: string;
  nombre_comercial?: string;
  nombre_oficial?: string;
  titulo?: string;
}

const ROL_VENDEDOR = 2; // RolEnum.VENDEDOR = 2
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;
const ESTADOS_NEGOCIO = ["Abierto", "Ganado", "Perdido/Vencido"];

export function CrearNegocio() {
  const nav = useNavigate();

  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [cursos, setCursos] = useState<CursoOption[]>([]);

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("");
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<string>("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("Abierto");
  const [montoTotal, setMontoTotal] = useState<string>("0");
  const [fechaCierre, setFechaCierre] = useState<Date>(new Date());

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resEmp, resUsr, resCursos, resCursosCom] = await Promise.allSettled([
          fetch(`${API_URL}/empresa`, { credentials: "include" }),
          fetch(`${API_URL}/user?rolID=${ROL_VENDEDOR}`, { credentials: "include" }),
          fetch(`${API_URL}/curso`, { credentials: "include" }),
          fetch(`${API_URL}/curso-comercial`, { credentials: "include" }),
        ]);

        if (resEmp.status === "fulfilled" && resEmp.value.ok) {
          const jsonEmp = await resEmp.value.json();
          const listaEmp = Array.isArray(jsonEmp) ? jsonEmp : jsonEmp?.data || [];
          setEmpresas(listaEmp);
        }

        if (resUsr.status === "fulfilled" && resUsr.value.ok) {
          const jsonUsr = await resUsr.value.json();
          const listaUsr = Array.isArray(jsonUsr) ? jsonUsr : jsonUsr?.data || [];
          const soloVendedores = listaUsr.filter(
            (u: VendedorOption) => u.rolID === ROL_VENDEDOR
          );
          setVendedores(soloVendedores);
        }

        const cursosAcumulados: CursoOption[] = [];
        if (resCursos.status === "fulfilled" && resCursos.value.ok) {
          const jsonCur = await resCursos.value.json();
          const listaCur = Array.isArray(jsonCur) ? jsonCur : jsonCur?.data || [];
          cursosAcumulados.push(...listaCur);
        }
        if (resCursosCom.status === "fulfilled" && resCursosCom.value.ok) {
          const jsonCom = await resCursosCom.value.json();
          const listaCom = Array.isArray(jsonCom) ? jsonCom : jsonCom?.data || [];
          cursosAcumulados.push(...listaCom);
        }
        setCursos(cursosAcumulados);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      }
    };

    cargarDatos();
  }, []);

  const opcionesEmpresas = empresas.map(
    (e) => e.razon_social || e.razonSocial || e.nombre || `Empresa #${e.id}`
  );
  const opcionesVendedores = vendedores.map(
    (v) => v.nombre || `Vendedor #${v.id}`
  );
  const opcionesCursos = [
    "Sin curso",
    ...cursos.map(
      (c) =>
        c.nombre_comercial ||
        c.nombre ||
        c.nombre_oficial ||
        c.titulo ||
        `Curso #${c.id}`
    ),
  ];

  useEffect(() => {
    if (opcionesEmpresas.length > 0 && !empresaSeleccionada) {
      setEmpresaSeleccionada(opcionesEmpresas[0]);
    }
  }, [opcionesEmpresas, empresaSeleccionada]);

  useEffect(() => {
    if (opcionesVendedores.length > 0 && !vendedorSeleccionado) {
      setVendedorSeleccionado(opcionesVendedores[0]);
    }
  }, [opcionesVendedores, vendedorSeleccionado]);

  useEffect(() => {
    if (!cursoSeleccionado && opcionesCursos.length > 0) {
      setCursoSeleccionado(opcionesCursos.length > 1 ? opcionesCursos[1] : "Sin curso");
    }
  }, [opcionesCursos, cursoSeleccionado]);

  const resolverIdEmpresa = (valor: string) => {
    const idx = opcionesEmpresas.findIndex((op) => op === valor);
    if (idx !== -1) return empresas[idx].id;
    if (!valor && empresas.length > 0) return empresas[0].id;
    const num = Number(valor);
    return Number.isNaN(num) ? 0 : num;
  };

  const resolverIdVendedor = (valor: string) => {
    const idx = opcionesVendedores.findIndex((op) => op === valor);
    if (idx !== -1) return vendedores[idx].id;
    if (!valor && vendedores.length > 0) return vendedores[0].id;
    const num = Number(valor);
    return Number.isNaN(num) ? 0 : num;
  };

  const resolverIdCurso = (valor: string): number | null => {
    if (!valor || valor === "Sin curso") return null;
    const idx = opcionesCursos.findIndex((op) => op === valor);
    if (idx > 0 && cursos[idx - 1]) return cursos[idx - 1].id;
    const num = Number(valor);
    return Number.isNaN(num) ? null : num;
  };

  const handleCrearNegocio = async () => {
    setError(null);

    const empresaID = resolverIdEmpresa(empresaSeleccionada);
    const vendedorID = resolverIdVendedor(vendedorSeleccionado);
    const cursoID = resolverIdCurso(cursoSeleccionado);

    if (!empresaID || !vendedorID) {
      setError("Debes seleccionar una empresa y un vendedor.");
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch(`${API_URL}/negocios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          empresaID,
          vendedorID,
          cursoID,
          estado: estadoSeleccionado || "Abierto",
          montoTotal: Number(montoTotal) || 0,
          fechaCierre: fechaCierre.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo crear el negocio");
      }

      nav("/negocios");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el negocio");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Frame>
      <Box>
        <Title>Crear negocio</Title>
        <p>Complete los datos</p>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div className={css.form}>
          <Selector
            title="Empresa"
            firstOption="Selecciona una empresa"
            data={empresaSeleccionada}
            options={opcionesEmpresas.length > 0 ? opcionesEmpresas : ["Sin empresas"]}
            setData={setEmpresaSeleccionada}
          />
          <Selector
            title="Vendedor"
            firstOption="Selecciona un vendedor"
            data={vendedorSeleccionado}
            options={opcionesVendedores.length > 0 ? opcionesVendedores : ["Sin vendedores"]}
            setData={setVendedorSeleccionado}
          />
          <Selector
            title="Curso"
            firstOption="Selecciona un curso"
            data={cursoSeleccionado}
            options={opcionesCursos}
            setData={setCursoSeleccionado}
          />
          <Selector
            title="Estado"
            firstOption="Selecciona un estado"
            data={estadoSeleccionado}
            options={ESTADOS_NEGOCIO}
            setData={setEstadoSeleccionado}
          />
          <InputText
            label="Monto total"
            type="number"
            onChange={(text: string) => setMontoTotal(text)}
            placeholder="Ingrese el monto total"
            value={montoTotal}
          />
          <InputDate
            label="Fecha de cierre"
            onChange={(e: any) => {
              const nuevaFecha = e?.target?.value ? new Date(e.target.value) : e;
              if (nuevaFecha instanceof Date && !Number.isNaN(nuevaFecha.getTime())) {
                setFechaCierre(nuevaFecha);
              }
            }}
            value={fechaCierre}
          />
          <Btn onClick={guardando ? () => {} : handleCrearNegocio}>
            {guardando ? "Guardando..." : "Crear negocio"}
          </Btn>
        </div>
      </Box>
    </Frame>
  );
}