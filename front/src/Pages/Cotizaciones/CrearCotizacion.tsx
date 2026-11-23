import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";
import { InputText } from "../../Components/InputText/InputText";
import { Selector } from "../../Components/Selector/Selector";
import {
  CreateCotizacion,
  GetCotizacionById,
  RevalidarCotizacion,
  UpdateCotizacion,
  UrlPublicaCotizacion,
} from "../../Helpers/APIConnector";
import type {
  Contacto,
  Cotizacion,
  Curso,
  CursoComercial,
  Empresa,
} from "../../types/general";
import css from "./CrearCotizacion.module.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

const ESTADOS = ["Borrador", "Enviada", "Aceptada", "Rechazada"];

interface FormCotizacion {
  negocioID: number;
  empresaID: number;
  contactoID: number;
  cursoID: number;
  cursoComercialID: number;
  nombreCurso: string;
  nombreCliente: string;
  clienteRut: string;
  clienteDireccion: string;
  contactoNombre: string;
  contactoCorreo: string;
  contactoTelefono: string;
  objetivosCustom: string;
  temarioCustom: string;
  cantidadAlumnos: number;
  valorAlumno: number;
  descuento: number;
  estado: string;
  validezDias: number;
  observaciones: string;
  condiciones: string;
}

const FORM_INICIAL: FormCotizacion = {
  negocioID: 0,
  empresaID: 0,
  contactoID: 0,
  cursoID: 0,
  cursoComercialID: 0,
  nombreCurso: "",
  nombreCliente: "",
  clienteRut: "",
  clienteDireccion: "",
  contactoNombre: "",
  contactoCorreo: "",
  contactoTelefono: "",
  objetivosCustom: "",
  temarioCustom: "",
  cantidadAlumnos: 1,
  valorAlumno: 0,
  descuento: 0,
  estado: "Borrador",
  validezDias: 15,
  observaciones: "",
  condiciones: "",
};

const formatoCLP = (monto: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(monto) ? monto : 0);

export function CrearCotizacion() {
  const nav = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preEmpresaID = Number(searchParams.get("empresaID")) || 0;
  const preCursoID = Number(searchParams.get("cursoID")) || 0;
  const preNegocioID = Number(searchParams.get("negocioID")) || 0;
  const esEdicion = Boolean(id);

  const [form, setForm] = useState<FormCotizacion>({ ...FORM_INICIAL });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosComerciales, setCursosComerciales] = useState<CursoComercial[]>(
    [],
  );
  const [tokenPublico, setTokenPublico] = useState<string>("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCatalogos = async () => {
    const safeJson = async (url: string) => {
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || [];
      } catch {
        return [];
      }
    };

    const [listaEmpresas, listaCursos, listaComerciales] = await Promise.all([
      safeJson(`${API_URL}/empresa`),
      safeJson(`${API_URL}/curso`),
      safeJson(`${API_URL}/comercial`),
    ]);

    setEmpresas(listaEmpresas as Empresa[]);
    setCursos(listaCursos as Curso[]);
    setCursosComerciales(listaComerciales as CursoComercial[]);

    return {
      empresas: listaEmpresas as Empresa[],
      cursos: listaCursos as Curso[],
    };
  };

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const datos = await cargarCatalogos();

      if (id) {
        GetCotizacionById(id, (res) => {
          if (res.error || !res.data) {
            setError(res.message || "No se pudo cargar la cotización.");
            setCargando(false);
            return;
          }
          const cot = res.data;
          setForm({
            negocioID: Number(cot.negocioID || 0),
            empresaID: Number(cot.empresaID || 0),
            contactoID: Number(cot.contactoID || 0),
            cursoID: Number(cot.cursoID || 0),
            cursoComercialID: Number(cot.cursoComercialID || 0),
            nombreCurso: cot.nombreCurso || cot.curso?.nombre || "",
            nombreCliente: cot.nombreCliente || cot.empresa?.razon || "",
            clienteRut: cot.clienteRut || cot.empresa?.rut || "",
            clienteDireccion:
              cot.clienteDireccion || cot.empresa?.direccion || "",
            contactoNombre:
              cot.contactoNombre || cot.contacto?.nombre || "",
            contactoCorreo:
              cot.contactoCorreo || cot.contacto?.correo || "",
            contactoTelefono:
              cot.contactoTelefono || cot.contacto?.telefono || "",
            objetivosCustom: cot.objetivosCustom || "",
            temarioCustom: cot.temarioCustom || "",
            cantidadAlumnos: Number(cot.cantidadAlumnos || 1),
            valorAlumno: Number(cot.valorAlumno || 0),
            descuento: Number(cot.descuento || 0),
            estado: cot.estado || "Borrador",
            validezDias: Number(cot.validezDias || 15),
            observaciones: cot.observaciones || "",
            condiciones: cot.condiciones || "",
          });
          setTokenPublico(cot.tokenPublico || "");
          setCargando(false);
        });
      } else {
        const empresaID = preEmpresaID;
        const cursoIDParam = preCursoID;
        const negocioID = preNegocioID;
        const empresa = datos.empresas.find((e) => e.id === empresaID);
        const curso = datos.cursos.find(
          (c) => Number(c.id) === cursoIDParam,
        );

        if (empresaID || curso || negocioID) {
          setForm((prev) => ({
            ...prev,
            negocioID,
            empresaID,
            nombreCliente: empresa?.razon || prev.nombreCliente,
            clienteRut: empresa?.rut || prev.clienteRut,
            clienteDireccion:
              empresa?.direccion || prev.clienteDireccion,
            cursoID: curso ? Number(curso.id) : 0,
            nombreCurso: curso?.nombre || prev.nombreCurso,
            valorAlumno: curso
              ? Number(curso.valorEfectivoParticipante || 0)
              : prev.valorAlumno,
          }));
        }
        setCargando(false);
      }
    };

    cargar();
  }, [id, preEmpresaID, preCursoID, preNegocioID]);

  const empresaActual = empresas.find((emp) => emp.id === form.empresaID);
  const contactos: Contacto[] = empresaActual?.contactos || [];
  const cursoActual = cursos.find((curso) => curso.id === form.cursoID);
  const comercialesDisponibles = useMemo(
    () =>
      cursosComerciales.filter(
        (comercial) => !form.cursoID || comercial.cursoID === form.cursoID,
      ),
    [cursosComerciales, form.cursoID],
  );

  const subtotal = Math.round(
    Math.max(0, Number(form.cantidadAlumnos || 0)) *
      Math.max(0, Number(form.valorAlumno || 0)),
  );
  const total = Math.max(0, subtotal - Math.max(0, Number(form.descuento || 0)));

  const actualizarCampo = <K extends keyof FormCotizacion>(
    campo: K,
    valor: FormCotizacion[K],
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const seleccionarEmpresa = (valor: string) => {
    const empresaID = Number(valor) || 0;
    const empresa = empresas.find((emp) => emp.id === empresaID);
    setForm((prev) => ({
      ...prev,
      empresaID,
      contactoID: 0,
      nombreCliente: empresa?.razon || "",
      clienteRut: empresa?.rut || "",
      clienteDireccion: empresa?.direccion || "",
      contactoNombre: "",
      contactoCorreo: "",
      contactoTelefono: "",
    }));
  };

  const seleccionarContacto = (valor: string) => {
    const contactoID = Number(valor) || 0;
    const contacto = contactos.find((c) => c.id === contactoID);
    setForm((prev) => ({
      ...prev,
      contactoID,
      contactoNombre: contacto?.nombre || "",
      contactoCorreo: contacto?.correo || "",
      contactoTelefono: contacto?.telefono || "",
    }));
  };

  const seleccionarCurso = (valor: string) => {
    const cursoID = Number(valor) || 0;
    const curso = cursos.find((c) => c.id === cursoID);
    setForm((prev) => ({
      ...prev,
      cursoID,
      cursoComercialID: 0,
      nombreCurso: curso?.nombre || prev.nombreCurso,
      valorAlumno:
        curso?.valorEfectivoParticipante !== undefined
          ? Number(curso.valorEfectivoParticipante)
          : prev.valorAlumno,
    }));
  };

  const seleccionarCursoComercial = (valor: string) => {
    const cursoComercialID = Number(valor) || 0;
    const comercial = cursosComerciales.find(
      (c) => c.id === cursoComercialID,
    );
    setForm((prev) => ({
      ...prev,
      cursoComercialID,
      nombreCurso: comercial?.nombre || prev.nombreCurso,
      objetivosCustom: comercial?.objetivos || prev.objetivosCustom,
      temarioCustom: comercial?.temario || prev.temarioCustom,
    }));
  };

  const guardar = () => {
    setError(null);

    if (!form.cursoID) {
      setError("Debes seleccionar un curso SENCE base.");
      return;
    }
    if (!form.nombreCliente.trim()) {
      setError("Debes seleccionar una empresa cliente.");
      return;
    }
    if (!form.temarioCustom.trim()) {
      setError("El temario es obligatorio. Puedes personalizarlo en texto plano.");
      return;
    }
    if (Number(form.cantidadAlumnos) < 1) {
      setError("La cantidad de participantes debe ser al menos 1.");
      return;
    }

    const payload = {
      negocioID: form.negocioID || null,
      empresaID: form.empresaID || null,
      contactoID: form.contactoID || null,
      cursoID: form.cursoID,
      cursoComercialID: form.cursoComercialID || null,
      nombreCurso: form.nombreCurso,
      nombreCliente: form.nombreCliente,
      clienteRut: form.clienteRut,
      clienteDireccion: form.clienteDireccion,
      contactoNombre: form.contactoNombre,
      contactoCorreo: form.contactoCorreo,
      contactoTelefono: form.contactoTelefono,
      objetivosCustom: form.objetivosCustom,
      temarioCustom: form.temarioCustom,
      cantidadAlumnos: Number(form.cantidadAlumnos),
      valorAlumno: Number(form.valorAlumno),
      descuento: Number(form.descuento),
      estado: form.estado,
      validezDias: Number(form.validezDias),
      observaciones: form.observaciones,
      condiciones: form.condiciones,
    };

    setGuardando(true);
    const onEnd = (res: { message: string; error: boolean; data?: Cotizacion | null }) => {
      setGuardando(false);
      if (res.error) {
        setError(res.message);
        return;
      }
      const token = res.data?.tokenPublico || tokenPublico;
      const url = UrlPublicaCotizacion(token);
      window.alert(
        `${res.message}${url ? `\n\nEnlace público: ${url}` : ""}`,
      );
      nav("/cotizaciones");
    };

    if (esEdicion && id) {
      UpdateCotizacion({ ...payload, id: Number(id) }, onEnd);
    } else {
      CreateCotizacion(payload, onEnd);
    }
  };

  const revalidar = () => {
    if (!id) return;
    if (!confirm("¿Revalidar y extender la vigencia de esta cotización?")) return;
    RevalidarCotizacion(
      Number(id),
      { validezDias: form.validezDias || 15, regenerarEnlace: true },
      (res) => {
        if (res.error || !res.data) {
          window.alert(res.message);
          return;
        }
        const token = res.data.tokenPublico || tokenPublico;
        setTokenPublico(token || "");
        setForm((prev) => ({
          ...prev,
          validezDias: Number(res.data?.validezDias || prev.validezDias),
        }));
        const url = token ? UrlPublicaCotizacion(token) : "";
        window.alert(
          `${res.message}${url ? `\n\nNuevo enlace público: ${url}` : ""}`,
        );
      },
    );
  };

  const copiarEnlace = async () => {
    const url = UrlPublicaCotizacion(tokenPublico);
    if (!url) {
      window.alert("Guarda la cotización para generar el enlace público.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      window.alert("Enlace público copiado al portapapeles.");
    } catch {
      window.prompt("Copia el enlace público:", url);
    }
  };

  return (
    <Frame>
      <Box>
        <Title>
          <Link to="/cotizaciones">Cotizaciones</Link> {">"}{" "}
          {esEdicion ? "Editar cotización" : "Nueva cotización"}
        </Title>
        <p className={css.subtitulo}>
          Personaliza el temario en texto plano, vincula el curso a su código
          SENCE y el total se calcula automáticamente.
        </p>
      </Box>

      {cargando ? (
        <Box>
          <p>Cargando datos...</p>
        </Box>
      ) : (
        <div className={css.layout}>
          <Box style={{ flex: "2 1 620px", width: "auto", minWidth: 0 }}>
            {error && <p className={css.error}>{error}</p>}

            <section className={css.seccion}>
              <h2>1. Cliente</h2>
              <div className={css.grid}>
                <div className={css.campo}>
                  <label>Empresa cliente *</label>
                  <Selector
                    title=""
                    firstOption="Selecciona una empresa"
                    data={empresas.find((e) => e.id === form.empresaID)?.razon || ""}
                    options={empresas.map((e) => e.razon)}
                    setData={(label) => {
                      const emp = empresas.find((e) => e.razon === label);
                      seleccionarEmpresa(String(emp?.id || 0));
                    }}
                  />
                </div>

                <div className={css.campo}>
                  <label>Contacto</label>
                  <Selector
                    title=""
                    firstOption={
                      contactos.length === 0
                        ? "Empresa sin contactos"
                        : "Selecciona un contacto"
                    }
                    data={
                      contactos.find((c) => c.id === form.contactoID)
                        ? `${contactos.find((c) => c.id === form.contactoID)?.nombre} ${contactos.find((c) => c.id === form.contactoID)?.cargo ? `· ${contactos.find((c) => c.id === form.contactoID)?.cargo}` : ""}`
                        : ""
                    }
                    options={contactos.map((c) =>
                      `${c.nombre} ${c.cargo ? `· ${c.cargo}` : ""}`
                    )}
                    setData={(label) => {
                      const c = contactos.find(
                        (x) => `${x.nombre} ${x.cargo ? `· ${x.cargo}` : ""}` === label
                      );
                      seleccionarContacto(String(c?.id || 0));
                    }}
                    isDisabled={contactos.length === 0}
                  />
                </div>

                <div className={css.campo}>
                  <label>RUT del cliente</label>
                  <InputText
                    label=""
                    value={form.clienteRut}
                    onChange={(text) => actualizarCampo("clienteRut", text)}
                    placeholder="Ej: 76.123.456-7"
                  />
                </div>

                <div className={css.campo}>
                  <label>Dirección</label>
                  <InputText
                    label=""
                    value={form.clienteDireccion}
                    onChange={(text) =>
                      actualizarCampo("clienteDireccion", text)
                    }
                    placeholder="Dirección del cliente"
                  />
                </div>

                <div className={css.campo}>
                  <label>Nombre del contacto</label>
                  <InputText
                    label=""
                    value={form.contactoNombre}
                    onChange={(text) =>
                      actualizarCampo("contactoNombre", text)
                    }
                    placeholder="Nombre de quien recibe la propuesta"
                  />
                </div>

                <div className={css.campo}>
                  <label>Correo del contacto</label>
                  <InputText
                    label=""
                    type="email"
                    value={form.contactoCorreo}
                    onChange={(text) =>
                      actualizarCampo("contactoCorreo", text)
                    }
                    placeholder="contacto@empresa.cl"
                  />
                </div>
              </div>
            </section>

            <section className={css.seccion}>
              <h2>2. Programa y temario</h2>
              <div className={css.grid}>
                <div className={css.campo}>
                  <label>Curso SENCE base *</label>
                  <Selector
                    title=""
                    firstOption="Selecciona un curso SENCE"
                    data={
                      cursos.find((c) => c.id === form.cursoID)
                        ? `${cursos.find((c) => c.id === form.cursoID)?.codigo} - ${cursos.find((c) => c.id === form.cursoID)?.nombre}`
                        : ""
                    }
                    options={cursos.map((c) => `${c.codigo} - ${c.nombre}`)}
                    setData={(label) => {
                      const c = cursos.find((x) => `${x.codigo} - ${x.nombre}` === label);
                      seleccionarCurso(String(c?.id || 0));
                    }}
                  />
                </div>

                <div className={css.campo}>
                  <label>Temario comercial base</label>
                  <Selector
                    title=""
                    firstOption={
                      comercialesDisponibles.length === 0
                        ? "Sin temarios para este curso"
                        : "Personalizar desde cero"
                    }
                    data={
                      comercialesDisponibles.find((c) => c.id === form.cursoComercialID)?.nombre || ""
                    }
                    options={comercialesDisponibles.map((c) => c.nombre)}
                    setData={(label) => {
                      const c = comercialesDisponibles.find((x) => x.nombre === label);
                      seleccionarCursoComercial(String(c?.id || 0));
                    }}
                    isDisabled={comercialesDisponibles.length === 0}
                  />
                </div>
              </div>

              {cursoActual && (
                <div className={css.fichaCurso}>
                  <span>
                    <strong>Código SENCE:</strong> {cursoActual.codigo}
                  </span>
                  <span>
                    <strong>Modalidad:</strong> {cursoActual.modalidad}
                  </span>
                  <span>
                    <strong>Horas:</strong> {cursoActual.horas}
                  </span>
                  <span>
                    <strong>Valor referencial:</strong>{" "}
                    {formatoCLP(
                      Number(cursoActual.valorEfectivoParticipante || 0),
                    )}
                  </span>
                </div>
              )}

              <div className={css.campo}>
                <label>Nombre comercial del curso</label>
                <InputText
                  label=""
                  value={form.nombreCurso}
                  onChange={(text) =>
                    actualizarCampo("nombreCurso", text)
                  }
                  placeholder="Nombre que verá el cliente"
                />
              </div>

              <div className={css.campo}>
                <label>Objetivos</label>
                <InputText
                  label=""
                  isArea
                  value={form.objetivosCustom}
                  onChange={(text) =>
                    actualizarCampo("objetivosCustom", text)
                  }
                  placeholder="Describe los objetivos del curso en texto plano."
                />
              </div>

              <div className={css.campo}>
                <label>Temario *</label>
                <InputText
                  label=""
                  isArea
                  value={form.temarioCustom}
                  onChange={(text) =>
                    actualizarCampo("temarioCustom", text)
                  }
                  placeholder={"Módulo 1: ...\nMódulo 2: ...\nMódulo 3: ..."}
                />
                <small>
                  Texto plano: se respetan los saltos de línea. No se permite
                  HTML.
                </small>
              </div>
            </section>

            <section className={css.seccion}>
              <h2>3. Valores y vigencia</h2>
              <div className={css.grid}>
                <div className={css.campo}>
                  <label>Cantidad de participantes *</label>
                  <InputText
                    label=""
                    type="number"
                    value={String(form.cantidadAlumnos)}
                    onChange={(text) =>
                      actualizarCampo(
                        "cantidadAlumnos",
                        Math.max(1, Number(text) || 1),
                      )
                    }
                    placeholder="Cantidad de participantes"
                  />
                </div>

                <div className={css.campo}>
                  <label>Valor por alumno (CLP) *</label>
                  <InputText
                    label=""
                    type="number"
                    value={String(form.valorAlumno)}
                    onChange={(text) =>
                      actualizarCampo(
                        "valorAlumno",
                        Math.max(0, Number(text) || 0),
                      )
                    }
                    placeholder="Valor por alumno"
                  />
                </div>

                <div className={css.campo}>
                  <label>Descuento (CLP)</label>
                  <InputText
                    label=""
                    type="number"
                    value={String(form.descuento)}
                    onChange={(text) =>
                      actualizarCampo(
                        "descuento",
                        Math.max(0, Number(text) || 0),
                      )
                    }
                    placeholder="Descuento"
                  />
                </div>

                <div className={css.campo}>
                  <label>Validez (días)</label>
                  <InputText
                    label=""
                    type="number"
                    value={String(form.validezDias)}
                    onChange={(text) =>
                      actualizarCampo(
                        "validezDias",
                        Math.max(1, Number(text) || 1),
                      )
                    }
                    placeholder="Validez (días)"
                  />
                </div>

                <div className={css.campo}>
                  <label>Estado</label>
                  <Selector
                    title=""
                    firstOption="Estado"
                    data={form.estado}
                    options={ESTADOS}
                    setData={(val) => actualizarCampo("estado", val)}
                  />
                </div>
              </div>

              <div className={css.campo}>
                <label>Observaciones</label>
                <InputText
                  label=""
                  isArea
                  value={form.observaciones}
                  onChange={(text) =>
                    actualizarCampo("observaciones", text)
                  }
                  placeholder="Notas visibles en la cotización."
                />
              </div>

              <div className={css.campo}>
                <label>Condiciones comerciales</label>
                <InputText
                  label=""
                  isArea
                  value={form.condiciones}
                  onChange={(text) =>
                    actualizarCampo("condiciones", text)
                  }
                  placeholder="Ej: valores netos, plazos de pago, condiciones de ejecución."
                />
              </div>
            </section>
          </Box>

          <aside className={css.resumen}>
            <h2>Resumen de la cotización</h2>
            <div className={css.resumenFila}>
              <span>Cliente</span>
              <strong>{form.nombreCliente || "Sin cliente"}</strong>
            </div>
            <div className={css.resumenFila}>
              <span>Curso SENCE</span>
              <strong>{cursoActual?.codigo || "Sin curso"}</strong>
            </div>
            <div className={css.resumenFila}>
              <span>Participantes</span>
              <strong>{form.cantidadAlumnos}</strong>
            </div>
            <div className={css.resumenFila}>
              <span>Valor por alumno</span>
              <strong>{formatoCLP(Number(form.valorAlumno || 0))}</strong>
            </div>
            <div className={css.resumenFila}>
              <span>Subtotal</span>
              <strong>{formatoCLP(subtotal)}</strong>
            </div>
            <div className={css.resumenFila}>
              <span>Descuento</span>
              <strong>- {formatoCLP(Number(form.descuento || 0))}</strong>
            </div>
            <div className={css.resumenTotal}>
              <span>Total</span>
              <strong>{formatoCLP(total)}</strong>
            </div>
            <p className={css.calculo}>
              {form.cantidadAlumnos} participantes ×{" "}
              {formatoCLP(Number(form.valorAlumno || 0))} ={" "}
              {formatoCLP(subtotal)}
            </p>

            <div className={css.preview}>
              <span>Vista previa del temario</span>
              <pre>
                {form.temarioCustom.trim() ||
                  "Aún no has escrito el temario de la cotización."}
              </pre>
            </div>

            {esEdicion && tokenPublico && (
              <div className={css.enlaceBox}>
                <span>Enlace público de solo lectura</span>
                <InputText
                label=""
                value={UrlPublicaCotizacion(tokenPublico)}
                onChange={() => {}}
                disabled
                placeholder="Enlace público"
              />
                <button className={css.copiar} onClick={copiarEnlace}>
                  Copiar enlace
                </button>
              </div>
            )}

            {esEdicion && (
              <div className={css.enlaceBox}>
                <button className={css.copiar} onClick={revalidar}>
                  Revalidar / Extender vigencia
                </button>
              </div>
            )}

            <div className={css.botones}>
              <Btn onClick={() => nav("/cotizaciones")}>Cancelar</Btn>
              <Btn onClick={guardando ? () => {} : guardar} disabled={guardando}>
                {guardando
                  ? "Guardando..."
                  : esEdicion
                    ? "Guardar cambios"
                    : "Crear cotización"}
              </Btn>
            </div>
          </aside>
        </div>
      )}
    </Frame>
  );
}

export default CrearCotizacion;
