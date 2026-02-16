const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_USER_ID = 'test-user-miparada-001';
const TEST_USER_NAME = 'Juan Pérez';

// Test results storage
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) console.log(`   Details: ${details}`);
  
  testResults.tests.push({
    name: testName,
    passed,
    details
  });
  
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Helper function to make HTTP requests with error handling
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: error.response?.status,
      data: error.response?.data 
    };
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n=== 1. HEALTH CHECK ===');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    const { status, mongodb, features } = result.data;
    
    logTest('Health endpoint responds', status === 'ok');
    logTest('MongoDB connection', mongodb === 'connected');
    logTest('Features available', features && features.colectivos && features.usuarios && features.geminiAI);
  } else {
    logTest('Health endpoint responds', false, result.error);
  }
}

// Test 2: Colectivos APIs
async function testColectivosAPIs() {
  console.log('\n=== 2. COLECTIVOS APIs ===');
  
  // Test 2.1: Ping GPS
  const pingData = {
    linea: "152",
    ramal: "Olivos",
    lat: -34.5828,
    lng: -58.4215,
    velocidad: 35,
    rumbo: 320
  };
  
  const pingResult = await makeRequest('POST', '/bondi/ping', pingData);
  logTest('Ping GPS endpoint', pingResult.success && pingResult.data.status === 'ok');
  
  // Test 2.2: Get active colectivos
  const activosResult = await makeRequest('GET', '/bondi/activos');
  logTest('Get active colectivos', activosResult.success && activosResult.data.status === 'ok');
  
  if (activosResult.success) {
    logTest('Active colectivos count >= 1', activosResult.data.count >= 1, `Found ${activosResult.data.count} active colectivos`);
  }
  
  // Test 2.3: Search by line
  const lineaResult = await makeRequest('GET', '/bondi/linea/152');
  logTest('Search by line 152', lineaResult.success && lineaResult.data.status === 'ok');
  
  // Test 2.4: Report incident with AI
  const reportData = {
    texto: "Hay un accidente grave en Cabildo y Juramento",
    linea: "152",
    lat: -34.56,
    lng: -58.44
  };
  
  const reportResult = await makeRequest('POST', '/bondi/reportar', reportData);
  logTest('Report incident with AI', reportResult.success && reportResult.data.status === 'ok');
  
  if (reportResult.success && reportResult.data.analisis) {
    const { categoria, gravedad, es_peligroso } = reportResult.data.analisis;
    logTest('AI analysis has category', !!categoria, `Category: ${categoria}`);
    logTest('AI analysis has severity', typeof gravedad === 'number', `Severity: ${gravedad}`);
    logTest('AI analysis has danger flag', typeof es_peligroso === 'boolean', `Dangerous: ${es_peligroso}`);
  }
  
  // Test 2.5: Get reports for line
  const reportesResult = await makeRequest('GET', '/bondi/reportes/152');
  logTest('Get reports for line 152', reportesResult.success && reportesResult.data.status === 'ok');
}

// Test 3: Usuario APIs
async function testUsuarioAPIs() {
  console.log('\n=== 3. USUARIO APIs ===');
  
  // Test 3.1: Create/Get user profile
  const perfilData = {
    userId: TEST_USER_ID,
    nombre: TEST_USER_NAME,
    modo: "COMMUNITY"
  };
  
  const perfilResult = await makeRequest('POST', '/usuario/perfil', perfilData);
  logTest('Create user profile', perfilResult.success && perfilResult.data.status === 'ok');
  
  // Test 3.2: Add favorite
  const favoritoData = {
    userId: TEST_USER_ID,
    linea: "152",
    ramal: "Olivos"
  };
  
  const favoritoResult = await makeRequest('POST', '/usuario/favoritos/agregar', favoritoData);
  logTest('Add favorite line', favoritoResult.success && favoritoResult.data.status === 'ok');
  
  // Test 3.3: Save routine
  const rutinaData = {
    userId: TEST_USER_ID,
    rutina: {
      linea: "152",
      horaSalida: "08:30",
      horaRegreso: "18:00",
      diasSemana: [1, 2, 3, 4, 5]
    }
  };
  
  const rutinaResult = await makeRequest('POST', '/usuario/rutinas/guardar', rutinaData);
  logTest('Save routine', rutinaResult.success && rutinaResult.data.status === 'ok');
  
  // Test 3.4: Register trip
  const viajeData = {
    userId: TEST_USER_ID,
    viaje: {
      linea: "152",
      duracion: 25,
      calificacion: 5,
      verificado: true
    }
  };
  
  const viajeResult = await makeRequest('POST', '/usuario/historial/agregar', viajeData);
  logTest('Register trip', viajeResult.success && viajeResult.data.status === 'ok');
  
  // Test 3.5: Update garage (points)
  const garageData = {
    userId: TEST_USER_ID,
    puntos: 50
  };
  
  const garageResult = await makeRequest('POST', '/usuario/garage/actualizar', garageData);
  logTest('Update garage points', garageResult.success && garageResult.data.status === 'ok');
  
  if (garageResult.success && garageResult.data.garage) {
    const { nivel, puntos } = garageResult.data.garage;
    logTest('Points updated correctly', puntos >= 50, `Points: ${puntos}`);
    logTest('Level calculation works', nivel >= 1, `Level: ${nivel}`);
  }
  
  // Test 3.6: Get statistics
  const statsResult = await makeRequest('GET', `/usuario/estadisticas/${TEST_USER_ID}`);
  logTest('Get user statistics', statsResult.success && statsResult.data.status === 'ok');
}

// Test 4: Reportes Comunitarios APIs
async function testReportesComunitariosAPIs() {
  console.log('\n=== 4. REPORTES COMUNITARIOS APIs ===');
  
  // Test 4.1: Create community report
  const reporteData = {
    userId: TEST_USER_ID,
    tipo: "lleno",
    linea: "152",
    lat: -34.58,
    lng: -58.42,
    comentario: "Muy lleno, no hay lugar para subir"
  };
  
  const crearResult = await makeRequest('POST', '/reportes/crear', reporteData);
  logTest('Create community report', crearResult.success && crearResult.data.status === 'ok');
  
  let reporteId = null;
  if (crearResult.success && crearResult.data.reporte) {
    reporteId = crearResult.data.reporte._id;
    logTest('Report has ID', !!reporteId, `ID: ${reporteId}`);
  }
  
  // Test 4.2: Validate report (if we have an ID)
  if (reporteId) {
    const validarData = {
      reporteId: reporteId,
      userId: 'test-user-002',
      tipo: "yo_tambien"
    };
    
    const validarResult = await makeRequest('POST', '/reportes/validar', validarData);
    logTest('Validate report (yo también)', validarResult.success && validarResult.data.status === 'ok');
    
    if (validarResult.success && validarResult.data.contadores) {
      logTest('Validation counter incremented', validarResult.data.contadores.yoTambien >= 1);
    }
  }
  
  // Test 4.3: Get nearby reports (geospatial)
  const cercanosResult = await makeRequest('GET', '/reportes/cercanos?lat=-34.58&lng=-58.42&radio=5000');
  logTest('Get nearby reports (geospatial)', cercanosResult.success && cercanosResult.data.status === 'ok');
  
  // Test 4.4: Get reports by line
  const lineaReportesResult = await makeRequest('GET', '/reportes/linea/152');
  logTest('Get reports by line', lineaReportesResult.success && lineaReportesResult.data.status === 'ok');
}

// Test 5: Edge Cases and Error Handling
async function testEdgeCases() {
  console.log('\n=== 5. EDGE CASES & ERROR HANDLING ===');
  
  // Test invalid data
  const invalidPing = await makeRequest('POST', '/bondi/ping', { linea: "" });
  logTest('Invalid ping data rejected', !invalidPing.success || invalidPing.status === 400);
  
  const invalidReport = await makeRequest('POST', '/reportes/crear', { userId: "", tipo: "lleno" });
  logTest('Invalid report data rejected', !invalidReport.success || invalidReport.status === 400);
  
  // Test non-existent resources
  const nonExistentUser = await makeRequest('GET', '/usuario/estadisticas/non-existent-user');
  logTest('Non-existent user handled', !nonExistentUser.success || nonExistentUser.status === 404);
  
  // Test duplicate favorite
  const duplicateFav = await makeRequest('POST', '/usuario/favoritos/agregar', {
    userId: TEST_USER_ID,
    linea: "152",
    ramal: "Olivos"
  });
  logTest('Duplicate favorite handled gracefully', duplicateFav.success);
}

// Test 6: Performance and Load
async function testPerformance() {
  console.log('\n=== 6. PERFORMANCE TESTS ===');
  
  // Test multiple simultaneous pings
  const pingPromises = [];
  for (let i = 0; i < 5; i++) {
    pingPromises.push(makeRequest('POST', '/bondi/ping', {
      linea: `15${i}`,
      ramal: "Test",
      lat: -34.58 + (i * 0.01),
      lng: -58.42 + (i * 0.01),
      velocidad: 30 + i,
      rumbo: 45 * i
    }));
  }
  
  const startTime = Date.now();
  const pingResults = await Promise.all(pingPromises);
  const endTime = Date.now();
  
  const successfulPings = pingResults.filter(r => r.success).length;
  logTest('Multiple simultaneous pings', successfulPings >= 4, `${successfulPings}/5 successful in ${endTime - startTime}ms`);
  
  // Test rapid report creation
  const reportPromises = [];
  for (let i = 0; i < 3; i++) {
    reportPromises.push(makeRequest('POST', '/reportes/crear', {
      userId: `test-user-perf-${i}`,
      tipo: "demora",
      linea: "152",
      lat: -34.58 + (i * 0.001),
      lng: -58.42 + (i * 0.001),
      comentario: `Test report ${i}`
    }));
  }
  
  const reportResults = await Promise.all(reportPromises);
  const successfulReports = reportResults.filter(r => r.success).length;
  logTest('Rapid report creation', successfulReports >= 2, `${successfulReports}/3 successful`);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS EXHAUSTIVAS DEL BACKEND MI PARADA');
  console.log('=' .repeat(60));
  
  try {
    await testHealthCheck();
    await testColectivosAPIs();
    await testUsuarioAPIs();
    await testReportesComunitariosAPIs();
    await testEdgeCases();
    await testPerformance();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(60));
    console.log(`✅ Pruebas exitosas: ${testResults.passed}`);
    console.log(`❌ Pruebas fallidas: ${testResults.failed}`);
    console.log(`📈 Tasa de éxito: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      testResults.tests.filter(t => !t.passed).forEach(test => {
        console.log(`   - ${test.name}: ${test.details || 'Sin detalles'}`);
      });
    }
    
    console.log('\n🎯 PRUEBAS COMPLETADAS');
    
  } catch (error) {
    console.error('💥 Error ejecutando pruebas:', error.message);
    process.exit(1);
  }
}

// Check if axios is available, if not, provide instructions
async function checkDependencies() {
  try {
    require('axios');
    return true;
  } catch (error) {
    console.log('📦 Instalando dependencias necesarias...');
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec('cd /app/server && npm install axios', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error instalando axios:', error.message);
          reject(error);
        } else {
          console.log('✅ Axios instalado correctamente');
          resolve(true);
        }
      });
    });
  }
}

// Run tests
if (require.main === module) {
  checkDependencies()
    .then(() => runAllTests())
    .catch(error => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { runAllTests, testResults };