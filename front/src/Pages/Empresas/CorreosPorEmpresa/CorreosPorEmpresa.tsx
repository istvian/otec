import { useEffect, useState } from "react";
import { Box } from "../../../Components/Box/Box";
import { Frame } from "../../../Components/Frame/Frame";
import { Title } from "../../../Components/Title/Title";
import css from "./CorreosPorEmpresa.module.css";
import type { Correo, Empresa } from "../../../types/general";
import {
  GetCorreoEmpresaByID,
  GetEmpresaByID,
} from "../../../Helpers/APIConnector";
import { Link, useParams } from "react-router-dom";

export function CorreosPorEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa>();
  const [correos, setCorreos] = useState<Correo[]>([]);
  const { id } = useParams();
  useEffect(() => {
    if (!id) return;
    GetEmpresaByID(id, (res) => {
      if (res && res.data) setEmpresa(res.data);
    });
  }, []);
  useEffect(() => {
    if (!id || !empresa) return;
    console.log("Obteniendo correos");
    GetCorreoEmpresaByID(id, (res) => {
      if (res && res.data) {
        const empresaMails = empresa?.contactos.map((contacto) =>
          contacto.correo.toLowerCase().trim(),
        );
        console.log(empresaMails);
        const raw = res.data;
        const final = raw.filter((item) => empresaMails?.includes(item.from));
        setCorreos([...final]);
      }
    });
  }, [empresa]);
  return (
    <Frame>
      <Box>
        <Title>
          <Link to={"/empresas"}>Empresas </Link> {">"} Lista de correos
        </Title>
        <p>Empresa: {empresa?.razon}</p>
      </Box>
      <Box>
        <p>Se han encontrado {correos?.length | 0} correos</p>
        <div className={css.list}>
          {correos?.map((item, index) => {
            return (
              <div className={css.correo} key={index}>
                <p className={css.text}>
                  Fecha: {new Date(item.date).toLocaleString("es-CL")}
                </p>
                <p className={css.text}>Asunto: {item.asunto}</p>
                <p className={css.text}>Contenido: {item.contenido}</p>
                <p className={css.text}>De: {item.from}</p>
              </div>
            );
          })}
        </div>
      </Box>
    </Frame>
  );
}
