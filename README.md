# Instrucciones

```terminal
# Ejecutar backend

cd jwt-backend
npm install
npm start

# Ejecutar frontend

cd front
npm install
npm run dev

# Abrir el front en http://127.0.0.1

```

# Funcionamiento

## Front
Se creo en base a Vite React con Typescript. A continuación se explica cada carpeta

### Carpetas

#### Public
Contiene los archivos estaticos públicos como imágenes, iconos, etc.

#### src
Contiene los archivos base del proyecto

##### Components
Contiene componentes reutilizables, cada componente tiene un archivo tsx y un module.css. 

#### Helpers
Contiene funciones que facilitan la conexión y consultas a la API del backend

#### Hooks
Contiene custom hooks (funciones que utilizan funcionalidades de react). Por ejemplo, un hook que revisa si el usuario esta autenticado o no.

#### Pages
Contiene las "paginas". Ahí se arman las vistas que luego se declaran en App.tsx

#### types
Contiene tipos e interfaces para declarar en componentes, datos, llamadas a la API, formularios, etc.

### Archivos

#### App.tsx
Es la base de la aplicación, contiene el router y posiblemente stores o context. 

#### main.tsx (no tocar)
Es el que conecta la aplicación con el index.html


## Back
Se utiliza Node con Express y typescript. De ORM se utiliza Sequelize, actualmente con base de datos local SQLite.

### config
Inicializa la base de datos

### controllers
Contiene la lógica para cada ruta.

### db
Contiene la base de datos sqlite y también el setup que crea y asigna automaticamente los roles a la base de datos

### helpers
Contiene funciones de apoyo, por ejemplo passwordHelper que ayuda a encriptar, verificar o validar contraseñas.

### models
Aquí se crean los modelos de para la base de datos y sus relaciones en el archivo index

### public
Aquí se ubican los archivos estaticos que se serviran por el servidor, aquí va el build dela app de react.

### routes
Define las rutas y los tipos de petición

### app.ts
Es el archivo principal que contiene toda la configuración base.


# HU-05: Generador Visual de Cotizaciones Dinámicas

Permite crear cotizaciones desde el frontend sin escribir HTML, vinculadas a un curso del catálogo SENCE y a un temario comercial. El total se calcula automáticamente como `cantidad de participantes × valor por alumno − descuento`.

## Flujo

1. Ir a **Cotizaciones → Nueva cotización**.
2. Seleccionar empresa cliente, contacto y curso SENCE base.
3. Elegir un temario comercial existente o personalizarlo en texto plano.
4. Definir cantidad de participantes, valor por alumno, descuento y vigencia.
5. Guardar: se genera un **enlace web público de solo lectura** y un **PDF estándar** descargable.
6. Desde el detalle de un negocio también se puede usar **Generar cotización** para precargar empresa y curso.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/cotizaciones` | Lista cotizaciones (requiere sesión) |
| GET | `/api/cotizaciones/:id` | Detalle de una cotización |
| POST | `/api/cotizaciones` | Crea una cotización y calcula el total |
| PATCH | `/api/cotizaciones/:id` | Actualiza y recalcula la cotización |
| DELETE | `/api/cotizaciones/:id` | Eliminación lógica |
| GET | `/api/cotizaciones/:id/pdf` | PDF privado de la cotización |
| GET | `/api/cotizaciones/public/:token` | Cotización pública de solo lectura |
| GET | `/api/cotizaciones/public/:token/pdf` | PDF público de la cotización |

## Variables de entorno opcionales

En `jwt-backend/.env`:

```env
# URL del frontend usada en el enlace público impreso en el PDF.
FRONTEND_URL="http://127.0.0.1:5173"
# Nombre que aparece en el encabezado del PDF.
NOMBRE_EMPRESA="KeepLearning"
```

Si no se define `FRONTEND_URL`, se usa `ORIGIN` o `http://localhost:5173`.

## Rutas del frontend

- `/cotizaciones` — listado y acciones.
- `/cotizaciones/crear` — nueva cotización.
- `/cotizaciones/editar/:id` — edición y enlace público.
- `/cotizaciones/publica/:token` — vista pública de solo lectura (sin sesión).





# HU-06: Revalidación y Extensión de Cotizaciones Vencidas

Permite identificar cotizaciones con vigencia caducada y reabrir/extender su vigencia conservando el número original (`COT-XXXXX`) y la trazabilidad del negocio asociado. Al revalidar se regenera el PDF y el enlace público, y se mantiene un historial de revalidaciones.

## Identificación de vencidas

Una cotización se considera vencida cuando `fechaEmision + validezDias` es anterior a la fecha actual. Las respuestas de la API incluyen los campos calculados `fechaVencimiento` y `vencida` (boolean).

## Flujo

1. Ir a **Cotizaciones**.
2. Filtrar por **Vencidas** (o usar el filtro de vigencia).
3. Pulsar **Revalidar** en la cotización vencida.
4. Se extiende la vigencia (por defecto se mantiene `validezDias`, configurable) y se regenera el enlace público.
5. El número original y el negocio asociado se conservan; se registra la revalidación en el historial.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/cotizaciones/vencidas` | Lista cotizaciones vencidas |
| GET | `/api/cotizaciones?vencida=true` | Filtra cotizaciones vencidas |
| POST/PATCH | `/api/cotizaciones/:id/revalidar` | Revalida y extiende vigencia |
| POST/PATCH | `/api/cotizaciones/:id/reactivar` | Alias de revalidación |
| POST/PATCH | `/api/cotizaciones/:id/extender` | Alias de revalidación |
| POST/PATCH | `/api/cotizaciones/:id/revalidacion` | Alias de revalidación |

### Body opcional de revalidación

```json
{
  "validezDias": 15,
  "diasExtension": 0,
  "fechaEmision": "2026-11-22T00:00:00.000Z",
  "estado": "Enviada",
  "regenerarEnlace": true
}
```

## Rutas del frontend

- `/cotizaciones` — listado con filtro de vigencia, badge Vencida/Vigente y botón Revalidar/Extender.
- `/cotizaciones/editar/:id` — botón "Revalidar / Extender vigencia".

# HU-07: Respaldo de Orden de Compra y Nómina SENCE

Permite al Encargado de Operaciones adjuntar la Orden de Compra (OC) y la planilla de nómina de participantes al negocio/curso ganado, contando con respaldo formal antes de iniciar la capacitación. Incluye validación que advierte si se intenta coordinar o ejecutar el curso sin la OC adjunta.

## Flujo
1. Ir a **Negocios** y abrir la ficha de un negocio.
2. En la sección "Respaldos (Orden de Compra y Nómina SENCE)" adjuntar la OC (PDF) y/o la nómina (Excel/PDF).
3. Pulsar **Coordinar curso** o **Ejecutar curso**: el sistema valida la presencia de la OC adjunta y advierte si falta.

## Endpoints
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/adjuntos?negocioID=` | Lista adjuntos de un negocio |
| POST | `/api/adjuntos` | Sube un adjunto (multipart, campo `archivo`/`file`) |
| GET | `/api/adjuntos/:id` | Detalle de un adjunto |
| GET | `/api/adjuntos/:id/descargar` | Descarga el archivo |
| DELETE | `/api/adjuntos/:id` | Eliminación lógica |
| GET | `/api/adjuntos/validar-oc/:negocioID` | Indica si hay OC adjunta |
| PATCH/POST | `/api/negocios/:id/coordinar` | Coordina el curso (requiere OC) |
| PATCH/POST | `/api/negocios/:id/ejecutar` | Ejecuta el curso (requiere OC) |

Alias disponibles: `/api/respaldos`, `/api/attachments`, `/api/operaciones/adjuntos` para adjuntos.

## Rutas del frontend
- `/negocios` — ficha de negocio con sección de respaldos y botones Coordinar/Ejecutar.

# HU-08: Asignación y Formalización del Relator

Permite al Encargado de Operaciones / RRHH asignar un relator a un negocio/curso, definir la modalidad (presencial/online/distancia), pactar honorarios y subir el contrato de servicios firmado, dejando el respaldo listo para validación contable. Los honorarios y contratos solo son visibles para perfiles autorizados (Operaciones, RRHH, Admin).

## Flujo
1. Ir a **Relatores** para registrar relatores disponibles.
2. Ir a **Negocios** y abrir la ficha de un negocio.
3. En la sección "Asignación y Formalización del Relator" seleccionar el relator, modalidad y honorarios.
4. Adjuntar el contrato (PDF) firmado.
5. Los perfiles no autorizados no ven los contratos ni los honorarios.

## Endpoints

### Relatores
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/relatores` | Lista relatores |
| GET | `/api/relatores/:id` | Detalle de un relator |
| POST | `/api/relatores` | Crea un relator (autorizado) |
| PATCH | `/api/relatores/:id` | Actualiza un relator (autorizado) |
| DELETE | `/api/relatores/:id` | Eliminación lógica (autorizado) |

Alias disponibles: `/api/relators`.

### Contratos de relator (adjuntos tipo `Contrato`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/adjuntos?negocioID=&tipo=Contrato` | Lista contratos de un negocio (solo autorizados) |
| POST | `/api/adjuntos` | Sube un contrato (multipart, campo `archivo`/`file`, `tipo=Contrato`, `relatorID`, `modalidad`, `honorarios`) |
| GET | `/api/adjuntos/:id` | Detalle (solo autorizados para contratos) |
| GET | `/api/adjuntos/:id/descargar` | Descarga el contrato (solo autorizados) |
| DELETE | `/api/adjuntos/:id` | Eliminación lógica |

## Rutas del frontend
- `/relatores` — gestión de relatores.
- `/negocios` — ficha de negocio con sección de asignación y formalización del relator.

# HU-09: Registro de Condiciones y Plazos de Cobro B2B

Permite al Encargado de Finanzas registrar el plazo de pago acordado (Contado, 30, 45 o 60 días) a partir de la recepción de la Orden de Compra (OC), para proyectar las fechas estimadas de cobro y dar seguimiento a las cuentas por cobrar.

## Flujo

1. Ir a **Negocios** y abrir la ficha de un negocio.
2. En la sección "7. Condiciones y Plazos de Cobro B2B" seleccionar el plazo de pago (Contado, 30, 45 o 60 días).
3. Indicar la fecha de recepción de la OC (por defecto la fecha de carga de la OC adjunta).
4. El sistema calcula la fecha estimada de cobro (recepción OC + plazo).
5. Guardar la condición de cobro. El estado de cobro puede marcarse como Pendiente, Cobrado o Vencido.
6. Ir a **Cobros** para visualizar las cuentas por cobrar, filtrar por estado y detectar vencidas.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/negocios/:id/cobro` | Obtiene la condición de cobro de un negocio |
| PATCH/POST | `/api/negocios/:id/cobro` | Registra/actualiza la condición de cobro |
| DELETE | `/api/negocios/:id/cobro` | Elimina la condición de cobro |
| GET | `/api/cobros` | Lista cuentas por cobrar |
| GET | `/api/cobros?soloConCobro=true` | Lista solo negocios con condición registrada |
| GET | `/api/cobros?estadoCobro=Pendiente` | Filtra por estado de cobro |
| GET | `/api/cobros?vencida=true` | Lista cuentas por cobrar vencidas |
| POST/PATCH | `/api/cobros` | Registra/actualiza condición de cobro (upsert por `negocioID`) |
| DELETE | `/api/cobros/:negocioID` | Elimina la condición de cobro |

Alias disponibles: `/api/cuentas-por-cobrar`, `/api/condiciones-cobro`, `/api/plazos-cobro`, `/api/cobro` y rutas equivalentes con `/condicion-cobro`, `/plazo-cobro`, `/condiciones-cobro` sobre `/api/negocios/:id`.

## Rutas del frontend

- `/negocios` — ficha de negocio con sección de condiciones y plazos de cobro.
- `/cobros` (alias `/cuentas-por-cobrar`) — listado de cuentas por cobrar con filtros.
