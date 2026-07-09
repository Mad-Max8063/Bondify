import { GoogleGenAI, Type } from "@google/genai";
import process from 'process';

// Lazy: process.env recién está completo cuando dotenv ya corrió (imports ESM se evalúan antes).
function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.API_KEY;
}

// Clasificación local por keywords: cubre los reportes obvios sin gastar cuota.
function analisisPorKeywords(texto) {
  const t = texto.toLowerCase();
  let cat = 'DATO_IRRELEVANTE';
  let resumen = 'Reporte de un pasajero en la zona.';
  let consejo = 'Gracias por avisar.';
  let gravedad = 0;

  if (t.includes('piquete') || t.includes('corte') || t.includes('manifestacion')) {
    cat = 'PIQUETE'; resumen = 'Corte o manifestación reportada en la zona.'; consejo = 'Evitá la zona o buscá calles alternativas.'; gravedad = 0.8;
  } else if (t.includes('choque') || t.includes('accidente') || t.includes('vuelco')) {
    cat = 'ACCIDENTE'; resumen = 'Accidente de tránsito reportado en la zona.'; consejo = 'Si podés, desviate antes de llegar.'; gravedad = 0.9;
  } else if (t.includes('robo') || t.includes('ladron') || t.includes('inseguros')) {
    cat = 'INSEGURIDAD'; resumen = 'Hecho de inseguridad reportado en la zona.'; consejo = 'Guardá el celular y mantenete alerta.'; gravedad = 1.0;
  } else if (t.includes('demora') || t.includes('tarda') || t.includes('lento')) {
    cat = 'DEMORA'; resumen = 'Demoras reportadas en el servicio.'; consejo = 'Tené en cuenta unos minutos extra de viaje.'; gravedad = 0.4;
  } else if (t.includes('desvio') || t.includes('desvío')) {
    cat = 'DESVIO'; resumen = 'Desvío reportado en el recorrido.'; consejo = 'Seguí las indicaciones del chofer.'; gravedad = 0.5;
  }

  return JSON.stringify({
    categoria: cat,
    gravedad: gravedad,
    resumen_corto: resumen,
    consejo: consejo,
    es_peligroso: gravedad > 0.7
  });
}

async function analizarIncidente(textoReporte) {
  // Keywords primero: el free tier de Gemini da apenas 20 requests/día por
  // modelo, así que el modelo queda reservado para los textos ambiguos que
  // el matching local no sabe clasificar.
  const porKeywords = analisisPorKeywords(textoReporte);
  if (JSON.parse(porKeywords).categoria !== 'DATO_IRRELEVANTE') {
    return porKeywords;
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'tu_clave_gemini') {
    console.log("🔮 Gemini Mock: Analizando texto localmente...");
    return porKeywords;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Flash-lite: alcanza de sobra para clasificar y su cuota gratuita diaria
    // es mucho más alta que la de flash (y va por modelo, cupo aparte).
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Eres un asistente de tránsito experto en Buenos Aires (AMBA).
      Analiza el siguiente reporte enviado por un pasajero de colectivo: "${textoReporte}".
      Tu tarea es clasificar la situación, extraer información útil y dar un consejo de seguridad breve.`,
      config: {
        systemInstruction: `Categorías posibles: 'DEMORA', 'ACCIDENTE', 'INSEGURIDAD', 'PIQUETE', 'DATO_IRRELEVANTE'.
        La gravedad es un número entre 0 y 1 (0 = sin impacto, 1 = peligro serio); es_peligroso es true si la gravedad supera 0.7.
        El consejo debe ser corto, útil y en tono claro y respetuoso, en español de Argentina (voseo: "evitá", "tené en cuenta").
        Nada de lunfardo, muletillas ("che", "ojo al piojo") ni chistes: informás una situación de tránsito que puede ser seria.
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

    // En @google/genai response.text es propiedad (getter), no método
    return response.text;
  } catch (error) {
    console.error("Error en Gemini Service:", error);
    // Fallback por si falla la API (cuota agotada, red, etc.)
    return porKeywords;
  }
}

export { analizarIncidente };