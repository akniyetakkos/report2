// Сервис для работы с Google Sheets через Google Apps Script (Web App)
// Для работы нужен Apps Script, который возвращает JSON (list/add/update/delete).

export const SHEETS_TARGET_URL =
  'https://script.google.com/macros/s/AKfycbxfwE0OQsOtak-oost9pBFACRpfAMguh2w0DXRx8srjhNQgdr2zDgcaXxoLJXy9-Ct9/exec'

const DEFAULT_SHEETS_API_URL = '/api/google-sheets'

// Позволяем переопределять URL через env (Vite / Quasar Vite)
const SHEETS_API_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SHEETS_API_URL) ||
  DEFAULT_SHEETS_API_URL

function isHtmlResponse(text) {
  const t = (text || '').trim().toLowerCase()
  return t.startsWith('<!doctype html') || t.includes('<html') || t.includes('google') && t.includes('sign in')
}

async function callSheetsApi(action, payload = {}) {
  if (!SHEETS_API_URL) {
    throw new Error('Google Sheets API URL не настроен')
  }

  const isGet = action === 'list'

  const url = isGet
    ? `${SHEETS_API_URL}?action=${encodeURIComponent(action)}`
    : SHEETS_API_URL

  const options = isGet
    ? { method: 'GET' }
    : {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, ...payload })
      }

  let response
  try {
    response = await fetch(url, options)
  } catch (e) {
    const errorMsg = e.message || String(e)
    // CORS ошибка обычно выглядит как "Failed to fetch" или "NetworkError"
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('CORS')) {
      throw new Error(
        'CORS ошибка: Google Apps Script не разрешает запросы с этого домена. ' +
        'Убедитесь, что скрипт опубликован как Web App с доступом "Anyone" (не "Only myself"). ' +
        'Также проверьте, что используете URL с /exec (не /dev).'
      )
    }
    throw new Error(`Не удалось обратиться к Google Sheets API: ${errorMsg}`)
  }

  // Проверяем редиректы (302 обычно означает редирект на страницу логина)
  if (response.status === 302 || response.redirected) {
    throw new Error(
      'Apps Script редиректит на страницу логина. ' +
      'Перепубликуйте скрипт как Web App с доступом "Anyone" (не "Only myself"). ' +
      'Также убедитесь, что используете URL с /exec (не /dev).'
    )
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Ошибка Google Sheets: ${response.status} ${text}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const rawText = contentType.includes('application/json')
    ? null
    : await response.text()

  if (rawText && isHtmlResponse(rawText)) {
    throw new Error(
      'Apps Script возвращает HTML (похоже, требует вход в Google или не опубликован как Web App для Everyone). Перепубликуйте скрипт и проверьте доступ.'
    )
  }

  let data
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      throw new Error(
        'Ответ от Google Sheets не является корректным JSON. ' +
          'Открой URL Apps Script в браузере и убедись, что он возвращает JSON, а не HTML.'
      )
    }
  } else {
    data = await response.json()
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data
}

export async function fetchEmployeesFromSheet() {
  const data = await callSheetsApi('list')
  // Ожидаемый формат ответа: { employees: [...] }
  return data.employees || []
}

export async function addEmployeeToSheet(employee) {
  const data = await callSheetsApi('add', { employee })
  // Ожидаемый формат ответа: { employee: {...} }
  return data.employee || employee
}

export async function updateEmployeeInSheet(id, updates) {
  const data = await callSheetsApi('update', { id, updates })
  // Ожидаемый формат ответа: { employee: {...} }
  return data.employee || { id, ...updates }
}

export async function deleteEmployeeFromSheet(id) {
  await callSheetsApi('delete', { id })
  return true
}

export default {
  fetchEmployeesFromSheet,
  addEmployeeToSheet,
  updateEmployeeInSheet,
  deleteEmployeeFromSheet
}


