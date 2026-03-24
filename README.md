# Sistema de Reservas en Tiempo Real
## Descripción
Aplicación web desarrollada con Nuxt 4 que permite a múltiples usuarios seleccionar y confirmar fechas en tiempo real, evitando conflictos mediante bloqueo temporal y sincronización con WebSockets.

Permite:
- Selección de fechas con bloqueo temporal
- Confirmación de reservas
- Vista de administración para cancelar reservas
- Actualización en tiempo real entre clientes

## Tecnologías
Nuxt 4
Typescript
Node.js 24
MySQL 9
WebSockets (ws)
Podman
mise (opcional)

> ![Note]
> Para la instalación y uso correcto de este proyecto, es necesario un shell que te permita correr scripts de bash.

## Instalación

### Clonar repositorio
`git clone https://github.com/Laelaps9/Reservas.git`
`cd Reservas`

### Instalación manual
#### Instalar dependencias
`npm install`

#### Configurar base de datos
Si aún no se tiene una base de datos MySQL 9 corriendo, es posible crear un contenedor con el siguiente comando
```
podman run -d \
      --name reservas_db \
      -p 3306:3306 \
      -e MYSQL_ROOT_PASSWORD=root-secret \
      -e MYSQL_DATABASE=reservas \
      -e MYSQL_USER=user \
      -e MYSQL_PASSWORD=reservas-secret \
      -v reservas_volume:/var/lib/mysql:Z \
      mysql:9
```
No es necesario tener los mismos valores pero, en caso de cambiarlos, también se deben cambiar en el archivo `server/utils/db.ts`y `mise-tasks/db/crete_table` para funcionamiento correcto.
> ![NOTE]
> Los valores de contraseñas y usuario se mantuvieron simples para facilitar el uso del proyecto. En un proyecto real, no los pondría directamente en archivos o scripts, en vez usaría un .env para guardar las variables de entorno localmente.

Una vez corriendo el contenedor, pueden usar los scripts en mise-tasks para crear y poblar la tabla que se usará en el proyecto.

`./mise-tasks/db/create_table` Crea la tabla 'fechas'. También es posible correrlo directamente en terminal:
```
podman exec -i reservas_db mysql -uuser -preservas-secret reservas <<EOF
CREATE TABLE IF NOT EXISTS fechas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    estado ENUM('disponible', 'en_proceso', 'reservada') NOT NULL DEFAULT
    'disponible', ocupado_por VARCHAR(36) NULL );
EOF
```

`node mise-tasks/db/create_dates.ts` Crea 16 fechas y las inserta la tabla 'fechas'.


### Ejecutar el proyecto
`npm run dev`

## Uso
### Usuario (Reservas)
Ir a `http://localhost:3000/`

Esta página te permite seleccionar una fecha y confirmarla. Si un cliente selecciona una fecha, automáticamente se deshabilita para los otros clientes.

Cada cliente puede tener sólo una selección activa y la selección se libera automáticamente al cerrar la conexión (cerrar la página).

### Administración
Ir a `http://localhost:3000/admin`

Esta página muestra reservas activas y te da la opción de cancelarlas. La lista de fechas reservadas se actualiza automáticamente cada vez que se confirma o cancela una fecha.


## Usando mise
El proyecto fue hecho usando mise para manejo de versiones de Node.js y la creación de algunas tareas con el fin de hacer manejar el proyecto más sencillo.

`cd Reservas`

`mise trust` marca mise.toml como 'trusted', permitiendo el uso de mise en el proyecto.

`mise install` instala node@24 para uso en el proyecto.

`mise run setup` instala dependencias de npm, crea un contenedor con MySQL 9, crea una tabla en la base de datos y agrega fechas a la tabla.

`mise run dev` corre el proyecto igual que `npm run dev`

Otras tareas disponibles se pueden listar con `mise tasks`.
