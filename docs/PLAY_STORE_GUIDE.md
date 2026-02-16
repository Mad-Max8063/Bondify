# 📱 Guía para Publicar en Google Play Store

## Requisitos Previos

✅ Cuenta de desarrollador Google Play ($25 única vez)  
✅ App funcionando en HTTPS (Emergent)  
✅ Manifest.json configurado (ya está listo)

---

## Paso 1: Generar Íconos

Necesitás generar íconos PNG en múltiples tamaños. 

### Opción A: Usar un generador online
1. Andá a **https://realfavicongenerator.net**
2. Subí tu logo (`public/logo.png`)
3. Descargá el paquete de íconos
4. Copialos a `public/icons/`

### Opción B: Usar icongen.io (más simple)
1. Andá a **https://icongen.io**
2. Subí tu logo
3. Seleccioná PWA/Android
4. Descargá y copiá a `public/icons/`

### Tamaños necesarios:
```
public/icons/
├── icon-48.png
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-256.png
├── icon-384.png
├── icon-512.png
├── icon-maskable-192.png  (con padding 20%)
└── icon-maskable-512.png  (con padding 20%)
```

---

## Paso 2: Crear Screenshots

Tomá screenshots de la app en un celular o emulador.

**Tamaño requerido**: 1080x1920 px (vertical)

1. Capturá 2-8 screenshots
2. Guardalos en `public/screenshots/`
3. Nombrados: `screenshot-1.png`, `screenshot-2.png`, etc.

---

## Paso 3: Usar PWABuilder

1. Andá a **https://pwabuilder.com**
2. Ingresá la URL de tu app: `https://tu-app.emergent.sh`
3. PWABuilder analizará tu PWA
4. Click en "Build" → "Android"
5. Descargá el APK

---

## Paso 4: Subir a Play Store

1. Andá a **play.google.com/console**
2. Creá una nueva app
3. Completá la información:
   - **Nombre**: Bondify
   - **Descripción corta**: Tu Waze del transporte público
   - **Descripción larga**: (copiar del README)
   - **Categoría**: Maps & Navigation
4. Subí el AAB/APK de PWABuilder
5. Subí screenshots y ícono
6. Enviá para revisión

---

## Info para Play Store

```
Nombre: Bondify
Tagline: Tu Waze para el transporte público
Categoría: Maps & Navigation
Clasificación: Everyone (Todos)
```

### Descripción corta (80 caracteres):
```
Sabé dónde está tu bondi en tiempo real. Verificado por usuarios como vos.
```

### Descripción larga:
```
Bondify es la app comunitaria de transporte público para Buenos Aires.

✨ CARACTERÍSTICAS:
• Mapa en tiempo real con ubicación de colectivos
• Datos verificados por usuarios (no más "bondi fantasma")
• Alertas de seguridad y desvíos
• Sistema de puntos y gamificación
• Funciona offline

🎯 ¿CÓMO FUNCIONA?
Los pasajeros a bordo comparten su ubicación de forma anónima, 
así quienes esperan saben exactamente cuándo llega el bondi.

🚌 LÍNEAS VERIFICADAS:
Todas las líneas de AMBA (Buenos Aires y alrededores)

Hecho con 💜 en Argentina
```

---

## Checklist Final

- [ ] Íconos generados (12 archivos)
- [ ] Screenshots (mínimo 2)
- [ ] PWABuilder genera el APK sin errores
- [ ] Cuenta de desarrollador creada
- [ ] App subida y revisada

---

*¡Éxitos con Bondify!* 🚌🚀
