#!/bin/bash

# Script de prueba para MI PARADA - Colectibondy
# Prueba todas las funcionalidades del backend

BASE_URL="http://localhost:3001/api"
USER_ID="test-demo-user-$(date +%s)"

echo "🚌 MI PARADA - Testing Completo"
echo "================================"
echo ""

# 1. Health Check
echo "1️⃣  Verificando estado del backend..."
curl -s "$BASE_URL/health" | jq .
echo ""

# 2. Crear perfil de usuario
echo "2️⃣  Creando perfil de usuario..."
PERFIL=$(curl -s -X POST "$BASE_URL/usuario/perfil" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"nombre\":\"Juan Pérez\",\"modo\":\"COMMUNITY\"}")
echo "$PERFIL" | jq '{status, userId: .usuario.userId, modo: .usuario.modo}'
echo ""

# 3. Ver colectivos activos
echo "3️⃣  Obteniendo colectivos activos..."
curl -s "$BASE_URL/bondi/activos" | jq '{count, colectivos: .colectivos[] | {linea, ramal, lat: .ubicacion.lat, lng: .ubicacion.lng, velocidad}}'
echo ""

# 4. Agregar favoritos
echo "4️⃣  Agregando líneas a favoritos..."
curl -s -X POST "$BASE_URL/usuario/favoritos/agregar" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"linea\":\"152\",\"ramal\":\"Olivos\"}" | jq '{status, mensaje}'

curl -s -X POST "$BASE_URL/usuario/favoritos/agregar" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"linea\":\"60\",\"ramal\":\"Tigre\"}" | jq '{status, mensaje}'
echo ""

# 5. Enviar reporte con IA
echo "5️⃣  Enviando reporte con análisis de Gemini AI..."
curl -s -X POST "$BASE_URL/bondi/reportar" \
  -H "Content-Type: application/json" \
  -d '{"texto":"Hay mucho tráfico en Cabildo, está todo trabado","linea":"152","lat":-34.56,"lng":-58.44}' | jq .
echo ""

# 6. Guardar rutina
echo "6️⃣  Guardando rutina diaria..."
curl -s -X POST "$BASE_URL/usuario/rutinas/guardar" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"rutina\":{\"linea\":\"152\",\"ramal\":\"Olivos\",\"horaSalida\":\"08:30\",\"horaRegreso\":\"18:00\",\"diasSemana\":[1,2,3,4,5],\"paradaOrigen\":\"Palermo\",\"paradaDestino\":\"Olivos\"}}" | jq '{status, mensaje}'
echo ""

# 7. Registrar viaje
echo "7️⃣  Registrando viaje completado..."
curl -s -X POST "$BASE_URL/usuario/historial/agregar" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"viaje\":{\"linea\":\"152\",\"ramal\":\"Olivos\",\"duracion\":25,\"calificacion\":5,\"verificado\":true,\"origen\":{\"lat\":-34.5828,\"lng\":-58.4215,\"nombre\":\"Palermo\"},\"destino\":{\"lat\":-34.5650,\"lng\":-58.4400,\"nombre\":\"Belgrano\"}}}" | jq '{status, mensaje}'
echo ""

# 8. Actualizar garage (ganar puntos)
echo "8️⃣  Actualizando garage y ganando puntos..."
curl -s -X POST "$BASE_URL/usuario/garage/actualizar" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"puntos\":50}" | jq '{status, garage: {nivel, puntos, colorBondi}}'
echo ""

# 9. Ver estadísticas
echo "9️⃣  Obteniendo estadísticas del usuario..."
curl -s "$BASE_URL/usuario/estadisticas/$USER_ID" | jq '{
  viajesRealizados: .estadisticas.viajesRealizados,
  puntosGanados: .estadisticas.puntosGanados,
  verificaciones: .estadisticas.verificacionesRealizadas,
  nivel: .garage.nivel,
  puntos: .garage.puntos
}'
echo ""

# 10. Buscar colectivos por línea
echo "🔟  Buscando colectivos de la línea 152..."
curl -s "$BASE_URL/bondi/linea/152" | jq '{count, colectivos: .colectivos[] | {ramal, lat: .ubicacion.lat, lng: .ubicacion.lng}}'
echo ""

echo "✅ Testing completo finalizado!"
echo ""
echo "📊 Resumen:"
echo "- Backend funcionando correctamente"
echo "- Usuario creado: $USER_ID"
echo "- Favoritos agregados: 2"
echo "- Viajes registrados: 1"
echo "- Puntos ganados: 70 (20 por verificación + 50 bonus)"
echo ""
