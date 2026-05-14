// Campus360 Hub — Web App para Asesores Externos
// Deploy: Publish → Deploy as web app → Execute as "me" → Who has access: "Anyone"
// Compártelo solo con asesores externos los días que se requiera su ayuda.

var PASSWORD = 'asesores2026';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Campus360 — Asesores Externos')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function verificarPassword(password) {
  return password === PASSWORD;
}

function getTurnos(password) {
  if (password !== PASSWORD) {
    return { error: true, message: 'Contraseña incorrecta' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var asesoresExternos = [];
  try {
    var asesoresData = ss.getSheetByName('ASESORES').getRange('B2:B').getValues();
    for (var i = 0; i < asesoresData.length; i++) {
      var name = (asesoresData[i][0] || '').toString().trim();
      if (name !== '') {
        asesoresExternos.push(name.toLowerCase());
      }
    }
  } catch (e) {
    asesoresExternos = [];
  }

  if (asesoresExternos.length === 0) {
    return {
      error: false,
      count: 0,
      message: 'No hay asesores externos registrados en la hoja ASESORES (columna B).',
      lastUpdated: new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
      rows: [],
    };
  }

  var turnosSheet = ss.getSheetByName('TURNOS_ASESORIA');
  var lastRow = turnosSheet.getLastRow();
  if (lastRow <= 1) {
    return {
      error: false,
      count: 0,
      message: 'No hay turnos registrados.',
      lastUpdated: new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
      rows: [],
    };
  }

  var allData = turnosSheet.getRange(2, 1, lastRow - 1, 13).getValues();

  var filtered = [];
  for (var r = 0; r < allData.length; r++) {
    var asesorName = (allData[r][12] || '').toString().trim().toLowerCase();
    if (asesorName !== '' && asesoresExternos.indexOf(asesorName) >= 0) {
      filtered.push([
        allData[r][0],   // Turno
        allData[r][1],   // Fecha
        allData[r][2],   // Nombres
        allData[r][3],   // Cédula
        allData[r][4],   // Correo
        allData[r][5],   // País
        allData[r][6],   // Prefijo
        allData[r][7],   // Teléfono
        allData[r][8],   // Modalidad
        allData[r][9],   // Servicio
        allData[r][10],  // Detalle
        allData[r][11],  // Origen
        allData[r][12],  // Asesor
      ]);
    }
  }

  return {
    error: false,
    count: filtered.length,
    headers: [
      'Turno', 'Fecha', 'Nombres', 'Cédula', 'Correo',
      'País', 'Prefijo', 'Teléfono', 'Modalidad', 'Servicio',
      'Detalle', 'Origen', 'Asesor',
    ],
    rows: filtered,
    lastUpdated: new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
  };
}
