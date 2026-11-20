import { Link, useNavigate, useRoutes } from "react-router-dom";
import { Box } from "../../../Components/Box/Box";
import { Frame } from "../../../Components/Frame/Frame";
import { Title } from "../../../Components/Title/Title";
import css from "./CrearEmpresa.module.css";
import { InputText } from "../../../Components/InputText/InputText";
import type { Empresa } from "../../../types/general";
import { useState } from "react";
import { Btn } from "../../../Components/Btn/Btn";

export function CrearEmpresa() {
  const BASE_EMPRESA: Empresa = {
    contactos: [],
    razon: "",
    rut: "",
    direccion: "",
  };
  const [empresa, setEmpresa] = useState<Empresa>({ ...BASE_EMPRESA });
  const nav = useNavigate();

  const agregarContacto = () => {
    setEmpresa((prev) => ({
      ...prev,
      contactos: [...prev.contactos, { nombre: "", correo: "", telefono: "" }],
    }));
  };

  const actualizarContacto = (index: any, campo: any, valor: any) => {
    setEmpresa((prev) => ({
      ...prev,
      contactos: prev.contactos.map((contacto, i) =>
        i === index ? { ...contacto, [campo]: valor } : contacto,
      ),
    }));
  };

  const quitarContacto = (index: any) => {
    setEmpresa((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((_, i) => i !== index),
    }));
  };
  return (
    <Frame>
      <Box>
        <Title>
          <Link to="/empresas">Empresas</Link> {">"} Crear empresa
        </Title>
      </Box>
      <Box>
        <p>Complete el siguiente formulario</p>
        <form className={css.form} onSubmit={(e) => e.preventDefault()}>
          <InputText
            label="RUT"
            onChange={(text) => {
              setEmpresa((prev) => ({ ...prev, rut: text }));
            }}
            placeholder="Ingresa el RUT de la empresa"
            value={empresa.rut}
          />
          <InputText
            label="Razón social"
            onChange={(text) => {
              setEmpresa((prev) => ({ ...prev, razon: text }));
            }}
            placeholder="Ingresa la razón social de la empresa"
            value={empresa.razon}
          />
          <InputText
            label="Dirección"
            onChange={(text) => {
              setEmpresa((prev) => ({ ...prev, direccion: text }));
            }}
            placeholder="Ingresa la dirección de la empresa"
            value={empresa.direccion}
          />
          <Btn
            onClick={() => {
              agregarContacto();
            }}
          >
            Agregar Contacto
          </Btn>
        </form>
        <p>Contactos</p>
        <div className={css.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>-</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {empresa.contactos.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <Btn
                        onClick={() => {
                          quitarContacto(index);
                        }}
                      >
                        Quitar
                      </Btn>
                    </td>
                    <td>
                      {
                        <InputText
                          label="Nombre del contacto"
                          onChange={(text) => {
                            actualizarContacto(index, "nombre", text);
                          }}
                          placeholder="Nombre del contacto"
                          value={item.nombre}
                        />
                      }
                    </td>
                    <td>
                      {
                        <InputText
                          label="Teléfono del contacto"
                          type="number"
                          onChange={(text) => {
                            actualizarContacto(index, "telefono", text);
                          }}
                          placeholder="Teléfono del contacto"
                          value={item.telefono}
                        />
                      }
                    </td>
                    <td>
                      {
                        <InputText
                          label="Correo del contacto"
                          type="email"
                          onChange={(text) => {
                            actualizarContacto(index, "correo", text);
                          }}
                          placeholder="Correo del contacto"
                          value={item.correo}
                        />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={css.btns}>
          <Btn
            onClick={() => {
              if (
                !confirm(
                  "¿Seguro que cancelar, se perderan los cambios no guardados?",
                )
              )
                return;
              nav("/empresas");
            }}
            warning
          >
            Cancelar
          </Btn>
          <Btn onClick={() => {}}>Guardar empresa</Btn>
        </div>
      </Box>
    </Frame>
  );
}
