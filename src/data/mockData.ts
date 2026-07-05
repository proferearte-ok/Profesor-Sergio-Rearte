/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Catedra, SeccionEstado, Archivo, Asistencia, NotaNum, NotaStatus } from "../types";

export const mockCatedras: Catedra[] = [
  {
    id: "BIO_MOL",
    nombre: "Biología Molecular",
    cuatrimestre: "1er Cuatrimestre",
    activa: true,
    anio_vigente: 2026,
    tipo_cronograma: "LISTA_FECHAS",
    contenido_cronograma: "Cronograma basado en fechas clave y entregas de laboratorios."
  },
  {
    id: "TECNO_2",
    nombre: "Tecno II",
    cuatrimestre: "2do Cuatrimestre",
    activa: false,
    anio_vigente: 2026,
    tipo_cronograma: "TEXTO_SIMPLE",
    contenido_cronograma: "Cronograma flexible de clases teóricas y talleres de desarrollo."
  },
  {
    id: "TECNO_3",
    nombre: "Tecno III",
    cuatrimestre: "1er Cuatrimestre",
    activa: true,
    anio_vigente: 2026,
    tipo_cronograma: "CALENDAR_EMBEBIDO",
    contenido_cronograma: "https://calendar.google.com/calendar/embed?src=catedra_tecno3..."
  }
];

export const mockSecciones: SeccionEstado[] = [
  // Biologia Molecular
  { id_catedra: "BIO_MOL", seccion: "Programa", estado: "Activa", texto_simple: "Introducción a la genética molecular, replicación del ADN, transcripción y síntesis proteica." },
  { id_catedra: "BIO_MOL", seccion: "Condiciones de Cursada", estado: "Activa", texto_simple: "Se requiere un 80% de asistencia a prácticos. Dos parciales teóricos-prácticos con opción a recuperar uno." },
  { id_catedra: "BIO_MOL", seccion: "Bibliografia", estado: "Activa", texto_simple: "" },
  { id_catedra: "BIO_MOL", seccion: "Cronograma", estado: "Activa", texto_simple: "" },
  { id_catedra: "BIO_MOL", seccion: "Diapositivas", estado: "Activa", texto_simple: "" },
  { id_catedra: "BIO_MOL", seccion: "Apuntes de Clase", estado: "Activa", texto_simple: "" },
  { id_catedra: "BIO_MOL", seccion: "Asistencia", estado: "Activa", texto_simple: "" },
  { id_catedra: "BIO_MOL", seccion: "Notas", estado: "Activa", texto_simple: "" },
  // Tecno III
  { id_catedra: "TECNO_3", seccion: "Programa", estado: "Activa", texto_simple: "Diseño interactivo avanzado, frameworks modernos, integraciones de hardware y software en tiempo real." },
  { id_catedra: "TECNO_3", seccion: "Condiciones de Cursada", estado: "Activa", texto_simple: "Cursada basada en proyecto práctico troncal. Evaluación de hitos y defensa oral final." },
  { id_catedra: "TECNO_3", seccion: "Bibliografia", estado: "Activa", texto_simple: "" },
  { id_catedra: "TECNO_3", seccion: "Cronograma", estado: "Activa", texto_simple: "" },
  { id_catedra: "TECNO_3", seccion: "Diapositivas", estado: "Activa", texto_simple: "" },
  { id_catedra: "TECNO_3", seccion: "Apuntes de Clase", estado: "Inactiva", texto_simple: "Esta sección no cuenta con contenido este año." },
  { id_catedra: "TECNO_3", seccion: "Asistencia", estado: "Activa", texto_simple: "" },
  { id_catedra: "TECNO_3", seccion: "Notas", estado: "Activa", texto_simple: "" },
];

export const mockArchivos: Archivo[] = [
  { id_catedra: "BIO_MOL", tipo_seccion: "Bibliografia", nombre_archivo: "Biología Celular y Molecular (Lodish 8va Ed)", link_drive: "https://drive.google.com/file/d/1A8zB...", orden: 1, fecha_subida: "01/03/2026" },
  { id_catedra: "BIO_MOL", tipo_seccion: "Diapositivas", nombre_archivo: "Clase 01 - Estructura de Ácidos Nucleicos", link_drive: "https://drive.google.com/file/d/1B9zC...", orden: 1, fecha_subida: "10/03/2026" },
  { id_catedra: "BIO_MOL", tipo_seccion: "Diapositivas", nombre_archivo: "Clase 02 - Replicación del ADN", link_drive: "https://drive.google.com/file/d/1C0zD...", orden: 2, fecha_subida: "17/03/2026" },
  { id_catedra: "BIO_MOL", tipo_seccion: "Apuntes_Clase", nombre_archivo: "Guía de Trabajos Prácticos de Laboratorio", link_drive: "https://drive.google.com/file/d/1D1zE...", orden: 1, fecha_subida: "05/03/2026" },
  
  { id_catedra: "TECNO_3", tipo_seccion: "Bibliografia", nombre_archivo: "Designing with Web Standards (Jeffrey Zeldman)", link_drive: "https://drive.google.com/file/d/2X8yB...", orden: 1, fecha_subida: "15/03/2026" },
  { id_catedra: "TECNO_3", tipo_seccion: "Diapositivas", nombre_archivo: "Presentación - Arquitectura de Componentes", link_drive: "https://drive.google.com/file/d/2Y9zC...", orden: 1, fecha_subida: "20/03/2026" },
];

export const mockAsistencia: Asistencia[] = [
  { id_catedra: "BIO_MOL", anio: 2026, estudiante: "Pérez, Juan", porcentaje: "92%", presentes: 9 },
  { id_catedra: "BIO_MOL", anio: 2026, estudiante: "Rodríguez, María", porcentaje: "68%", presentes: 7 },
  { id_catedra: "BIO_MOL", anio: 2026, estudiante: "García, Sofia", porcentaje: "85%", presentes: 8 },
  { id_catedra: "BIO_MOL", anio: 2025, estudiante: "Alvarez, Pedro (Histórico)", porcentaje: "90%", presentes: 9 },
  
  { id_catedra: "TECNO_3", anio: 2026, estudiante: "Gómez, Lucas", porcentaje: "80%", presentes: 8 },
  { id_catedra: "TECNO_3", anio: 2026, estudiante: "Martínez, Ana", porcentaje: "95%", presentes: 9 },
  { id_catedra: "TECNO_3", anio: 2026, estudiante: "Sánchez, Diego", porcentaje: "75%", presentes: 7 },
];

export const mockNotasNum: NotaNum[] = [
  { 
    id_catedra: "BIO_MOL", 
    anio: 2026, 
    estudiante: "Pérez, Juan", 
    p1_teoria: "85%", p1_practica: "80%", p1_resultado: "Aprobado", 
    p2_teoria: "90%", p2_practica: "85%", p2_resultado: "Aprobado", 
    recupera: "-", rec_teoria: "-", rec_practica: "-", rec_resultado: "-", 
    condicion_final: "Promoción" 
  },
  { 
    id_catedra: "BIO_MOL", 
    anio: 2026, 
    estudiante: "Rodríguez, María", 
    p1_teoria: "45%", p1_practica: "50%", p1_resultado: "Desaprobado", 
    p2_teoria: "75%", p2_practica: "80%", p2_resultado: "Aprobado", 
    recupera: "1P", rec_teoria: "80%", rec_practica: "75%", rec_resultado: "Aprobado", 
    condicion_final: "Regular" 
  },
  { 
    id_catedra: "BIO_MOL", 
    anio: 2025, 
    estudiante: "Alvarez, Pedro (Histórico)", 
    p1_teoria: "70%", p1_practica: "70%", p1_resultado: "Aprobado", 
    p2_teoria: "75%", p2_practica: "70%", p2_resultado: "Aprobado", 
    recupera: "-", rec_teoria: "-", rec_practica: "-", rec_resultado: "-", 
    condicion_final: "Regular" 
  }
];

export const mockNotasStatus: NotaStatus[] = [
  {
    id_catedra: "TECNO_3",
    anio: 2026,
    estudiante: "Gómez, Lucas",
    p1_teoria: "80%", p1_condicion: "Aprobado",
    p2_teoria: "90%", p2_condicion: "Aprobado",
    rec_teoria: "-", rec_condicion: "-",
    practica: "Aprobado",
    condicion_final: "Promoción"
  },
  {
    id_catedra: "TECNO_3",
    anio: 2026,
    estudiante: "Martínez, Ana",
    p1_teoria: "40%", p1_condicion: "Desaprobado",
    p2_teoria: "85%", p2_condicion: "Aprobado",
    rec_teoria: "75%", rec_condicion: "Aprobado",
    practica: "Aprobado",
    condicion_final: "Regular"
  },
  {
    id_catedra: "TECNO_3",
    anio: 2026,
    estudiante: "Sánchez, Diego",
    p1_teoria: "35%", p1_condicion: "Desaprobado",
    p2_teoria: "40%", p2_condicion: "Desaprobado",
    rec_teoria: "45%", rec_condicion: "Desaprobado",
    practica: "Pendiente",
    condicion_final: "Libre"
  }
];

export const markdownText = `# DISEÑO DE ARQUITECTURA DE DATOS PARA CÁTEDRAS UNIVERSITARIAS
Este documento detalla la estructura de datos en Google Sheets optimizada para alimentar el sitio web interactivo del docente universitario en Google AI Studio.

---

## 1. RECOMENDACIÓN DE ARQUITECTURA: GOOGLE SHEETS VS. JSON ESTÁTICO
Para un docente que **no posee conocimientos de programación** y requiere actualizar notas, asistencias, apuntes y bibliografía periódicamente de manera manual, la recomendación técnica es determinante: **GOOGLE SHEETS**.

### ¿Por qué Google Sheets es el claro ganador frente a un JSON estático?
1. **Fácil Actualización Directa**: El docente modifica los datos como siempre lo hizo, desde una interfaz familiar de planilla de cálculo (tanto en su computadora como desde el celular).
2. **Sin Manipulación de Código**: Con un JSON estático, cualquier cambio (un alumno nuevo, una nota modificada, una diapositiva subida) requiere modificar un archivo de texto estructurado y volver a desplegar la app. Sheets elimina por completo esta fricción.
3. **Mantenimiento Colaborativo**: El docente puede otorgar permisos de edición parciales a ayudantes de cátedra únicamente para cargar asistencias o notas, sin darles acceso a la administración ni al código de la app.
4. **Flujo de Integración Óptimo**:
   - El docente edita su planilla habitual en Google Sheets.
   - La app de React (alojada en AI Studio/Cloud Run) realiza una llamada \`fetch\` al endpoint público de la hoja en formato CSV (\`https://docs.google.com/spreadsheets/d/ID_PLANILLA/export?format=csv&gid=ID_HOJA\`) o mediante una API Route en Express para parsear y servir los datos de forma estructurada e instantánea al cliente.

---

## 2. ESTRATEGIA DE VERSIONADO POR AÑO (COHORTES)
Para evitar que el docente tenga que crear una planilla nueva de Google Sheets cada año lectivo (lo cual rompería los enlaces de la API de la aplicación), se implementa una **estrategia de versionado histórico por columna en una sola planilla unificada**:

1. **Columna "Año"**: Las hojas de transacciones (\`Asistencia\` y \`Notas\`) contienen una columna obligatoria llamada \`Año\` (ej. \`2026\`).
2. **Filtro del Año de Vigencia**: La hoja de control \`Cátedras\` define qué año está vigente actualmente para cada materia (ej. \`Anio_Vigente = 2026\`).
3. **Comportamiento en la Web**: Al abrir el sitio, la app de React lee la cátedra, identifica su \`Anio_Vigente\` y por defecto filtra las notas y asistencias para mostrar solo los estudiantes correspondientes a ese cohorte activo.
4. **Acceso a Históricos**: La app puede desplegar un simple desplegable de selección de año en la UI, permitiendo a ex-alumnos o al docente consultar los registros de \`2025\`, \`2024\`, etc., sin necesidad de cambiar de archivo.
5. **Comodidad para el Docente**: El docente simplemente agrega filas hacia abajo en el mismo archivo año tras año, escribiendo el año lectivo actual.

---

## 3. ESQUEMA DE DATOS DETALLADO (6 TABLAS / HOJAS DE TRABAJO)

A continuación se detalla la estructura exacta de las 6 hojas de trabajo que conformarán el archivo de Google Sheets.

### HOJA 1: Catedras
*Guarda la configuración general de las tres cátedras y define su estado temporal.*

| Columna | Tipo de Datos | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **ID_Catedra** (PK) | Texto (ID) | Identificador corto único para relacionar tablas | \`BIO_MOL\` |
| **Nombre** | Texto | Nombre de la asignatura | \`Biología Molecular\` |
| **Cuatrimestre** | Texto | Cuatrimestre de dictado | \`1er Cuatrimestre\` |
| **Activa** | Texto (SI/NO) | Define si la cátedra está vigente y visible en la home | \`SI\` |
| **Anio_Vigente** | Numérico | Año de la cohorte activa a mostrar por defecto | \`2026\` |
| **Tipo_Cronograma** | Texto | Selector de renderizado: \`TEXTO_SIMPLE\`, \`CALENDAR_EMBEBIDO\`, o \`LISTA_FECHAS\` | \`LISTA_FECHAS\` |
| **Contenido_Cronograma** | Texto | Texto descriptivo, link de iframe de Google Calendar, o vacío si usa lista | \`Cronograma basado en entregas...\` |

### HOJA 2: Secciones_Estado
*Permite activar/desactivar dinámicamente las 8 secciones de cada cátedra o cargar texto enriquecido.*

| Columna | Tipo de Datos | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **ID_Catedra** (FK) | Texto | Enlace con HOJA 1 | \`BIO_MOL\` |
| **Seccion** | Texto | Cualquiera de las 8 secciones del sitio | \`Programa\` |
| **Estado** | Texto (Activa/Inactiva) | Si está activa, se muestra. Si está inactiva, la UI muestra "Sección en preparación" | \`Activa\` |
| **Texto_Simple** | Texto (Largo) | Contenido de texto para secciones estáticas como "Programa" o "Condiciones" | \`Introducción a la genética...\` |

### HOJA 3: Archivos
*Aloja los links de descarga o previsualización de Google Drive para Bibliografía, Diapositivas y Apuntes.*

| Columna | Tipo de Datos | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **ID_Catedra** (FK) | Texto | Enlace con HOJA 1 | \`BIO_MOL\` |
| **Tipo_Seccion** | Texto | Define en qué sección va: \`Bibliografia\`, \`Diapositivas\`, \`Apuntes_Clase\` | \`Diapositivas\` |
| **Nombre_Archivo** | Texto | Título descriptivo que verá el estudiante | \`Clase 01 - Estructura de ADN\` |
| **Link_Drive** | Texto (URL) | Enlace público para compartir de Google Drive | \`https://drive.google.com/file/d/...\` |
| **Orden** | Numérico | Para ordenar la lista de archivos secuencialmente | \`1\` |
| **Fecha_Subida** | Fecha | Registro informativo de la fecha de publicación | \`10/03/2026\` |

### HOJA 4: Asistencia
*Registra la asistencia acumulada en porcentaje por estudiante y año de cohorte.*

| Columna | Tipo de Datos | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **ID_Catedra** (FK) | Texto | Enlace con HOJA 1 | \`BIO_MOL\` |
| **Anio** | Numérico | Año lectivo para el histórico | \`2026\` |
| **Estudiante** | Texto | Apellido y Nombre del alumno | \`Pérez, Juan\` |
| **Porcentaje_Asistencia** | Porcentaje | Valor acumulado que se renderizará en el sitio | \`92%\` |

### HOJA 5: Notas_Esquema_Num (Para Biología Molecular y Tecno II)
*Esquema para las cátedras que evalúan con notas numéricas ponderadas por parcial.*

| Columna | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **ID_Catedra** (FK) | Texto | Enlace con HOJA 1 | \`BIO_MOL\` |
| **Anio** | Numérico | Año lectivo | \`2026\` |
| **Estudiante** | Texto | Apellido y Nombre | \`Pérez, Juan\` |
| **P1_Teoria_Pct** | Porcentaje | Porcentaje obtenido en Teoría del 1er Parcial | \`85%\` |
| **P1_Practica_Pct** | Porcentaje | Porcentaje obtenido en Práctica del 1er Parcial | \`80%\` |
| **P1_Resultado** | Texto | Resultado general: \`Aprobado\` / \`Desaprobado\` / \`Ausente\` | \`Aprobado\` |
| **P2_Teoria_Pct** | Porcentaje | Porcentaje en Teoría del 2do Parcial | \`90%\` |
| **P2_Practica_Pct** | Porcentaje | Porcentaje en Práctica del 2do Parcial | \`85%\` |
| **P2_Resultado** | Texto | Resultado general del 2do parcial | \`Aprobado\` |
| **Recupera** | Texto | Identifica qué parcial recupera si aplica: \`1P\`, \`2P\`, \`-\` | \`-\` |
| **Rec_Teoria_Pct** | Porcentaje | Nota de recuperación (Teoría) | \`-\` |
| **Rec_Practica_Pct** | Porcentaje | Nota de recuperación (Práctica) | \`-\` |
| **Rec_Resultado** | Texto | Resultado del recuperatorio | \`-\` |
| **Condicion_Final** | Texto | Estado del alumno: \`Promoción\`, \`Regular\`, \`Libre\` | \`Promoción\` |

### HOJA 6: Notas_Esquema_Status (Para Tecno III)
*Esquema simplificado y basado en condiciones aptas/no-aptas para Tecno III.*

| Columna | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| **ID_Catedra** (FK) | Texto | Enlace con HOJA 1 | \`TECNO_3\` |
| **Anio** | Numérico | Año lectivo | \`2026\` |
| **Estudiante** | Texto | Apellido y Nombre | \`Gómez, Lucas\` |
| **P1_Teoria_Pct** | Porcentaje | Porcentaje de teoría del 1er Parcial | \`80%\` |
| **P1_Condicion** | Texto | Estado del parcial: \`Aprobado\` / \`Desaprobado\` | \`Aprobado\` |
| **P2_Teoria_Pct** | Porcentaje | Porcentaje de teoría del 2do Parcial | \`90%\` |
| **P2_Condicion** | Texto | Estado del parcial | \`Aprobado\` |
| **Rec_Teoria_Pct** | Porcentaje | Porcentaje en recuperatorio de teoría | \`-\` |
| **Rec_Condicion** | Texto | Estado de recuperatorio | \`-\` |
| **Practica** | Texto | Estado de las entregas de proyectos: \`Aprobado\` / \`Pendiente\` | \`Aprobado\` |
| **Condicion_Final** | Texto | Estado final: \`Promoción\`, \`Regular\`, \`Libre\` | \`Promoción\` |

---

## 4. CASO DE PRUEBA: EJEMPLO DE DATOS REALES (MUESTRA DE FILAS)

### Muestra de Datos de "Biología Molecular" (Caso de Prueba de Esquema Numérico)
A continuación, se ilustran filas exactas tal cual se registrarían en las planillas de Google Sheets para evaluar el caso:

#### Cátedras (Hojas 1)
| ID_Catedra | Nombre | Cuatrimestre | Activa | Anio_Vigente | Tipo_Cronograma | Contenido_Cronograma |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`BIO_MOL\` | Biología Molecular | 1er Cuatrimestre | SI | 2026 | LISTA_FECHAS | Cronograma basado en entregas... |

#### Secciones_Estado (Hoja 2)
| ID_Catedra | Seccion | Estado | Texto_Simple |
| :--- | :--- | :--- | :--- |
| \`BIO_MOL\` | Programa | Activa | Introducción a la genética molecular, replicación del ADN, transcripción y síntesis proteica. |
| \`BIO_MOL\` | Condiciones de Cursada | Activa | Se requiere un 80% de asistencia a prácticos. Dos parciales teóricos-prácticos con opción a recuperar uno. |

#### Archivos (Hoja 3)
| ID_Catedra | Tipo_Seccion | Nombre_Archivo | Link_Drive | Orden | Fecha_Subida |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`BIO_MOL\` | Bibliografia | Biología Celular y Molecular (Lodish 8va Ed) | \`https://drive.google.com/file/d/1A8zB...\` | 1 | 01/03/2026 |
| \`BIO_MOL\` | Diapositivas | Clase 01 - Estructura de Ácidos Nucleicos | \`https://drive.google.com/file/d/1B9zC...\` | 1 | 10/03/2026 |

#### Asistencia (Hoja 4)
| ID_Catedra | Anio | Estudiante | Porcentaje_Asistencia |
| :--- | :--- | :--- | :--- |
| \`BIO_MOL\` | 2026 | Pérez, Juan | 92% |
| \`BIO_MOL\` | 2026 | Rodríguez, María | 68% |
| \`BIO_MOL\` | 2025 | Alvarez, Pedro (Histórico) | 90% |

#### Notas_Esquema_Num (Hoja 5)
| ID_Catedra | Anio | Estudiante | P1_Teoria_Pct | P1_Practica_Pct | P1_Resultado | P2_Teoria_Pct | P2_Practica_Pct | P2_Resultado | Recupera | Rec_Teoria_Pct | Rec_Practica_Pct | Rec_Resultado | Condicion_Final |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`BIO_MOL\` | 2026 | Pérez, Juan | 85% | 80% | Aprobado | 90% | 85% | Aprobado | - | - | - | - | Promoción |
| \`BIO_MOL\` | 2026 | Rodríguez, María | 45% | 50% | Desaprobado | 75% | 80% | Aprobado | 1P | 80% | 75% | Aprobado | Regular |
`;
