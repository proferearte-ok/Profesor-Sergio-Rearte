# Portal de Cátedras - Configuración de Google Sheets

Este proyecto está integrado con Google Sheets de forma dinámica para cargar la asistencia y calificaciones de las cátedras. Para proteger la privacidad de los datos de los estudiantes, todos los IDs de las planillas han sido desacoplados del código fuente y se cargan mediante variables de entorno en tiempo de ejecución.

## Configuración Local

Sigue estos sencillos pasos para configurar tus planillas localmente:

1. **Crear archivo de entorno local:**
   Copia el archivo de plantilla `.env.local.example` y nómbralo como `.env.local` en la raíz del proyecto:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Cargar los IDs de tus planillas:**
   Abre `.env.local` con tu editor de texto y reemplaza los marcadores `"TU_ID_AQUI_..."` con los IDs reales correspondientes a tus hojas de Google Sheets.

   Ejemplo de contenido para `.env.local`:
   ```env
   # --- BIOLOGÍA MOLECULAR ---
   VITE_SHEET_ID_BIOMOL_ASISTENCIA="1a2b3c4d5e6f7g8h9i0jK_biomol_asistencia_placeholder"
   VITE_SHEET_ID_BIOMOL_NOTAS="1a2b3c4d5e6f7g8h9i0jK_biomol_notas_placeholder"

   # --- TECNO II ---
   VITE_SHEET_ID_TECNOII_ASISTENCIA="1a2b3c4d5e6f7g8h9i0jK_tecno2_asistencia_placeholder"
   VITE_SHEET_ID_TECNOII_NOTAS="1a2b3c4d5e6f7g8h9i0jK_tecno2_notas_placeholder"

   # --- TECNO III ---
   VITE_SHEET_ID_TECNOIII_ASISTENCIA="1a2b3c4d5e6f7g8h9i0jK_tecno3_asistencia_placeholder"
   VITE_SHEET_ID_TECNOIII_NOTAS="1a2b3c4d5e6f7g8h9i0jK_tecno3_notas_placeholder"
   ```

3. **Compartir las planillas:**
   Asegúrate de que cada planilla de Google Sheets esté configurada para que **"Cualquier persona con el enlace"** pueda verla (permiso de lectura público), ya que la aplicación accede a ellas directamente desde el cliente web mediante solicitudes HTTPS estándar de lectura de datos.

4. **Ejecutar la aplicación:**
   Inicia tu servidor de desarrollo habitual:
   ```bash
   npm run dev
   ```

## Validaciones Incorporadas

- **Consola de Desarrollo:** Al iniciar la aplicación, si falta definir alguna de estas variables o si continúan con el valor por defecto de plantilla, verás una advertencia clara en la consola indicando cuáles faltan por configurar.
- **Modo Demo Automático:** Para prevenir pantallas en blanco o fallas catastróficas, las cátedras que no cuenten con un ID de planilla real configurado mostrarán automáticamente datos ficticios (datos de prueba/mock), permitiendo probar la interfaz de usuario de forma fluida.

## Configuración de Panel Docente Unificado (Parte A y B)

Además de las planillas de Notas y Asistencia por materia, ahora puedes externalizar los datos fijos de Cátedras, Secciones y Archivos en una planilla unificada llamada conceptualmente **Panel_Docente_Config**:

1. **ID de la Planilla de Configuración:**
   Configura la siguiente variable de entorno en tu archivo `.env.local`:
   ```env
   VITE_SHEET_ID_PANEL_CONFIG="TU_ID_DE_PLANILLA_CONFIG_AQUI"
   ```

2. **Estructura de la Planilla Unificada (3 Pestañas):**
   Crea un archivo de Google Sheets y configúralo como de libre lectura pública ("Cualquier persona con el enlace"). Añade las siguientes tres pestañas con sus columnas exactas:

   - **Pestaña `Catedras`:**
     - **Columnas:** `id_catedra` | `nombre` | `cuatrimestre` | `activa` (TRUE/FALSE) | `anio_vigente`
     - **Ejemplo:** `BIO_MOL` | `Biología Molecular` | `1er Cuatrimestre` | `TRUE` | `2026`

   - **Pestaña `Secciones`:**
     - **Columnas:** `id_catedra` | `seccion` | `estado` (Activa/Inactiva) | `texto_simple` | `tipo_cronograma` | `contenido_cronograma`
     - **Ejemplo:** `BIO_MOL` | `Programa` | `Activa` | `Introducción a la genética...` | |
     - **Nota:** En la fila donde `seccion` sea `Cronograma`, puedes definir `tipo_cronograma` (`LISTA_FECHAS`, `TEXTO_SIMPLE` o `CALENDAR_EMBEBIDO`) y el respectivo `contenido_cronograma`.

   - **Pestaña `Archivos`:**
     - **Columnas:** `id_catedra` | `tipo_seccion` (Programa/Condiciones_Cronograma/Bibliografia/Diapositivas/Apuntes_Clase) | `nombre_archivo` | `link_drive` | `orden` | `fecha_subida`
     - **Ejemplo:** `BIO_MOL` | `Diapositivas` | `Clase 01 - Estructura de ADN` | `https://drive.google.com/...` | `1` | `10/03/2026`

## Seguridad de la Vista Docente

Para proteger la vista de especificaciones y diagnóstico de cambios no autorizados:

1. **Configurar Contraseña Docente:**
   Agrega la variable `VITE_DOCENTE_PASSWORD` en tu archivo `.env.local`:
   ```env
   VITE_DOCENTE_PASSWORD="tu_clave_segura"
   ```
2. Si no se define esta variable de entorno, por motivos de seguridad la vista docente permanecerá inaccesible (mostrando un mensaje de aviso para contactar al administrador).


## Integración Dinámica con Google Drive

La aplicación soporta un **modo dinámico** para listar archivos automáticamente desde carpetas públicas de Google Drive en las secciones **Bibliografía**, **Diapositivas** y **Apuntes de Clase**. En lugar de tener que cargar individualmente cada archivo con su título y enlace en la pestaña `Archivos`, el sistema leerá los archivos de la carpeta en vivo.

### 1. Nueva Pestaña en la Planilla de Configuración

Para habilitar este modo, debes agregar una pestaña nueva en tu archivo de Google Sheets de configuración (**Panel_Docente_Config**):

- **Pestaña `CarpetasDrive`:**
  - **Columnas obligatorias:** `id_catedra` | `tipo_seccion` | `folder_id_drive`
  - **Valores posibles para `tipo_seccion`:** `Bibliografia`, `Diapositivas` o `Apuntes_Clase`.
  - **Ejemplo:**
    | id_catedra | tipo_seccion | folder_id_drive |
    | :--- | :--- | :--- |
    | `BIO_MOL` | `Bibliografia` | `1aBcDeFgHiJkLmNoPqRsTuVwXyZ12345` |
    | `BIO_MOL` | `Diapositivas` | `1XyZ987654321_abc_def_ghi_jkl_mn` |

*Nota: Si una sección+cátedra específica tiene una carpeta configurada en `CarpetasDrive`, el portal utilizará el listado dinámico. Si la celda de `folder_id_drive` está vacía o si la pestaña no se encuentra, el portal automáticamente hará un "fallback" y seguirá mostrando los archivos fijos cargados manualmente en la pestaña `Archivos`.*

---

### 2. Configuración de la API Key en Google Cloud Console

Para que el portal pueda conectarse con Google Drive, necesitas generar una API Key y cargarla en tus variables de entorno como:
```env
VITE_GOOGLE_DRIVE_API_KEY="TU_API_KEY_DE_GOOGLE_DRIVE_AQUI"
```

#### Paso a Paso para generar la API Key (para usuarios no técnicos):

1. **Accede a la Consola de Google Cloud:**
   Ve a [Google Cloud Console](https://console.cloud.google.com/) e inicia sesión con tu cuenta de Google.

2. **Crea o selecciona un Proyecto:**
   - En la barra superior, haz clic en el selector de proyectos.
   - Haz clic en **"Proyecto nuevo"**, asígnale un nombre (por ejemplo, `Portal-Catedras`) y presiona **"Crear"**. Asegúrate de que el proyecto esté seleccionado una vez creado.

3. **Habilita la API de Google Drive:**
   - Haz clic en el botón de menú lateral (tres líneas horizontales en la esquina superior izquierda).
   - Ve a **APIs y servicios** > **Biblioteca**.
   - En la barra de búsqueda superior, escribe **"Google Drive API"**.
   - Selecciona la opción **Google Drive API** de la lista y haz clic en el botón azul **"Habilitar"**.

4. **Genera la Credencial (API Key):**
   - Una vez habilitada la API, ve al menú lateral izquierdo y selecciona **APIs y servicios** > **Credenciales**.
   - En la barra superior, haz clic en **"+ CREAR CREDENCIALES"** y elige la opción **"Clave de API"**.
   - Se abrirá un cuadro emergente mostrando tu nueva Clave de API. **Copia esta clave**, ya que es la que debes colocar en la variable `VITE_GOOGLE_DRIVE_API_KEY`.

5. **Restringe la API Key (Altamente Recomendado por Seguridad):**
   - En la misma ventana de la clave creada, haz clic en **"Restringir clave"** (o ve a la lista de claves de API y haz clic en editar en la clave que acabas de crear).
   - **Restricciones de API:**
     - En la sección inferior llamada **Restricciones de API**, selecciona **"Restringir clave"**.
     - En el menú desplegable que aparece, busca y marca únicamente la casilla de **Google Drive API**. Presiona **"Aceptar"**. Esto evita que la API Key sea usada para otros servicios de Google.
   - **Restricciones de Aplicación (Protección contra uso externo):**
     - En la sección **Restricciones del cliente**, selecciona **"Sitios web (referenciadores HTTP)"**.
     - Haz clic en **"+ AGREGAR"** en la sección de sitios web permitidos e ingresa tu dominio de producción. Por ejemplo:
       - `https://rearte-catedras.onrender.com/*`
       - Puedes agregar también `http://localhost:3000/*` o el dominio de desarrollo local si necesitas probarlo en vivo.
   - Haz clic en **"Guardar"** en la parte inferior para aplicar todos los cambios de seguridad.

---

### 3. Requisito Fundamental para las Carpetas de Google Drive

Para que la aplicación pueda consultar los archivos de manera pública, cada carpeta que agregues en la pestaña `CarpetasDrive` de la planilla debe estar compartida públicamente:

1. Entra a tu Google Drive, haz clic derecho sobre la carpeta que deseas listar.
2. Selecciona **Compartir** > **Compartir**.
3. En la sección de **Acceso general**, cambia de *"Restringido"* a **"Cualquier persona con el enlace"** con el rol de **Lector**.
4. ¡Listo! Copia el ID de la carpeta desde el enlace de la carpeta (es la cadena larga de números y letras que aparece en la URL después de `/folders/`) y pégalo en la columna `folder_id_drive`.

---

## Integración de Cronogramas por Lista de Clases (LISTA_CLASES)

Para utilizar el tipo de cronograma `LISTA_CLASES`, debes configurar una planilla de Google Sheets dedicada:

1. **Configurar ID de la Planilla de Cronogramas:**
   Agrega la variable `VITE_SHEET_ID_CRONOGRAMAS` en tu archivo `.env.local`:
   ```env
   VITE_SHEET_ID_CRONOGRAMAS="TU_ID_DE_PLANILLA_CRONOGRAMAS_AQUI"
   ```

2. **Estructura de la Planilla de Cronogramas:**
   Crea un archivo de Google Sheets y configúralo como de libre lectura pública ("Cualquier persona con el enlace"). Debe contener una pestaña por cada cátedra (ej. `BIO_MOL`, `TECNO_2`, `TECNO_3`). Cada pestaña debe incluir las siguientes columnas:
   - **fecha**: Columna con formato de fecha de Google Sheets (ej. `15/03/2026`).
   - **horario**: Texto con el horario (ej. `8:30 a 12:00`).
   - **aula**: Texto indicando el aula (ej. `Aula 402` o `A designar`).
   - **tema**: Texto descriptivo del tema o contenido de la clase.
   - **tipo**: Texto para clasificar el tipo de clase. Vacío o `Normal` para clases regulares, `Feriado` para días sin clase, o `Extra` para clases extraordinarias.

