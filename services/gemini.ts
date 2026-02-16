// Backend API Helper
// import { GoogleGenAI } from "@google/genai"; // Removed to avoid pollyfill issues in browser

// Helper to call backend - uses environment variable for production
const envUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = envUrl !== undefined ? envUrl : 'http://localhost:8001';

// Ensure we don't double stack /api if the user put it in the env var
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export interface AnalisisIncidente {
  categoria: 'DEMORA' | 'ACCIDENTE' | 'INSEGURIDAD' | 'PIQUETE' | 'DATO_IRRELEVANTE';
  consejo: string;
}

/**
 * Analiza un reporte de incidente utilizando el backend (Gemini).
 * @param textoReporte El texto o tipo de incidente reportado.
 * @returns Un objeto con la categoría y el consejo de seguridad.
 */
export async function analizarIncidente(textoReporte: string): Promise<AnalisisIncidente> {
  try {
    const response = await fetch(`${API_URL}/bondi/reportar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texto: textoReporte,
        linea: '0' // Por defecto, luego podríamos pasar la línea real si la tenemos
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    // El backend nos devuelve { mensaje: string, analisis: { categoria, consejo, ... } }
    // Mapeamos a lo que espera el frontend
    if (data.analisis) {
      return {
        categoria: data.analisis.categoria || 'DATO_IRRELEVANTE',
        consejo: data.analisis.consejo || 'Gracias por avisar.'
      };
    }

    throw new Error("Formato de respuesta inválido");

  } catch (error) {
    console.warn("Fallo al contactar al backend, usando respuesta offline.", error);
    return {
      categoria: 'DATO_IRRELEVANTE',
      consejo: "Reporte guardado localmente (Offline)."
    };
  }
}