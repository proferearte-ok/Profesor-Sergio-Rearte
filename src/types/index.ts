/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Representa una cátedra universitaria de la institución.
 */
export interface Catedra {
  id: string;
  nombre: string;
  cuatrimestre: string;
  activa: boolean;
  anio_vigente: number;
  tipo_cronograma: string;
  contenido_cronograma: string;
}

/**
 * Estado de activación y contenido estático de las 8 secciones de cada cátedra.
 */
export interface SeccionEstado {
  id_catedra: string;
  seccion: string;
  estado: "Activa" | "Inactiva";
  texto_simple: string;
}

/**
 * Registro de archivos de Google Drive asociados a secciones de la cátedra.
 */
export interface Archivo {
  id_catedra: string;
  tipo_seccion: "Bibliografia" | "Diapositivas" | "Apuntes_Clase" | "Programa" | "Condiciones_Cronograma";
  nombre_archivo: string;
  link_drive: string;
  orden: number;
  fecha_subida: string;
}

/**
 * Registro de mapeo de Carpetas de Google Drive para listado dinámico de archivos.
 */
export interface CarpetaDrive {
  id_catedra: string;
  tipo_seccion: "Bibliografia" | "Diapositivas" | "Apuntes_Clase";
  folder_id_drive: string;
}

export interface Asistencia {
  id_catedra: string;
  anio: number;
  estudiante: string;
  porcentaje: string;
}

/**
 * Esquema de notas numéricas para Biología Molecular y Tecno II.
 */
export interface NotaNum {
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

/**
 * Esquema de notas descriptivas y de condición directa para Tecno III.
 */
export interface NotaStatus {
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
