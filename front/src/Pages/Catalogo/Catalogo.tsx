import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";
import css from "./Catalogo.module.css";
import type { Curso } from "../../types/general";
import { InputText } from "../../Components/InputText/InputText";
import { InputDate } from "../../Components/InputDate/InputDate";
import { read, utils } from "xlsx";
import { CreateCurso, GetCursos } from "../../Helpers/APIConnector";

export function Catalogo() {
  const CURSO_INICIAL: Curso = {
    codigo: "",
    id: crypto.randomUUID(),
    estado: "",
    evaluacion: new Date(),
    horas: 0,
    ingreso: new Date(),
    modalidad: "",
    modo: "",
    nivel: "",
    nombre: "",
    numeroResolucionAutorizacion: 0,
    numeroSolicitud: "",
    pago: new Date(),
    resolucion: new Date(),
    tipo: "",
    valorEfectivoParticipante: 0,
    valorFranquicia: 0,
    valorImputableParticipante: 0,
    vigencia: new Date(),
    numeroDeposito: 0,
    activo: true,
  };
  const [curso, setCurso] = useState<Curso>({ ...CURSO_INICIAL });
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [popup, setPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  console.log("🟢 RENDER - cursos.length =", cursos.length);
  useEffect(() => {
    ReloadData();
  }, []);

  function stringToDate(fechaStr: string): Date {
    if (!fechaStr) return new Date();
    const [dia, mes, anio] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia); // ✅ Se resta 1 al mes
  }
  function ReloadData() {
    console.log("Recargando data");
    GetCursos((res) => {
      if (!res.error && res.cursos) {
        setCursos(res?.cursos);
      }
    });
  }

  const handleChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setArchivo(file);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: "array" });
      const primeraHoja = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[primeraHoja];
      const jsonData: any = utils.sheet_to_json(worksheet, { defval: "" });
      if (!jsonData[0]["CODIGO CURSO"]) {
        throw new Error(
          "Ocurrio un error al importar el Excel, probablemente tenga un formato incorrecto",
        );
      }
      console.log("Datos del Excel:", jsonData);
      let cursosDataArray: Curso[] = [];
      jsonData.forEach((item: any) => {
        console.log(item);
        let cursoData: Curso = CURSO_INICIAL;
        delete cursoData.id;
        cursoData.codigo = item["CODIGO CURSO"];
        cursoData.estado = item["ESTADO"];
        cursoData.evaluacion = stringToDate(item["FECHA EVALUACION"]);
        cursoData.ingreso = stringToDate(item["FECHA INGRESO"]);
        cursoData.pago = stringToDate(item["FECHA PAGO"]);
        cursoData.resolucion = stringToDate(item["FECHA RESOLUCION"]);
        cursoData.vigencia = stringToDate(item["FECHA VIGENCIA"]);
        cursoData.modalidad = item["MODALIDAD"];
        cursoData.modo = item["MODO"];
        cursoData.nivel = item["NIVEL"];
        cursoData.nombre = item["NOMBRE CURSO"];
        cursoData.numeroDeposito = item["N° DEPOSITO"];
        cursoData.horas = item["N° HORAS"];
        cursoData.numeroResolucionAutorizacion =
          item["N° RESOLUCION AUTORIZACION"];
        cursoData.numeroSolicitud = item["N° SOLICITUD CURSO"];
        cursoData.tipo = item["TIPO"];
        cursoData.valorEfectivoParticipante =
          item["VALOR EFECTIVO PARTICIPANTE"];
        cursoData.valorFranquicia = item["VALOR FRANQUICIA"];
        cursoData.valorImputableParticipante =
          item["VALOR IMPUTABLE PARTICIPANTE"];
        cursosDataArray.push(cursoData);
        // setCursos((prev) => [...prev, cursoData]);
      });

      for (let i = 0; i < cursosDataArray.length; i++) {
        await CreateCurso(cursosDataArray[i], (res) => {
          if (!res.error) {
            console.log("Curso guardado correctamente");
            window.alert(
              `Se ha guardado correctamente el curso ${i + 1}/${cursosDataArray.length}`,
            );
          } else {
            window.alert(
              `Ha ocurrido un error al ingresar el curso ${i + 1}/${cursosDataArray.length}`,
            );
          }
        });
      }

      // cursoData.codigo = jsonData[0];
      e.target.value = "";
    } catch (e) {
      console.error();
      window.alert(e);
    }
  };

  const abrirSelector = (): void => {
    inputRef.current?.click();
  };

  return (
    <Frame>
      <div className={css.popup} style={{ display: popup ? "flex" : "none" }}>
        <div className={css.bg}></div>
        <div className={css.content}>
          <Title>{isEdit ? "Modificar curso" : "Agregar curso"}</Title>
          <div className={css.form}>
            <InputText
              label="Código"
              placeholder="Ingresa código"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, codigo: text }));
              }}
              value={curso.codigo}
            />
            <InputText
              label="Número de solicitud"
              placeholder="Ingresa el número de solicitud"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, numeroSolicitud: text }));
              }}
              value={curso.numeroSolicitud}
            />
            <InputText
              label="Nombre del curso"
              placeholder="Ingresa el nombre del curso"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, nombre: text }));
              }}
              value={curso.nombre}
            />
            <InputText
              label="Modalidad"
              placeholder="Ingresa la modalidad del curso"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, modalidad: text }));
              }}
              value={curso.modalidad}
            />
            <InputText
              label="Modo"
              placeholder="Ingresa el modo del curso"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, modo: text }));
              }}
              value={curso.modo}
            />
            <InputText
              label="Tipo"
              placeholder="Ingresa el tipo del curso"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, tipo: text }));
              }}
              value={curso.tipo}
            />
            <InputText
              label="Nivel"
              placeholder="Ingresa el nivel del curso"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, nivel: text }));
              }}
              value={curso.nivel}
            />
            <InputText
              label="Número de horas"
              placeholder="Ingresa el número de horas del curso"
              type="number"
              onChange={(text) => {
                setCurso((prev) => ({ ...prev, horas: Number(text) }));
              }}
              value={String(curso.horas)}
            />
            <InputText
              label="Valor franquicia"
              type="number"
              placeholder="Ingresa el valor franquicia"
              onChange={(text) => {
                setCurso((prev) => ({
                  ...prev,
                  valorFranquicia: Number(text),
                }));
              }}
              value={String(curso.valorFranquicia)}
            />
            <InputText
              type="number"
              label="Valor efectivo participante"
              placeholder="Ingresa el valor efectivo participante"
              onChange={(text) => {
                setCurso((prev) => ({
                  ...prev,
                  valorEfectivoParticipante: Number(text),
                }));
              }}
              value={String(curso.valorEfectivoParticipante)}
            />
            <InputText
              type="number"
              label="Valor imputable participante"
              placeholder="Ingresa el valor imputable participante"
              onChange={(text) => {
                setCurso((prev) => ({
                  ...prev,
                  valorImputableParticipante: Number(text),
                }));
              }}
              value={String(curso.valorImputableParticipante)}
            />
            <InputText
              type="number"
              label="Número resolución autorización"
              placeholder="Ingresa el número de resolución autorización"
              onChange={(text) => {
                setCurso((prev) => ({
                  ...prev,
                  numeroResolucionAutorizacion: Number(text),
                }));
              }}
              value={String(curso.numeroResolucionAutorizacion)}
            />
            <InputText
              label="Estado"
              placeholder="Ingresa el estado"
              onChange={(text) => {
                setCurso((prev) => ({
                  ...prev,
                  estado: text,
                }));
              }}
              value={curso.estado}
            />
            <InputText
              type="number"
              label="Número deposito"
              placeholder="Ingresa el número de deposito"
              onChange={(text) => {
                setCurso((prev) => ({
                  ...prev,
                  numeroDeposito: Number(text),
                }));
              }}
              value={String(curso.numeroDeposito)}
            />
            <InputDate
              label="Fecha de ingreso"
              onChange={(date) => {
                setCurso((prev) => ({
                  ...prev,
                  ingreso: date,
                }));
              }}
              value={curso.ingreso}
            />
            <InputDate
              label="Fecha de evaluación"
              onChange={(date) => {
                setCurso((prev) => ({
                  ...prev,
                  evaluacion: date,
                }));
              }}
              value={curso.evaluacion}
            />
            <InputDate
              label="Fecha de resolución"
              onChange={(date) => {
                setCurso((prev) => ({
                  ...prev,
                  resolucion: date,
                }));
              }}
              value={curso.resolucion}
            />
            <InputDate
              label="Fecha de vigencia"
              onChange={(date) => {
                setCurso((prev) => ({
                  ...prev,
                  vigencia: date,
                }));
              }}
              value={curso.vigencia}
            />
            <InputDate
              label="Fecha de pago"
              onChange={(date) => {
                setCurso((prev) => ({
                  ...prev,
                  pago: date,
                }));
              }}
              value={curso.pago}
            />
            <div className={css.row}>
              <p>¿Esta activo?</p>
              <input
                type="checkbox"
                checked={curso.activo}
                onChange={(e) => {
                  setCurso((prev) => ({
                    ...prev,
                    activo: e.target.checked,
                  }));
                }}
              />
            </div>
            <div className={css.row}>
              {isEdit ? (
                <Btn
                  onClick={() => {
                    setPopup(false);
                    setCursos((prev) => prev.filter((c) => c.id !== curso.id));
                  }}
                  warning
                >
                  Eliminar
                </Btn>
              ) : (
                ""
              )}
              <Btn
                onClick={() => {
                  setPopup(false);
                }}
              >
                Cancelar
              </Btn>
              <Btn
                onClick={() => {
                  setPopup(false);
                  if (isEdit) {
                    setCursos((prev) =>
                      prev.map((c) => (c.id === curso.id ? curso : c)),
                    );
                  } else {
                    setCursos((prev) => [...prev, curso]);
                  }
                }}
              >
                Guardar
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Box
        style={{
          flexFlow: "row wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>Catalogo de cursos</Title>
        <div className={css.actions}>
          <Btn
            onClick={() => {
              setPopup(true);
              setIsEdit(false);
              setCurso(CURSO_INICIAL);
            }}
          >
            Agregar curso manualmente
          </Btn>
          <input
            type="file"
            ref={inputRef}
            onChange={handleChange}
            accept=".xlsx, .xls"
            style={{ display: "none" }}
          />
          <Btn onClick={abrirSelector}>Importar curso desde excel</Btn>
        </div>
      </Box>
      <Box>
        <Title>Lista de cursos</Title>
        <div className={css.tableContainer}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Cód.</th>
                <th>N° Solicitud</th>
                <th>Nombre</th>
                <th>Modalidad</th>
                <th>Modo</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>N° Hrs</th>
                <th>Valor franquicia</th>
                <th>Valor efectivo pte.</th>
                <th>Valor imputable pte.</th>
                <th>N° Res. autorización</th>
                <th>Estado</th>
                <th>N° Deposito</th>
                <th>Ingreso</th>
                <th>Evaluación</th>
                <th>Resolución</th>
                <th>Vigencia</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((item, index) => {
                console.log("🟡 MAP item", index, item);
                return (
                  <tr key={index}>
                    <td
                      className={css.modificar}
                      onClick={() => {
                        setPopup(true);
                        setIsEdit(true);
                        setCurso(item);
                      }}
                    >
                      Modificar
                    </td>
                    <td>{item.codigo}</td>
                    <td>{item.numeroSolicitud}</td>
                    <td>{item.nombre}</td>
                    <td>{item.modalidad}</td>
                    <td>{item.modo}</td>
                    <td>{item.tipo}</td>
                    <td>{item.nivel}</td>
                    <td>{item.horas}</td>
                    <td>
                      ${Number(item.valorFranquicia).toLocaleString("es-CL")}
                    </td>
                    <td>
                      $
                      {Number(item.valorEfectivoParticipante).toLocaleString(
                        "es-CL",
                      )}
                    </td>
                    <td>
                      $
                      {Number(item.valorImputableParticipante).toLocaleString(
                        "es-CL",
                      )}
                    </td>
                    <td>{item.numeroResolucionAutorizacion}</td>
                    <td>{item.estado}</td>
                    <td>{item.numeroDeposito}</td>
                    <td>
                      {new Date(item.ingreso).toLocaleDateString("es-CL")}
                    </td>
                    <td>
                      {new Date(item.evaluacion).toLocaleDateString("es-CL")}
                    </td>
                    <td>
                      {new Date(item.resolucion).toLocaleDateString("es-CL")}
                    </td>
                    <td>
                      {new Date(item.vigencia).toLocaleDateString("es-CL")}
                    </td>
                    <td>{new Date(item.pago).toLocaleDateString("es-CL")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </Frame>
  );
}
