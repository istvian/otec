import { Link, useNavigate, useParams } from "react-router-dom";
import { Box } from "../../../Components/Box/Box";
import { Frame } from "../../../Components/Frame/Frame";
import { Title } from "../../../Components/Title/Title";
import css from "./CrearCurso.module.css";
import { InputText } from "../../../Components/InputText/InputText";
import type { Curso, CursoComercial } from "../../../types/general";
import { useEffect, useState } from "react";
import { Btn } from "../../../Components/Btn/Btn";
import {
  CreateCursoComercial,
  GetCursoById,
} from "../../../Helpers/APIConnector";

export function CrearCurso() {
  const BASE_CURSO_COMERCIAL: CursoComercial = {
    nombre: "",
    objetivos: "",
    temario: "",
    cursoID: 0,
  };
  const nav = useNavigate();
  const [curso, setCurso] = useState<Curso>();
  const [cursoComercial, setCursoComercial] = useState<CursoComercial>({
    ...BASE_CURSO_COMERCIAL,
  });
  const { id } = useParams();
  console.log(id);

  useEffect(() => {
    if (id) {
      GetCursoById(id, (res) => {
        if (res.data) setCurso(res.data);
        console.log(res);
        setCursoComercial((prev) => ({
          ...prev,
          cursoID: Number(res.data?.id),
        }));
      });
    }
  }, [id]);
  useEffect(() => {
    console.log(cursoComercial);
  }, [cursoComercial]);

  const handleGuardar = async () => {
    // Validaciones varias
    CreateCursoComercial(cursoComercial, (res) => {
      if (!res.error) {
        console.log(res.data);
        console.log(res.message);
        alert(res.message);
        nav("/catalogo");
      }
    });
  };
  return (
    <Frame>
      <Box>
        <Title>
          <Link to="/catalogo">Catalogo</Link> {">"} Crear curso comercial
        </Title>
      </Box>
      <Box>
        <p>
          Basandose en el código SENCE {curso?.codigo} - Curso: {curso?.nombre}
        </p>
        <p>Complete el siguiente formulario</p>
        <form className={css.form} onSubmit={(e) => e.preventDefault()}>
          <InputText
            label="Nombre"
            onChange={(text) => {
              setCursoComercial((prev) => ({ ...prev, nombre: text }));
            }}
            placeholder="Ingresa el nombre del Curso Comercial"
            value={cursoComercial.nombre}
          />
          <InputText
            label="Objetivos"
            isArea
            onChange={(text) => {
              setCursoComercial((prev) => ({ ...prev, objetivos: text }));
            }}
            placeholder="Ingresa los objetivos del curso"
            value={cursoComercial.objetivos}
          />
          <InputText
            label="Temario"
            isArea
            onChange={(text) => {
              setCursoComercial((prev) => ({ ...prev, temario: text }));
            }}
            placeholder="Ingresa el temario del curso"
            value={cursoComercial.temario}
          />
          <Btn onClick={handleGuardar}>Crear curso</Btn>
        </form>
      </Box>
    </Frame>
  );
}
