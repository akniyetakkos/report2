/**
 * Google Apps Script Web App API для листа сотрудников.
 *
 * Поддерживаемые действия:
 * - GET  ?action=list
 * - POST { action: "add", employee: {...} }
 * - POST { action: "update", id: 123, updates: {...} }
 * - POST { action: "delete", id: 123 }
 *
 * Формат Employee (как на фронте):
 * {
 *   id: number,
 *   name: string,
 *   email: string,
 *   phone: string,
 *   position: string,
 *   assignedLocations: number[]
 * }
 */

const SHEET_NAME = 'Employees' // переименуйте лист в таблице или поменяйте здесь

// Заголовки как на вашем скрине:
const COL_NAME = 'ФИО'
const COL_EMAIL = 'Email'
const COL_PHONE = 'Телефон'
const COL_POSITION = 'Должность'
const COL_LOCATIONS = 'Рабочие точки'

// Скрытая колонка для стабильного ID:
const COL_ID = '__id'

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list'
    if (action !== 'list') return json_({ error: 'Unsupported action (GET)' })
    return handleList_()
  } catch (err) {
    return json_({
      error: 'Server error (GET)',
      details: String(err),
    })
  }
}

function doPost(e) {
  try {
    let body = {}
    try {
      body = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    } catch (err) {
      return json_({ error: 'Invalid JSON body' })
    }

    const action = body.action
    if (!action) return json_({ error: 'Missing action' })

    if (action === 'add') return handleAdd_(body.employee || {})
    if (action === 'update') return handleUpdate_(body.id, body.updates || {})
    if (action === 'delete') return handleDelete_(body.id)

    return json_({ error: 'Unsupported action' })
  } catch (err) {
    return json_({
      error: 'Server error (POST)',
      details: String(err),
    })
  }
}

function handleList_() {
  const sheet = getSheet_()
  const map = ensureHeaders_(sheet)

  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return json_({ employees: [] })

  const values = sheet
    .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
    .getValues()

  const employees = values
    .map((row, idx) => rowToEmployee_(row, map, idx + 2))
    .filter(Boolean)

  return json_({ employees })
}

function handleAdd_(employee) {
  const sheet = getSheet_()
  const map = ensureHeaders_(sheet)

  const id = Number(employee.id) || Date.now()
  const row = employeeToRow_(employee, id, map)

  sheet.appendRow(row)

  return json_({
    employee: {
      id,
      name: String(employee.name || ''),
      email: String(employee.email || ''),
      phone: String(employee.phone || ''),
      position: String(employee.position || ''),
      assignedLocations: normalizeLocations_(employee.assignedLocations)
    }
  })
}

function handleUpdate_(id, updates) {
  const sheet = getSheet_()
  const map = ensureHeaders_(sheet)

  const numericId = Number(id)
  if (!numericId) return json_({ error: 'Invalid id' })

  const rowIndex = findRowById_(sheet, numericId, map)
  if (!rowIndex) return json_({ error: 'Employee not found' })

  const row = sheet
    .getRange(rowIndex, 1, 1, sheet.getLastColumn())
    .getValues()[0]

  const current = rowToEmployee_(row, map, rowIndex) || { id: numericId }
  const merged = Object.assign({}, current, updates || {})
  const newRow = employeeToRow_(merged, numericId, map)

  sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow])

  return json_({ employee: merged })
}

function handleDelete_(id) {
  const sheet = getSheet_()
  const map = ensureHeaders_(sheet)

  const numericId = Number(id)
  if (!numericId) return json_({ error: 'Invalid id' })

  const rowIndex = findRowById_(sheet, numericId, map)
  if (!rowIndex) return json_({ error: 'Employee not found' })

  sheet.deleteRow(rowIndex)
  return json_({ success: true })
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0]
  if (!sheet) throw new Error('Sheet not found')
  return sheet
}

function ensureHeaders_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 5)
  const headerRange = sheet.getRange(1, 1, 1, lastCol)
  const header = headerRange.getValues()[0].map(String)

  // Если лист пустой — создаём заголовки
  if (header.filter(Boolean).length === 0) {
    const newHeader = [COL_NAME, COL_EMAIL, COL_PHONE, COL_POSITION, COL_LOCATIONS, COL_ID]
    sheet.getRange(1, 1, 1, newHeader.length).setValues([newHeader])
    return headerMap_(newHeader)
  }

  // Обязательно добавляем колонку __id, если её нет
  if (header.indexOf(COL_ID) === -1) {
    const col = header.length + 1
    sheet.getRange(1, col).setValue(COL_ID)
    header.push(COL_ID)
  }

  return headerMap_(header)
}

function headerMap_(header) {
  const map = {}
  header.forEach((name, i) => {
    map[name] = i
  })
  return map
}

function rowToEmployee_(row, map, rowIndex) {
  const name = String(row[map[COL_NAME]] || '').trim()
  const email = String(row[map[COL_EMAIL]] || '').trim()
  const phone = String(row[map[COL_PHONE]] || '').trim()
  const position = String(row[map[COL_POSITION]] || '').trim()
  const locationsRaw = row[map[COL_LOCATIONS]]

  let id = Number(row[map[COL_ID]])
  if (!id) {
    // Если __id пустой — заполняем (стабильный ключ)
    id = Date.now() + rowIndex
    // Записываем обратно в таблицу
    const sheet = getSheet_()
    sheet.getRange(rowIndex, map[COL_ID] + 1).setValue(id)
  }

  return {
    id,
    name,
    email,
    phone,
    position,
    assignedLocations: parseLocations_(locationsRaw)
  }
}

function employeeToRow_(employee, id, map) {
  // row строим по порядку колонок в шапке
  const headerSize = Object.keys(map).length
  const row = new Array(headerSize).fill('')

  row[map[COL_NAME]] = String(employee.name || '')
  row[map[COL_EMAIL]] = String(employee.email || '')
  row[map[COL_PHONE]] = String(employee.phone || '')
  row[map[COL_POSITION]] = String(employee.position || '')
  row[map[COL_LOCATIONS]] = normalizeLocations_(employee.assignedLocations).join(',')
  row[map[COL_ID]] = Number(id)

  return row
}

function parseLocations_(value) {
  if (value === null || value === undefined) return []
  const s = String(value).trim()
  if (!s) return []
  return s
    .split(',')
    .map((x) => Number(String(x).trim()))
    .filter((n) => Number.isFinite(n))
}

function normalizeLocations_(value) {
  if (Array.isArray(value)) {
    return value.map((x) => Number(x)).filter((n) => Number.isFinite(n))
  }
  return parseLocations_(value)
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}


