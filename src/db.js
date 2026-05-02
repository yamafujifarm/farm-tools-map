const DB_NAME = 'farm-tools-db'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('tools')) {
        db.createObjectStore('tools', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('records')) {
        db.createObjectStore('records', { keyPath: 'toolId' })
      }
    }
  })
}

function tx(db, stores, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(stores, mode)
    t.onerror = () => reject(t.error)
    const req = fn(t)
    if (req) {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    } else {
      t.oncomplete = () => resolve()
    }
  })
}

export async function getTools() {
  const db = await openDB()
  const result = await tx(db, 'tools', 'readonly', (t) => t.objectStore('tools').getAll())
  return result.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
}

export async function getTool(id) {
  const db = await openDB()
  return tx(db, 'tools', 'readonly', (t) => t.objectStore('tools').get(id))
}

export async function addTool(name) {
  const db = await openDB()
  const tool = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() }
  await tx(db, 'tools', 'readwrite', (t) => t.objectStore('tools').add(tool))
  return tool
}

export async function deleteTool(id) {
  const db = await openDB()
  const t = db.transaction(['tools', 'records'], 'readwrite')
  t.objectStore('tools').delete(id)
  t.objectStore('records').delete(id)
  return new Promise((resolve, reject) => {
    t.oncomplete = resolve
    t.onerror = () => reject(t.error)
  })
}

export async function getRecord(toolId) {
  const db = await openDB()
  return tx(db, 'records', 'readonly', (t) => t.objectStore('records').get(toolId))
}

export async function getAllRecords() {
  const db = await openDB()
  return tx(db, 'records', 'readonly', (t) => t.objectStore('records').getAll())
}

export async function saveRecord(toolId, photoDataUrl) {
  const db = await openDB()
  const record = { toolId, photo: photoDataUrl, updatedAt: new Date().toISOString() }
  await tx(db, 'records', 'readwrite', (t) => t.objectStore('records').put(record))
  return record
}
