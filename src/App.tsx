/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Database, 
  FileSpreadsheet, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Calendar, 
  Paperclip, 
  Copy, 
  Check, 
  Layers, 
  Info, 
  ChevronRight, 
  Eye, 
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock
} from "lucide-react";

// --- TYPES ---
interface Catedra {
  id: string;
  nombre: string;
  cuatrimestre: string;
  activa: boolean;
  anio_vigente: number;
  tipo_cronograma: string;
  contenido_cronograma: string;
}

interface SeccionEstado {
  id_catedra: string;
  seccion: string;
  estado: "Activa" | "Inactiva";
  texto_simple: string;
}

interface Archivo {
  id_catedra: string;
  tipo_seccion: "Bibliografia" | "Diapositivas" | "Apuntes_Clase";
  nombre_archivo: string;
  link_drive: string;
  orden: number;
  fecha_subida: string;
}

interface Asistencia {
  id_catedra: string;
  anio: number;
  estudiante: string;
  porcentaje: string;
}

interface NotaNum {
  id_catedra: string;
  anio: number;
  estudiante: string;
  p1_teoria: string;
  p1_practica: string;
  p1_resultado: string;
  p2_teoria: string;
  p2_practica: string;
  p2_resultado: string;
  recupera: string;
  rec_teoria: string;
  rec_practica: string;
  rec_resultado: string;
  condicion_final: string;
}

interface NotaStatus {
  id_catedra: string;
  anio: number;
  estudiante: string;
  p1_teoria: string;
  p1_condicion: string;
  p2_teoria: string;
  p2_condicion: string;
  rec_teoria: string;
  rec_condicion: string;
  practica: string;
  condicion_final: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"visualizer" | "recommendation" | "versioning" | "markdown">("visualizer");
  const [selectedCatedra, setSelectedCatedra] = useState<string>("BIO_MOL");
  const [selectedSheet, setSelectedSheet] = useState<string>("catedras");
  const [copied, setCopied] = useState<boolean>(false);

  // --- MOCK DATA FOR THE PREVIEW ---
  const mockCatedras: Catedra[] = [
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

  const mockSecciones: SeccionEstado[] = [
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

  const mockArchivos: Archivo[] = [
    { id_catedra: "BIO_MOL", tipo_seccion: "Bibliografia", nombre_archivo: "Biología Celular y Molecular (Lodish 8va Ed)", link_drive: "https://drive.google.com/file/d/1A8zB...", orden: 1, fecha_subida: "01/03/2026" },
    { id_catedra: "BIO_MOL", tipo_seccion: "Diapositivas", nombre_archivo: "Clase 01 - Estructura de Ácidos Nucleicos", link_drive: "https://drive.google.com/file/d/1B9zC...", orden: 1, fecha_subida: "10/03/2026" },
    { id_catedra: "BIO_MOL", tipo_seccion: "Diapositivas", nombre_archivo: "Clase 02 - Replicación del ADN", link_drive: "https://drive.google.com/file/d/1C0zD...", orden: 2, fecha_subida: "17/03/2026" },
    { id_catedra: "BIO_MOL", tipo_seccion: "Apuntes_Clase", nombre_archivo: "Guía de Trabajos Prácticos de Laboratorio", link_drive: "https://drive.google.com/file/d/1D1zE...", orden: 1, fecha_subida: "05/03/2026" },
    
    { id_catedra: "TECNO_3", tipo_seccion: "Bibliografia", nombre_archivo: "Designing with Web Standards (Jeffrey Zeldman)", link_drive: "https://drive.google.com/file/d/2X8yB...", orden: 1, fecha_subida: "15/03/2026" },
    { id_catedra: "TECNO_3", tipo_seccion: "Diapositivas", nombre_archivo: "Presentación - Arquitectura de Componentes", link_drive: "https://drive.google.com/file/d/2Y9zC...", orden: 1, fecha_subida: "20/03/2026" },
  ];

  const mockAsistencia: Asistencia[] = [
    { id_catedra: "BIO_MOL", anio: 2026, estudiante: "Pérez, Juan", porcentaje: "92%" },
    { id_catedra: "BIO_MOL", anio: 2026, estudiante: "Rodríguez, María", porcentaje: "68%" },
    { id_catedra: "BIO_MOL", anio: 2026, estudiante: "García, Sofia", porcentaje: "85%" },
    { id_catedra: "BIO_MOL", anio: 2025, estudiante: "Alvarez, Pedro (Histórico)", porcentaje: "90%" },
    
    { id_catedra: "TECNO_3", anio: 2026, estudiante: "Gómez, Lucas", porcentaje: "80%" },
    { id_catedra: "TECNO_3", anio: 2026, estudiante: "Martínez, Ana", porcentaje: "95%" },
    { id_catedra: "TECNO_3", anio: 2026, estudiante: "Sánchez, Diego", porcentaje: "75%" },
  ];

  const mockNotasNum: NotaNum[] = [
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

  const mockNotasStatus: NotaStatus[] = [
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

  // --- MARKDOWN SPECIFICATION TEXT ---
  const markdownText = `# DISEÑO DE ARQUITECTURA DE DATOS PARA CÁTEDRAS UNIVERSITARIAS
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
5. **Comodidad para el Docente**: El docente simplemente añade filas hacia abajo en el mismo archivo año tras año, escribiendo el año lectivo actual.

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* HEADER SECTION */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-white rounded-lg shadow-sm">
              <Database className="w-6 h-6" id="logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-widest uppercase font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-sm font-semibold">
                  Data Architect Spec
                </span>
                <span className="text-xs text-stone-400 font-mono">v1.0.0</span>
              </div>
              <h1 className="text-xl font-semibold text-stone-900 tracking-tight" id="app-title">
                Arquitectura de Datos para Cátedras Universitarias
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-header"
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Especificación MD</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CORE INFO SUMMARY FOR THE TEACHER */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 py-10 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-mono mb-2">
                <Clock className="w-4 h-4" />
                <span>Ciclo Lectivo Activo: Cohorte 2026</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                Reemplazo de Google Sites con Google Sheets + React
              </h2>
              <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                Diseño de datos estructurado y sin sobreingeniería. Permite al docente actualizar programas, apuntes, asistencias y notas desde una planilla tradicional de cálculo, alimentando en tiempo real una web interactiva y responsiva de alta gama en Google AI Studio.
              </p>
            </div>
            <div className="bg-stone-800/80 backdrop-blur-xs p-5 rounded-xl border border-stone-700 w-full lg:w-96 text-xs font-mono space-y-2.5">
              <div className="text-amber-400 font-semibold border-b border-stone-700 pb-1.5 flex items-center justify-between">
                <span>ESTADO DEL RELEVAMIENTO</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Cátedras:</span>
                <span className="text-stone-200">3 Cuatrimestrales</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Secciones por Cátedra:</span>
                <span className="text-stone-200">8 Estándar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Planillas de Notas:</span>
                <span className="text-emerald-400 font-semibold">2 Esquemas (Num / Status)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Gestor de Históricos:</span>
                <span className="text-stone-200">Soportado por Año</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex border-b border-stone-200 mb-8 overflow-x-auto gap-2">
          <button
            id="tab-visualizer"
            onClick={() => setActiveTab("visualizer")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === "visualizer"
                ? "border-amber-600 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Visualizador de Hojas de Datos</span>
          </button>
          <button
            id="tab-recommendation"
            onClick={() => setActiveTab("recommendation")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === "recommendation"
                ? "border-amber-600 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Recomendación: Sheets vs JSON</span>
          </button>
          <button
            id="tab-versioning"
            onClick={() => setActiveTab("versioning")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === "versioning"
                ? "border-amber-600 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Gestión de Históricos (Años)</span>
          </button>
          <button
            id="tab-markdown"
            onClick={() => setActiveTab("markdown")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === "markdown"
                ? "border-amber-600 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Especificación Markdown Completa</span>
          </button>
        </div>

        {/* TAB CONTENT: VISUALIZER */}
        {activeTab === "visualizer" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-semibold text-stone-900 text-lg">Simulación de Planillas del Docente</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Explorá el modelo exacto de tablas que el docente editará en Sheets. Cambiá la cátedra seleccionada para ver cómo se estructuran las notas según el esquema de evaluación.
                </p>
              </div>

              {/* SUBJECT AND TAB SELECTOR */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-mono text-stone-400 font-semibold mr-1">Filtrar Cátedra:</span>
                <button
                  id="catedra-bio"
                  onClick={() => {
                    setSelectedCatedra("BIO_MOL");
                    // If sheet is custom notes, reset to matching or general
                    if (selectedSheet === "notas_status") setSelectedSheet("notas_num");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCatedra === "BIO_MOL"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Biología Molecular (Numérico)
                </button>
                <button
                  id="catedra-tecno3"
                  onClick={() => {
                    setSelectedCatedra("TECNO_3");
                    if (selectedSheet === "notas_num") setSelectedSheet("notas_status");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCatedra === "TECNO_3"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Tecno III (Status / Cualitativo)
                </button>
              </div>
            </div>

            {/* SPREADSHEET TABS SIMULATOR */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-600 font-mono text-xs">
                  <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
                  <span className="font-bold text-stone-700">catedra_db_plan docente.xlsx</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">Modo: Previsualización de Esquema</span>
              </div>

              {/* SHEET HEADERS SELECTOR */}
              <div className="flex bg-[#F1EFE9] border-b border-stone-200 overflow-x-auto text-xs font-mono text-stone-600">
                <button
                  id="sheet-catedras"
                  onClick={() => setSelectedSheet("catedras")}
                  className={`px-4 py-2 border-r border-stone-200 transition-all ${
                    selectedSheet === "catedras" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
                  }`}
                >
                  📁 1. Cátedras
                </button>
                <button
                  id="sheet-secciones"
                  onClick={() => setSelectedSheet("secciones")}
                  className={`px-4 py-2 border-r border-stone-200 transition-all ${
                    selectedSheet === "secciones" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
                  }`}
                >
                  ⚙️ 2. Secciones_Estado
                </button>
                <button
                  id="sheet-archivos"
                  onClick={() => setSelectedSheet("archivos")}
                  className={`px-4 py-2 border-r border-stone-200 transition-all ${
                    selectedSheet === "archivos" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
                  }`}
                >
                  📎 3. Archivos
                </button>
                <button
                  id="sheet-asistencia"
                  onClick={() => setSelectedSheet("asistencia")}
                  className={`px-4 py-2 border-r border-stone-200 transition-all ${
                    selectedSheet === "asistencia" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
                  }`}
                >
                  📊 4. Asistencia
                </button>
                <button
                  id="sheet-notas-num"
                  onClick={() => setSelectedSheet("notas_num")}
                  className={`px-4 py-2 border-r border-stone-200 transition-all ${
                    selectedSheet === "notas_num" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
                  } ${selectedCatedra === "TECNO_3" ? "opacity-40" : ""}`}
                >
                  📝 5. Notas_Esquema_Num (Bio/Tec2)
                </button>
                <button
                  id="sheet-notas-status"
                  onClick={() => setSelectedSheet("notas_status")}
                  className={`px-4 py-2 border-r border-stone-200 transition-all ${
                    selectedSheet === "notas_status" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
                  } ${selectedCatedra === "BIO_MOL" ? "opacity-40" : ""}`}
                >
                  📝 6. Notas_Esquema_Status (Tec3)
                </button>
              </div>

              {/* SHEET CONTAINER & MOCK TABLE DISPLAY */}
              <div className="p-6 overflow-x-auto">
                {selectedSheet === "catedras" && (
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 uppercase">
                        <th className="p-3 border border-stone-200">ID_Catedra (PK)</th>
                        <th className="p-3 border border-stone-200">Nombre</th>
                        <th className="p-3 border border-stone-200">Cuatrimestre</th>
                        <th className="p-3 border border-stone-200">Activa (Vigencia)</th>
                        <th className="p-3 border border-stone-200">Anio_Vigente</th>
                        <th className="p-3 border border-stone-200">Tipo_Cronograma</th>
                        <th className="p-3 border border-stone-200">Contenido_Cronograma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCatedras.map((c) => (
                        <tr key={c.id} className={`hover:bg-amber-50/40 ${selectedCatedra === c.id ? "bg-amber-50/50 font-semibold" : ""}`}>
                          <td className="p-3 border border-stone-200 font-bold text-amber-800">{c.id}</td>
                          <td className="p-3 border border-stone-200">{c.nombre}</td>
                          <td className="p-3 border border-stone-200">{c.cuatrimestre}</td>
                          <td className="p-3 border border-stone-200">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${c.activa ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-400"}`}>
                              {c.activa ? "SI (Activo)" : "NO (Inactivo)"}
                            </span>
                          </td>
                          <td className="p-3 border border-stone-200">{c.anio_vigente}</td>
                          <td className="p-3 border border-stone-200 text-blue-800 font-bold">{c.tipo_cronograma}</td>
                          <td className="p-3 border border-stone-200 truncate max-w-xs" title={c.contenido_cronograma}>{c.contenido_cronograma}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedSheet === "secciones" && (
                  <div>
                    <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Requisito 6 Soportado:</strong> Alumnos de <strong>{selectedCatedra === "BIO_MOL" ? "Biología Molecular" : "Tecno III"}</strong> verán que 
                        {selectedCatedra === "BIO_MOL" 
                          ? " todas sus secciones están activas." 
                          : " la sección 'Apuntes de Clase' figura inactiva, demostrando cómo el sistema de datos maneja secciones vacías sin romper el código."}
                      </span>
                    </div>
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 uppercase">
                          <th className="p-3 border border-stone-200">ID_Catedra (FK)</th>
                          <th className="p-3 border border-stone-200">Seccion</th>
                          <th className="p-3 border border-stone-200">Estado</th>
                          <th className="p-3 border border-stone-200">Texto_Simple (Opcional)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockSecciones
                          .filter((s) => s.id_catedra === selectedCatedra)
                          .map((s, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/40">
                              <td className="p-3 border border-stone-200 text-stone-500">{s.id_catedra}</td>
                              <td className="p-3 border border-stone-200 font-bold text-stone-800">{s.seccion}</td>
                              <td className="p-3 border border-stone-200">
                                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${s.estado === "Activa" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                  {s.estado}
                                </span>
                              </td>
                              <td className="p-3 border border-stone-200 text-stone-600 italic">
                                {s.texto_simple || <span className="text-stone-300">{"<Vacío - Contenido Dinámico de Archivos>"}</span>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedSheet === "archivos" && (
                  <div>
                    <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Requisito 3 Soportado:</strong> Secciones como Bibliografía, Diapositivas y Apuntes simplemente consultan esta hoja filtrando por <code>ID_Catedra</code> y <code>Tipo_Seccion</code>. El orden numérico define en qué secuencia aparecen.
                      </span>
                    </div>
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 uppercase">
                          <th className="p-3 border border-stone-200">ID_Catedra (FK)</th>
                          <th className="p-3 border border-stone-200">Tipo_Seccion</th>
                          <th className="p-3 border border-stone-200">Nombre_Archivo</th>
                          <th className="p-3 border border-stone-200">Link_Drive</th>
                          <th className="p-3 border border-stone-200">Orden</th>
                          <th className="p-3 border border-stone-200">Fecha_Subida</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockArchivos
                          .filter((a) => a.id_catedra === selectedCatedra)
                          .map((a, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/40">
                              <td className="p-3 border border-stone-200 text-stone-500">{a.id_catedra}</td>
                              <td className="p-3 border border-stone-200 font-bold text-blue-800">{a.tipo_seccion}</td>
                              <td className="p-3 border border-stone-200">{a.nombre_archivo}</td>
                              <td className="p-3 border border-stone-200 text-amber-600 underline truncate max-w-xs">{a.link_drive}</td>
                              <td className="p-3 border border-stone-200 text-center font-bold">{a.orden}</td>
                              <td className="p-3 border border-stone-200 text-stone-400">{a.fecha_subida}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedSheet === "asistencia" && (
                  <div>
                    <div className="mb-4 text-xs text-stone-600 bg-stone-100 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-stone-500 shrink-0" />
                        <span>
                          <strong>Requisito 1 Soportado:</strong> Muestra el porcentaje consolidado del cuatrimestre por estudiante. Soportando históricos por año.
                        </span>
                      </div>
                      <span className="font-semibold text-stone-700">Filtrado por: {selectedCatedra} (Año 2026)</span>
                    </div>
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 uppercase">
                          <th className="p-3 border border-stone-200">ID_Catedra (FK)</th>
                          <th className="p-3 border border-stone-200">Anio (Cohorte)</th>
                          <th className="p-3 border border-stone-200">Estudiante</th>
                          <th className="p-3 border border-stone-200">Porcentaje_Asistencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockAsistencia
                          .filter((a) => a.id_catedra === selectedCatedra)
                          .map((a, idx) => (
                            <tr key={idx} className={`hover:bg-amber-50/40 ${a.anio !== 2026 ? "bg-stone-50 text-stone-400 font-light" : ""}`}>
                              <td className="p-3 border border-stone-200">{a.id_catedra}</td>
                              <td className="p-3 border border-stone-200">{a.anio}</td>
                              <td className="p-3 border border-stone-200 font-bold">{a.estudiante}</td>
                              <td className="p-3 border border-stone-200 font-bold text-stone-900">{a.porcentaje}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedSheet === "notas_num" && (
                  <div>
                    {selectedCatedra === "TECNO_3" && (
                      <div className="mb-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-4 rounded-lg">
                        <strong>⚠️ Alerta de Esquema:</strong> Esta hoja <strong>NO pertenece a Tecno III</strong>. Tecno III utiliza un esquema descriptivo/cualitativo diferente (Hoja 6) porque evalúa por estado (Aprobado/Desaprobado + Proyecto Práctico). Por favor, cambiá el filtro superior a "Biología Molecular" para ver cómo se alimenta esta tabla.
                      </div>
                    )}
                    <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Requisito 5 & 2 (Bio Molecular / Tecno II) Soportado:</strong> Tabla estructurada con columnas explícitas para notas de teoría y práctica independientes, campo de recuperatorio opcional (con referencia a cuál recupera) y condición final calculada.
                      </span>
                    </div>
                    <table className="w-full text-left border-collapse font-mono text-[10px] md:text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 uppercase">
                          <th className="p-2 border border-stone-200">Anio</th>
                          <th className="p-2 border border-stone-200">Estudiante</th>
                          <th className="p-2 border border-stone-200 bg-blue-50/50">P1 Teoría %</th>
                          <th className="p-2 border border-stone-200 bg-blue-50/50">P1 Práctica %</th>
                          <th className="p-2 border border-stone-200 bg-blue-50/50">P1 Result.</th>
                          <th className="p-2 border border-stone-200 bg-green-50/50">P2 Teoría %</th>
                          <th className="p-2 border border-stone-200 bg-green-50/50">P2 Práctica %</th>
                          <th className="p-2 border border-stone-200 bg-green-50/50">P2 Result.</th>
                          <th className="p-2 border border-stone-200 bg-amber-50/50">Recup. (1P/2P)</th>
                          <th className="p-2 border border-stone-200 bg-amber-50/50">Rec Teoría %</th>
                          <th className="p-2 border border-stone-200 bg-amber-50/50">Rec Práctica %</th>
                          <th className="p-2 border border-stone-200 bg-amber-50/50">Rec Result.</th>
                          <th className="p-2 border border-stone-200 bg-stone-200 font-bold">Condición Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockNotasNum
                          .filter((n) => selectedCatedra !== "TECNO_3")
                          .map((n, idx) => (
                            <tr key={idx} className={`hover:bg-amber-50/40 ${n.anio !== 2026 ? "bg-stone-50 text-stone-400" : ""}`}>
                              <td className="p-2 border border-stone-200">{n.anio}</td>
                              <td className="p-2 border border-stone-200 font-bold">{n.estudiante}</td>
                              <td className="p-2 border border-stone-200 bg-blue-50/20">{n.p1_teoria}</td>
                              <td className="p-2 border border-stone-200 bg-blue-50/20">{n.p1_practica}</td>
                              <td className="p-2 border border-stone-200 bg-blue-50/20 font-semibold">{n.p1_resultado}</td>
                              <td className="p-2 border border-stone-200 bg-green-50/20">{n.p2_teoria}</td>
                              <td className="p-2 border border-stone-200 bg-green-50/20">{n.p2_practica}</td>
                              <td className="p-2 border border-stone-200 bg-green-50/20 font-semibold">{n.p2_resultado}</td>
                              <td className="p-2 border border-stone-200 bg-amber-50/20 font-bold text-center">{n.recupera}</td>
                              <td className="p-2 border border-stone-200 bg-amber-50/20">{n.rec_teoria}</td>
                              <td className="p-2 border border-stone-200 bg-amber-50/20">{n.rec_practica}</td>
                              <td className="p-2 border border-stone-200 bg-amber-50/20 font-semibold">{n.rec_resultado}</td>
                              <td className="p-2 border border-stone-200 bg-stone-100 font-bold text-stone-900">
                                <span className={`px-1.5 py-0.5 rounded-sm ${n.condicion_final === "Promoción" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                  {n.condicion_final}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedSheet === "notas_status" && (
                  <div>
                    {selectedCatedra === "BIO_MOL" && (
                      <div className="mb-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-4 rounded-lg">
                        <strong>⚠️ Alerta de Esquema:</strong> Esta hoja <strong>pertenece a Tecno III</strong>. Biología Molecular y Tecno II usan el esquema de notas numéricas por separado (Hoja 5) porque exigen notas de práctica independientes y un sistema numérico ponderado. Por favor, cambiá el filtro superior a "Tecno III" para ver cómo se alimenta esta tabla.
                      </div>
                    )}
                    <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Requisito 5 (Tecno III) Soportado:</strong> Esquema flexible y descriptivo. Elimina los porcentajes numéricos de práctica en favor de un estado final de "Práctica" general (Aprobado/Pendiente), y reduce la evaluación de teoría a nota (%) y Condición lógica directa.
                      </span>
                    </div>
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 uppercase">
                          <th className="p-3 border border-stone-200">Anio</th>
                          <th className="p-3 border border-stone-200">Estudiante</th>
                          <th className="p-3 border border-stone-200 bg-blue-50/50">P1 Teoría %</th>
                          <th className="p-3 border border-stone-200 bg-blue-50/50">P1 Condición</th>
                          <th className="p-3 border border-stone-200 bg-green-50/50">P2 Teoría %</th>
                          <th className="p-3 border border-stone-200 bg-green-50/50">P2 Condición</th>
                          <th className="p-3 border border-stone-200 bg-amber-50/50">Recup. Teoría %</th>
                          <th className="p-3 border border-stone-200 bg-amber-50/50">Recup. Condición</th>
                          <th className="p-3 border border-stone-200 bg-purple-50/50">Práctica Global</th>
                          <th className="p-3 border border-stone-200 bg-stone-200 font-bold">Condición Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockNotasStatus
                          .filter((n) => selectedCatedra === "TECNO_3")
                          .map((n, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/40">
                              <td className="p-3 border border-stone-200">{n.anio}</td>
                              <td className="p-3 border border-stone-200 font-bold">{n.estudiante}</td>
                              <td className="p-3 border border-stone-200 bg-blue-50/20">{n.p1_teoria}</td>
                              <td className="p-3 border border-stone-200 bg-blue-50/20 font-semibold">{n.p1_condicion}</td>
                              <td className="p-3 border border-stone-200 bg-green-50/20">{n.p2_teoria}</td>
                              <td className="p-3 border border-stone-200 bg-green-50/20 font-semibold">{n.p2_condicion}</td>
                              <td className="p-3 border border-stone-200 bg-amber-50/20">{n.rec_teoria}</td>
                              <td className="p-3 border border-stone-200 bg-amber-50/20 font-semibold">{n.rec_condicion}</td>
                              <td className="p-3 border border-stone-200 bg-purple-50/20 font-bold text-stone-800">{n.practica}</td>
                              <td className="p-3 border border-stone-200 bg-stone-100 font-bold text-stone-900">
                                <span className={`px-1.5 py-0.5 rounded-sm ${
                                  n.condicion_final === "Promoción" 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : n.condicion_final === "Regular" 
                                      ? "bg-amber-100 text-amber-800" 
                                      : "bg-rose-100 text-rose-800"
                                }`}>
                                  {n.condicion_final}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE PREVIEW OF HOW THIS RENDERS FOR STUDENTS */}
            <div className="bg-[#FAF9F6] border border-stone-200 rounded-xl p-6 shadow-xs">
              <h4 className="font-bold text-stone-950 text-sm uppercase tracking-wider font-mono mb-4 text-stone-500 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Simulador del Portal Web (Vista Estudiante)</span>
              </h4>

              <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
                <div className="bg-stone-900 text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight">Cátedra Activa:</span>
                    <span className="bg-amber-600 px-2 py-0.5 text-xs rounded-sm font-semibold">
                      {selectedCatedra === "BIO_MOL" ? "Biología Molecular" : "Tecno III"}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">Cohorte {selectedCatedra === "BIO_MOL" ? "2026 (1er Cuat.)" : "2026 (1er Cuat.)"}</span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* SECCION PROGRAMA / CONDICIONES */}
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2 uppercase font-mono">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Programa & Cursada</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                        {mockSecciones.find(s => s.id_catedra === selectedCatedra && s.seccion === "Programa")?.texto_simple}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
                      Vía Hoja: <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Secciones_Estado</code>
                    </div>
                  </div>

                  {/* SECCION ARCHIVOS (DIAPOSITIVAS) */}
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2 uppercase font-mono">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Últimas Diapositivas</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {mockArchivos
                          .filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === "Diapositivas")
                          .map((a, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-stone-700 hover:text-stone-900">
                              <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate underline font-medium">{a.nombre_archivo}</span>
                            </li>
                          ))}
                        {mockArchivos.filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === "Diapositivas").length === 0 && (
                          <li className="text-stone-400 italic">No hay archivos cargados.</li>
                        )}
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
                      Vía Hoja: <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Archivos</code>
                    </div>
                  </div>

                  {/* SECCION ASISTENCIA & NOTAS ALUMNO */}
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2 uppercase font-mono">
                        <Users className="w-3.5 h-3.5" />
                        <span>Rendimiento del Alumno</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-2 rounded-md border border-stone-150">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-stone-500">Estudiante:</span>
                            <span className="text-stone-900">{selectedCatedra === "BIO_MOL" ? "Pérez, Juan" : "Gómez, Lucas"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-stone-500">Asistencia Total:</span>
                            <span className="text-emerald-600 font-bold">{selectedCatedra === "BIO_MOL" ? "92%" : "80%"}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1 pt-1.5 border-t border-stone-100">
                            <span className="text-stone-500">Condición Final:</span>
                            <span className="text-stone-900 font-bold px-1 bg-emerald-50 text-emerald-800 rounded-sm">Promoción</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
                      Vía Hoja: <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Asistencia</code> & <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Notas_*</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: RECOMMENDATION */}
        {activeTab === "recommendation" && (
          <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-stone-900 border-b border-stone-200 pb-3">
              Recomendación de Arquitectura: Google Sheets como Base de Datos
            </h3>
            
            <p className="text-stone-600 leading-relaxed">
              Para un docente que gestiona contenidos y rendimiento escolar manualmente, obligarlo a aprender formatos de bases de datos tradicionales o interfaces web complejas de administración representa una fricción enorme. 
              <strong> Google Sheets es la solución ideal</strong> por los siguientes motivos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ventajas de Google Sheets</span>
                </h4>
                <ul className="text-xs text-stone-600 space-y-2.5 list-disc list-inside">
                  <li><strong>Curva de Aprendizaje Cero:</strong> El docente ya conoce y usa planillas de cálculo a diario para cargar asistencia y notas.</li>
                  <li><strong>Actualización Offline/Móvil:</strong> Las apps oficiales de Google Sheets permiten cargar notas desde cualquier lugar con o sin internet.</li>
                  <li><strong>Cómputos Libres:</strong> Puede usar fórmulas propias de Sheets (PROMEDIO, SI, BUSCARV) antes de que la web consuma el resultado final.</li>
                  <li><strong>Control de Versiones Nativo:</strong> Historial de cambios integrado de Google Drive ante cualquier error involuntario.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/20 space-y-2">
                <h4 className="font-bold text-rose-950 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-800 shrink-0" />
                  <span>Por qué NO usar un JSON Estático</span>
                </h4>
                <ul className="text-xs text-stone-600 space-y-2.5 list-disc list-inside">
                  <li><strong>Frustración Tecnológica:</strong> Un docente modificando un JSON estático tiene un alto riesgo de romper la sintaxis (por ejemplo, omitir una coma, llave o comilla), lo cual haría crashear toda la web.</li>
                  <li><strong>Redespliegue Necesario:</strong> Cada vez que se sube un apunte o se corrige una nota, se tendría que hacer un "commit & deploy" de la app en Cloud Run.</li>
                  <li><strong>Dificultad de entrada múltiple:</strong> Si tiene un ayudante de cátedra, editar un archivo de código compartido es inviable.</li>
                </ul>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-1.5 text-sm">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>¿Cómo lee la app de React esta planilla de Google Sheets?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                El flujo de integración más robusto y de menor latencia no requiere complejas integraciones de Google Cloud SDK en el frontend. En su lugar, el docente simplemente selecciona <strong>Archivo &gt; Compartir &gt; Publicar en la Web</strong>, seleccionando las hojas en formato CSV.
              </p>
              <div className="bg-stone-900 text-stone-300 p-4 rounded-lg font-mono text-[11px] space-y-2">
                <p className="text-stone-500">// La app lee el formato CSV nativo de Google de manera ultra rápida</p>
                <p className="text-stone-200">const ID_PLANILLA = "1A8zB_tu_id_de_google_sheets_aqui";</p>
                <p className="text-stone-200">const ID_HOJA_NOTAS = "0"; // GID de la hoja Notas_Esquema_Num</p>
                <p className="text-stone-200">const url = `https://docs.google.com/spreadsheets/d/&#123;ID_PLANILLA&#125;/export?format=csv&gid=&#123;ID_HOJA_NOTAS&#125;`;</p>
                <p className="mt-2 text-stone-500">// En producción, el backend Express (server.ts) consulta esta URL, convierte el CSV a JSON</p>
                <p className="text-stone-500">// y lo expone en un endpoint seguro "/api/notas" para evitar exponer IDs públicamente.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: VERSIONING */}
        {activeTab === "versioning" && (
          <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-stone-900 border-b border-stone-200 pb-3">
              Gestión de Históricos por Año de Cohorte (Requisito 5)
            </h3>
            
            <p className="text-stone-600 leading-relaxed">
              Es muy común que los sistemas escolares pierdan su histórico porque el docente simplemente "sobreescribe" las notas y asistencias de los alumnos del año anterior con los del nuevo año lectivo. 
              Nuestra propuesta utiliza un <strong>versionado por columna único</strong> para mantener un archivo histórico sólido sin requerir la creación de nuevas planillas año tras año.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200">
                <span className="text-lg mb-2 block">📋</span>
                <h4 className="font-bold text-stone-900 text-sm mb-1">1. Registro Continuo</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  El docente nunca borra los alumnos de los años anteriores. Simplemente agrega los nuevos alumnos al final de la planilla escribiendo el año vigente (por ejemplo, <code>2026</code>) en la columna <strong>Anio</strong>.
                </p>
              </div>

              <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200">
                <span className="text-lg mb-2 block">🧭</span>
                <h4 className="font-bold text-stone-900 text-sm mb-1">2. Control en Cátedras</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  En la hoja <strong>Catedras</strong>, el docente especifica cuál es el <code>Anio_Vigente</code> activo. Por ejemplo, al cambiar de <code>2025</code> a <code>2026</code>, la web automáticamente oculta los alumnos antiguos y destaca los nuevos.
                </p>
              </div>

              <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200">
                <span className="text-lg mb-2 block">🏛️</span>
                <h4 className="font-bold text-stone-900 text-sm mb-1">3. Selector de Histórico</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  La interfaz web puede incluir un selector discreto para que ex-alumnos de años anteriores puedan consultar sus notas finales buscando su nombre y filtrando por año.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-3 text-sm">Ejemplo Visual de Carga en Google Sheets (Hoja Asistencia)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs bg-white rounded-lg border border-stone-200">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700">
                      <th className="p-2.5 border border-stone-200">ID_Catedra</th>
                      <th className="p-2.5 border border-stone-200 bg-amber-50 text-amber-950 font-bold">Anio</th>
                      <th className="p-2.5 border border-stone-200">Estudiante</th>
                      <th className="p-2.5 border border-stone-200">Porcentaje_Asistencia</th>
                      <th className="p-2.5 border border-stone-200 text-stone-400">Interpretación de la Web</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-stone-50/50 text-stone-400">
                      <td className="p-2.5 border border-stone-200">BIO_MOL</td>
                      <td className="p-2.5 border border-stone-200 bg-amber-50/50 font-bold">2025</td>
                      <td className="p-2.5 border border-stone-200">Alvarez, Pedro</td>
                      <td className="p-2.5 border border-stone-200">90%</td>
                      <td className="p-2.5 border border-stone-200 italic">Oculto por defecto (Guardado en histórico)</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 border border-stone-200">BIO_MOL</td>
                      <td className="p-2.5 border border-stone-200 bg-amber-50 font-bold text-amber-900">2026</td>
                      <td className="p-2.5 border border-stone-200 font-bold">Pérez, Juan</td>
                      <td className="p-2.5 border border-stone-200 font-bold text-stone-900">92%</td>
                      <td className="p-2.5 border border-stone-200 text-emerald-700 font-semibold italic">Visible Activo (Cohorte Actual)</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 border border-stone-200">BIO_MOL</td>
                      <td className="p-2.5 border border-stone-200 bg-amber-50 font-bold text-amber-900">2026</td>
                      <td className="p-2.5 border border-stone-200 font-bold">Rodríguez, María</td>
                      <td className="p-2.5 border border-stone-200 font-bold text-stone-900">68%</td>
                      <td className="p-2.5 border border-stone-200 text-emerald-700 font-semibold italic">Visible Activo (Cohorte Actual)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: MARKDOWN SPEC */}
        {activeTab === "markdown" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-stone-200 flex justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-stone-900 text-lg">Especificación Técnica en Markdown</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Copiá esta documentación estructurada con un click. Te servirá como la guía y especificación absoluta para conectar el API de Sheets al construir tu aplicación definitiva en Google AI Studio.
                </p>
              </div>
              <button
                id="btn-copy-tab"
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Documento</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-stone-900 text-stone-100 rounded-xl p-6 font-mono text-xs overflow-x-auto max-h-[600px] border border-stone-850 shadow-inner">
              <pre className="whitespace-pre-wrap">{markdownText}</pre>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-100 border-t border-stone-200 py-12 mt-16 text-center text-xs text-stone-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>Diseño de Arquitectura de Datos de Cátedras Académicas</p>
          <p className="text-stone-400">Pensado para integraciones ágiles de Google Sheets API en Google AI Studio & Cloud Run</p>
        </div>
      </footer>
    </div>
  );
}
