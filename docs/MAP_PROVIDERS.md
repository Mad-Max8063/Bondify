# 🗺️ Guía de Proveedores de Mapas - Bondify

## Setup Actual

Bondify usa **Leaflet + OpenStreetMap** por defecto (gratis, sin límites).

---

## Cómo Cambiar de Proveedor

Editar el archivo `.env`:

```env
VITE_MAP_PROVIDER=mapbox
VITE_MAPBOX_TOKEN=tu_token_aquí
```

Reiniciar el servidor (`npm run dev`).

---

## Proveedores Disponibles

### 1. OpenStreetMap (default)
- **Costo**: Gratis
- **Límites**: Sin límites estrictos
- **Config**: No requiere configuración
```env
VITE_MAP_PROVIDER=openstreetmap
```

### 2. Stadia Maps
- **Costo**: Gratis hasta 200k vistas/mes
- **URL**: https://stadiamaps.com
```env
VITE_MAP_PROVIDER=stadia
VITE_STADIA_KEY=tu_key
```

### 3. MapTiler
- **Costo**: Gratis hasta 100k vistas/mes
- **URL**: https://maptiler.com
```env
VITE_MAP_PROVIDER=maptiler
VITE_MAPTILER_KEY=tu_key
```

### 4. Thunderforest (ideal para transporte)
- **Costo**: Gratis hasta 150k vistas/mes
- **URL**: https://thunderforest.com
```env
VITE_MAP_PROVIDER=thunderforest
VITE_THUNDERFOREST_KEY=tu_key
```

### 5. Mapbox (premium)
- **Costo**: $0 hasta 50k, después $5/1000 cargas
- **URL**: https://mapbox.com
```env
VITE_MAP_PROVIDER=mapbox
VITE_MAPBOX_TOKEN=tu_token
```

---

## Recomendación de Escalado

| Etapa | Usuarios | Proveedor |
|-------|----------|-----------|
| Lanzamiento | 0 - 10k | OpenStreetMap |
| Crecimiento | 10k - 50k | Stadia o MapTiler |
| Escala | 50k+ | Mapbox o Google Maps |

---

## Archivos Relacionados

- `config/mapConfig.ts` - Configuración de proveedores
- `components/MapView.tsx` - Componente del mapa
- `.env.example` - Template de variables

---

*Generado para Bondify - Enero 2026*
