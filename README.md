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
   VITE_SHEET_ID_BIOMOL_ASISTENCIA="1c88VjGIy4oudX8cFx_fXnKwyOqpsD9eQIEufyfvhRMk"
   VITE_SHEET_ID_BIOMOL_NOTAS="1zjHKtxRk6jA81a1t4Jd01I0Yo9Dl64le4mJO4snAmCI"

   # --- TECNO II ---
   VITE_SHEET_ID_TECNOII_ASISTENCIA="16lzzMVQtUhC9O2OdgJlJ2tnUJdYYbuOrHnX5SwDNfkw"
   VITE_SHEET_ID_TECNOII_NOTAS="1RLVS6zk6rZatHBWkhKPnWKgWvT5J0Xh5--II_E1r47c"

   # --- TECNO III ---
   VITE_SHEET_ID_TECNOIII_ASISTENCIA="1WSoB6xofiOm85m_PpOqpde45MccV8eHRgNjwbDBAA18"
   VITE_SHEET_ID_TECNOIII_NOTAS="1MRHghDMw7_C6VgY1JYZeUKERvhLFFRXjTw5CETHYEOM"
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
