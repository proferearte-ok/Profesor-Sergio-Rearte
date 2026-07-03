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
