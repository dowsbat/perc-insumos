const ExcelJS = require('exceljs');                          // librería para generar archivos .xlsx
const Departamento = require('../models/Departamento');       // modelo de departamentos
const CentroProduccion = require('../models/CentroProduccion'); // modelo de centros
const ConsumoInsumo = require('../models/ConsumoInsumo');     // modelo de montos capturados

// GET /api/export/departamento/:id?periodo=AAAA-MM
// Genera y descarga el Excel oficial de UN departamento para un período
async function exportarDepartamento(req, res) {
  try {
    const { periodo } = req.query;                           // período pedido, ej. "2026-01"
    if (!periodo) return res.status(400).json({ mensaje: 'Falta el período (?periodo=AAAA-MM)' });

    // 1) Traemos el departamento con sus categorías y centros ya poblados
    const depto = await Departamento.findById(req.params.id)
      .populate('categorias', 'codigo nombre')               // para armar las columnas
      .populate('centros', 'codigo nombre orden subdivisiones'); // por si tiene centros propios
    if (!depto) return res.status(404).json({ mensaje: 'Departamento no encontrado' });

    // 2) Las columnas son las categorías del departamento, ordenadas por código numérico
    const categorias = [...depto.categorias].sort(
      (a, b) => Number(a.codigo) - Number(b.codigo)          // "24" antes que "30", etc.
    );
    if (!categorias.length) {
      return res.status(400).json({ mensaje: 'El departamento no tiene categorías asignadas' });
    }

    // 3) Los centros: si el depto tiene centros propios, esos; si no, todos
    let centros;
    if (depto.centros && depto.centros.length) {
      centros = [...depto.centros];                           // copia de los centros asignados
    } else {
      centros = await CentroProduccion.find();                // o todos los del catálogo
    }
    centros.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999)); // siempre en el orden oficial PERC

    // 4) Traemos todos los consumos de este depto+período de una sola vez
    const consumos = await ConsumoInsumo.find({ departamento: depto._id, periodo });
    // Los indexamos en un Map para buscarlos rápido por "centro|subdivision|categoria"
    const clave = (centroId, sub, catId) => `${centroId}|${sub || ''}|${catId}`; // misma llave que usa el front
    const montoDe = new Map();                                // Map con los montos capturados
    for (const c of consumos) {
      montoDe.set(clave(c.centro, c.subdivision, c.categoria), c.monto); // guardamos cada monto
    }

    // 5) Creamos el libro y la hoja de Excel
    const wb = new ExcelJS.Workbook();                        // libro nuevo
    const ws = wb.addWorksheet('Insumos');                    // una hoja llamada "Insumos"

    // --- Fila 1: vacía (así es el formato oficial) ---
    ws.addRow([]);                                            // fila 1 en blanco

    // --- Fila 2: encabezados ---
    // Primera celda "Centro de Producción", luego "codigo-nombre" de cada categoría
    const encabezado = ['Centro de Producción',              // columna A
      ...categorias.map(k => `${k.codigo}-${k.nombre}`)];    // columnas B, C, ...
    ws.addRow(encabezado);                                    // escribimos la fila 2

    // 6) Recorremos los centros escribiendo las filas de datos (a partir de la fila 3)
    let filaActual = 3;                                       // llevamos el número de fila manualmente
    for (const centro of centros) {
      const subs = centro.subdivisiones || [];                // subdivisiones del centro (puede estar vacío)

      if (subs.length > 0) {
        // --- Centro CON subdivisiones: fila padre con fórmula =SUM() ---
        const filaPadre = filaActual;                         // recordamos la fila del padre
        const primeraSub = filaActual + 1;                    // primera subdivisión va justo debajo
        const ultimaSub = filaActual + subs.length;           // última subdivisión

        // La fila del padre: nombre en A, y en cada categoría una fórmula que suma sus subdivisiones
        const fila = [`${centro.codigo}-${centro.nombre}`];   // celda A: "66-Hospitalizacion..."
        categorias.forEach((k, i) => {                        // por cada categoría (columna)
          const col = String.fromCharCode(66 + i);            // 66 = 'B'; i=0->B, i=1->C, ...
          fila.push({ formula: `SUM(${col}${primeraSub}:${col}${ultimaSub})` }); // ej. =SUM(B4:B9)
        });
        ws.addRow(fila);                                      // escribimos la fila del padre
        filaActual++;                                         // avanzamos una fila

        // Ahora escribimos cada subdivisión con su monto capturado
        for (const sub of subs) {
          const fila = [sub.nombre];                          // celda A: nombre de la subdivisión (sin código)
          for (const k of categorias) {                       // por cada categoría
            const m = montoDe.get(clave(centro._id, sub.nombre, k._id)) || 0; // buscamos el monto (0 si no hay)
            fila.push(m);                                     // lo agregamos a la fila
          }
          ws.addRow(fila);                                    // escribimos la subdivisión
          filaActual++;                                       // avanzamos
        }
      } else {
        // --- Centro SIN subdivisiones: valor directo ---
        const fila = [`${centro.codigo}-${centro.nombre}`];   // celda A: "97-Hospitalizacion ortopedia"
        for (const k of categorias) {                         // por cada categoría
          const m = montoDe.get(clave(centro._id, null, k._id)) || 0; // monto directo (subdivision = null)
          fila.push(m);                                       // lo agregamos
        }
        ws.addRow(fila);                                      // escribimos la fila
        filaActual++;                                         // avanzamos
      }
    }

    // 7) Un poco de formato: encabezado en negrita y ancho de columnas
    ws.getRow(2).font = { bold: true };                      // fila 2 (encabezados) en negrita
    ws.getColumn(1).width = 45;                              // columna A más ancha (nombres largos)
    for (let i = 0; i < categorias.length; i++) {
      ws.getColumn(i + 2).width = 18;                        // columnas de categorías con ancho fijo
    }

    // 8) Preparamos la descarga: nombre de archivo y cabeceras HTTP
    const nombreArchivo = `${depto.codigo}_${depto.nombre}_${periodo}.xlsx`  // ej. "APD-05_Farmacia_2026-01.xlsx"
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_');                   // limpiamos caracteres raros del nombre
    res.setHeader('Content-Type',                            // tipo de contenido: un Excel
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',                     // fuerza la descarga con ese nombre
      `attachment; filename="${nombreArchivo}"`);

    // 9) Escribimos el Excel directamente en la respuesta y cerramos
    await wb.xlsx.write(res);                                 // vuelca el archivo al navegador
    res.end();                                                // terminamos la respuesta
  } catch (error) {
    res.status(500).json({ mensaje: error.message });        // cualquier error, lo devolvemos legible
  }
}

module.exports = { exportarDepartamento };                   // exportamos la función