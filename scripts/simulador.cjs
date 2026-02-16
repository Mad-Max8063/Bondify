const axios = require('axios');

// Configuración de múltiples líneas de colectivos
const lineas = [
  { 
    numero: "152", 
    ramal: "Olivos",
    lat: -34.5828, // Plaza Italia
    lng: -58.4215,
    rumbo: 320,
    deltaLat: -0.0001,
    deltaLng: -0.0001
  },
  { 
    numero: "60", 
    ramal: "Tigre",
    lat: -34.5650, // Belgrano
    lng: -58.4400,
    rumbo: 310,
    deltaLat: -0.00015,
    deltaLng: -0.00012
  },
  { 
    numero: "152", 
    ramal: "Centro",
    lat: -34.6037, // Obelisco
    lng: -58.3816,
    rumbo: 45,
    deltaLat: 0.0001,
    deltaLng: 0.0001
  }
];

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

console.log('🚌 Iniciando simulador de colectivos MI PARADA...');
console.log(`📡 Backend: ${BACKEND_URL}`);
console.log(`🚍 Líneas a simular: ${lineas.map(l => `${l.numero} (${l.ramal})`).join(', ')}\n`);

// Simular cada línea independientemente
lineas.forEach((colectivo, index) => {
  setTimeout(() => {
    console.log(`🚌 Línea ${colectivo.numero} (${colectivo.ramal}) iniciada`);
    
    setInterval(async () => {
      // Simular movimiento
      colectivo.lat += colectivo.deltaLat;
      colectivo.lng += colectivo.deltaLng;
      
      // Velocidad aleatoria entre 10 y 50 km/h
      const velocidad = Math.floor(Math.random() * 40) + 10;
      
      // Pequeña variación en el rumbo
      colectivo.rumbo += (Math.random() - 0.5) * 5;

      try {
        // Enviar ping al backend
        const response = await axios.post(`${BACKEND_URL}/api/bondi/ping`, {
          linea: colectivo.numero,
          ramal: colectivo.ramal,
          lat: colectivo.lat,
          lng: colectivo.lng,
          velocidad,
          rumbo: Math.round(colectivo.rumbo)
        }, {
          timeout: 5000
        });
        
        console.log(`📡 ${colectivo.numero} (${colectivo.ramal}): [${colectivo.lat.toFixed(4)}, ${colectivo.lng.toFixed(4)}] @ ${velocidad}km/h`);
      } catch (err) {
        if (err.code === 'ECONNREFUSED') {
          console.error(`❌ Backend no disponible en ${BACKEND_URL}`);
        } else {
          console.error(`❌ Error: ${err.message}`);
        }
      }
    }, 3000 + index * 1000); // Cada línea envía con diferente offset
  }, index * 500); // Delay inicial para cada línea
});

// Manejador de cierre graceful
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo simulador...');
  process.exit(0);
});