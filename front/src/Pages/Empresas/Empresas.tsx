import { useNavigate } from "react-router-dom";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";
import css from "./Empresas.module.css";
import { useEffect, useState } from "react";
import { GetEmpresas } from "../../Helpers/APIConnector";
import type { Empresa } from "../../types/general";
import { CellBtn } from "../../Components/CellBtn/CellBtn";

export function Empresas() {
  const BASE_EMPRESA: Empresa = {
    contactos: [],
    razon: "",
    rut: "",
    direccion: "",
  };
  const nav = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa>({
    ...BASE_EMPRESA,
  });
  useEffect(() => {
    GetEmpresas((res) => {
      if (res.data) setEmpresas(res.data);
    });
  }, []);
  return (
    <Frame>
      <Box>
        <Title>Empresas</Title>
      </Box>
      <Box>
        <div className={css.row}>
          <Title>Listado de empresas</Title>
          <Btn
            onClick={() => {
              nav("/empresas/crear");
            }}
          >
            Crear empresa
          </Btn>
        </div>
        <div className={css.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>-</th>
                <th>Razón social</th>
                <th>RUT</th>
                <th>Dirección</th>
                <th>Contactos</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((item, index) => {
                return (
                  <tr key={index}>
                    <CellBtn
                      onClick={() => {
                        nav(`/empresas/crear/${item.id}`);
                      }}
                    >
                      Modificar
                    </CellBtn>
                    <td>{item.razon}</td>
                    <td>{item.rut}</td>
                    <td>{item.direccion}</td>
                    {item.contactos.length > 0 ? (
                      <CellBtn
                        onClick={() => {
                          setSelectedEmpresa(item);
                        }}
                      >
                        Ver contactos
                      </CellBtn>
                    ) : (
                      <td>Sin contactos</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
      {selectedEmpresa ? (
        <Box>
          <Title>Contactos de {selectedEmpresa.razon}</Title>
          <div className={css.contactos}>
            {selectedEmpresa.contactos.map((item, index) => {
              return (
                <div className={css.contacto} key={index}>
                  <p>
                    <b>Nombre:</b> {item.nombre}
                  </p>
                  <p>
                    <b>Cargo:</b> {item.cargo}
                  </p>
                  <p>
                    <b>Correo:</b> {item.correo}
                  </p>
                  <p>
                    <b>Teléfono:</b> {item.telefono}
                  </p>
                </div>
              );
            })}
          </div>
        </Box>
      ) : (
        ""
      )}
    </Frame>
  );
}
