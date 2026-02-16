import { GoogleGenAI, Type } from "@google/genai";
import process from 'process';

// Usamos process.env.API_KEY como manda la regla, con fallback a GEMINI_API_KEY por compatibilidad
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

// Mock Logic Helper
function mockAnalisis(texto) {
  const t = texto.toLowerCase();
  let cat = 'DATO_IRRELEVANTE';
  let consejo = 'Gracias por avisar.';
  let gravedad = 0;

  if (t.includes('piquete') || t.includes('corte') || t.includes('manifestacion')) {
    cat = 'PIQUETE'; consejo = 'Evitá la zona, buscá calles paralelas.'; gravedad = 0.8;
  } else if (t.includes('choque') || t.includes('accidente') || t.includes('vuelco')) {
    cat = 'ACCIDENTE'; consejo = 'Si podés, desviate antes de llegar.'; gravedad = 0.9;
  } else if (t.includes('robo') || t.includes('ladron') || t.includes('inseguros')) {
    cat = 'INSEGURIDAD'; consejo = 'Guardá el celular y mantente alerta.'; gravedad = 1.0;
  } else if (t.includes('demora') || t.includes('tarda') || t.includes('lento')) {
    cat = 'DEMORA'; consejo = 'Paciencia, hoy todos van lento.'; gravedad = 0.4;
  } else if (t.includes('desvio') || t.includes('desvío')) {
    cat = 'DESVIO'; consejo = 'Seguí las indicaciones del chofer.'; gravedad = 0.5;
  }

  return JSON.stringify({
    categoria: cat,
    gravedad: gravedad,
    resumen_corto: "Reporte simulado (Sin API Key)",
    consejo: consejo,
    es_peligroso: gravedad > 0.7
  });
}

async function analizarIncidente(textoReporte) {
  // --- MOCK CHECK ---
  if (!apiKey || apiKey === 'tu_clave_gemini') {
    console.log("🔮 Gemini Mock: Analizando texto localmente...");
    return mockAnalisis(textoReporte);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Usamos gemini-1.5-flash que es rápido y soporta JSON estructurado
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Eres un asistente de tránsito experto en Buenos Aires (AMBA).
      Analiza el siguiente reporte enviado por un pasajero de colectivo: "${textoReporte}".
      Tu tarea es clasificar la situación, extraer información útil y dar un consejo de seguridad breve.`,
      config: {
        systemInstruction: `Categorías posibles: 'DEMORA', 'ACCIDENTE', 'INSEGURIDAD', 'PIQUETE', 'DATO_IRRELEVANTE'.
        El consejo debe ser corto, útil y con "modismos" argentinos sutiles si cabe.
        Responde ÚNICAMENTE con este formato JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoria: { type: Type.STRING, enum: ['DEMORA', 'ACCIDENTE', 'INSEGURIDAD', 'PIQUETE', 'DATO_IRRELEVANTE'] },
            gravedad: { type: Type.NUMBER },
            resumen_corto: { type: Type.STRING },
            consejo: { type: Type.STRING },
            es_peligroso: { type: Type.BOOLEAN }
          },
          required: ['categoria', 'gravedad', 'resumen_corto', 'consejo', 'es_peligroso']
        }
      }
    });

    return response.text();
  } catch (error) {
    console.error("Error en Gemini Service:", error);
    // Devuelve un JSON fallback por si falla la API
    return mockAnalisis(textoReporte);
  }
}

export { analizarIncidente };