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



