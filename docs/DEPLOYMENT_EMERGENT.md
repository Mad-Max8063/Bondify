# 🚀 Guía de Despliegue en Emergent.sh - Bondify

Para lanzar Bondify, vas a necesitar crear **dos servicios** en Emergent: uno para el **Frontend** (lo que ve el usuario) y otro para el **Backend** (el cerebro).

---

## 🏗️ Paso 1: Desplegar el Backend

1. Entrá a tu panel de Emergent.sh.
2. Elegí **"Create Service"** y conectá tu repositorio `Bondify`.
3. **Root Directory**: Escribí `server` (para que use la carpeta del servidor).
4. **Environment Variables**: Agregá las siguientes:

| Variable | Valor |
|----------|-------|
| `PORT` | `8001` (o el que prefieras) |
| `GEMINI_API_KEY` | `TU_LLAVE_DE_GEMINI` |
| `CORS_ORIGINS` | `*` (o la URL que te dé Emergent para el frontend más tarde) |

5. Dale a **Deploy**. Una vez termine, Emergent te va a dar una URL (ej: `https://api-bondify.emergent.sh`). **Anotala.**

---

## 🎨 Paso 2: Desplegar el Frontend

1. Creá **otro servicio** nuevo conectando el mismo repo `Bondify`.
2. **Root Directory**: Dejalo vacío (es la raíz).
3. **Environment Variables**: Agregá estas (importante el prefijo `VITE_`):

| Variable | Valor |
|----------|-------|
| `VITE_BACKEND_URL` | `https://tu-backend-url.emergent.sh` (la que anotaste arriba) |
| `VITE_GEMINI_KEY` | `TU_LLAVE_DE_GEMINI` |
| `VITE_MAP_PROVIDER` | `openstreetmap` (gratis por defecto) |

4. Dale a **Deploy**. 

---

## 🔗 Paso 3: Vinculación Final

Una vez que tengas la URL del Frontend (ej: `https://app-bondify.emergent.sh`), te recomiendo volver a la configuración del **Backend** y actualizar la variable `CORS_ORIGINS` con esa URL por seguridad.

---

## 📝 Checklist de Variables

Copiá y pegá esto cuando Emergent te lo pida:

**Para el Frontend:**
```env
VITE_BACKEND_URL=https://api-bondify.emergent.sh
VITE_GEMINI_KEY=tu_key_aqui
VITE_MAP_PROVIDER=openstreetmap
```

**Para el Backend:**
```env
PORT=8001
GEMINI_API_KEY=tu_key_aqui
CORS_ORIGINS=*
```

---

**¡Listo!** Con esto Bondify ya debería estar en línea y protegida con el sistema de privacidad que implementamos. 🚌🚀
