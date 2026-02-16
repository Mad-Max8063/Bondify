# 🚌 Bondify

> **Tu Waze para el transporte público.** Sabé dónde está el bondi en tiempo real.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)]()

## ✨ Características

- 🗺️ **Mapa en tiempo real** - Visualizá la ubicación de los colectivos
- 👥 **Verificación comunitaria** - Los usuarios confirman la posición real
- ⚠️ **Alertas de seguridad** - Reportá y recibí avisos de incidentes
- 🎮 **Gamificación** - Ganá puntos y personalizá tu garage virtual
- 🧠 **AI con Gemini** - Consejos inteligentes de seguridad
- 📱 **PWA** - Instalable como app nativa

## 🚀 Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/Mad-Max8063/Bondify.git
cd Bondify

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración

# Iniciar en desarrollo
npm run dev
```

## 📦 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_BACKEND_URL` | URL del backend API |

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Mapas**: Leaflet + React-Leaflet
- **UI**: Tailwind CSS + Lucide Icons
- **AI**: Google Gemini API
- **PWA**: Service Worker + Web App Manifest

## 📱 Instalación como App

1. Abrí Bondify en tu navegador móvil
2. Tocá "Agregar a pantalla de inicio"
3. ¡Listo! Ya tenés Bondify como app

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Forkeá el repositorio
2. Creá una rama (`git checkout -b feature/nueva-funcion`)
3. Hacé commit (`git commit -m 'Agrega nueva función'`)
4. Pusheá (`git push origin feature/nueva-funcion`)
5. Abrí un Pull Request

## 📄 Licencia

MIT - Matias Maximiliano Bernal

## ☁️ Despliegue en Emergent (Single-Service Monolith)
Esta aplicación está configurada para desplegarse como un único servicio que incluye Frontend y Backend.

1. **Crear Servicio** en Emergent conectado al repositorio.
2. **Configuración**:
   - **Root Directory**: `.` (vacío/raíz)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. **Variables de Entorno**:
   - `PORT`: `8001` (o por defecto)
   - `VITE_BACKEND_URL`: `https://tu-app.emergent.sh` (o dejar vacío si es el mismo dominio)
   - `GEMINI_API_KEY`: Tu API Key
   - `VITE_MAP_PROVIDER`: `openstreetmap`

---

**Hecho con 💜 en Argentina**
