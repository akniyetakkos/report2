import express from 'express'
import cors from 'cors'

// URL твоего Google Apps Script Web App (тот самый /exec)
const SHEETS_URL =
  process.env.SHEETS_TARGET_URL ||
  'https://script.google.com/macros/s/AKfycbxfwE0OQsOtak-oost9pBFACRpfAMguh2w0DXRx8srjhNQgdr2zDgcaXxoLJXy9-Ct9/exec'

const PORT = process.env.PORT || 4000

const app = express()

// Разрешаем запросы с любого фронтенда (localhost, прод и т.д.)
app.use(
  cors({
    origin: true,
    credentials: false
  })
)

app.use(express.json())

async function forwardGet(action) {
  const url = `${SHEETS_URL}?action=${encodeURIComponent(action)}`
  const response = await fetch(url)
  const text = await response.text()
  return {
    status: response.status,
    body: text
  }
}

async function forwardPost(body) {
  const response = await fetch(SHEETS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body || {})
  })
  const text = await response.text()
  return {
    status: response.status,
    body: text
  }
}

// GET /api/google-sheets?action=list
app.get('/api/google-sheets', async (req, res) => {
  const action = req.query.action || 'list'

  try {
    const result = await forwardGet(action)
    res
      .status(result.status)
      .type('application/json')
      .send(result.body)
  } catch (err) {
    console.error('GET /api/google-sheets error:', err)
    res.status(500).json({
      error: 'Backend error forwarding request to Google Sheets',
      details: err.message || String(err)
    })
  }
})

// POST /api/google-sheets  body: { action, ... }
app.post('/api/google-sheets', async (req, res) => {
  try {
    const result = await forwardPost(req.body)
    res
      .status(result.status)
      .type('application/json')
      .send(result.body)
  } catch (err) {
    console.error('POST /api/google-sheets error:', err)
    res.status(500).json({
      error: 'Backend error forwarding request to Google Sheets',
      details: err.message || String(err)
    })
  }
})

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`)
})

