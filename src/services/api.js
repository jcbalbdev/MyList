import { USERS } from '../config/constants.js';

// URL del backend (Google Apps Script) — leída desde variable de entorno
// Nunca escribir la URL directamente aquí
const SCRIPT_URL = import.meta.env.PUBLIC_SCRIPT_URL;

/** Convierte una fila de la Sheet al formato interno del app */
function rowToItem(row) {
  return {
    id: String(row.id),
    title: row.title,
    category: row.category,
    createdBy: row.createdBy,
    sentiments: {
      [USERS.USER_A]: row[`sentiment${USERS.USER_A}`] || 'PENDING',
      [USERS.USER_B]: row[`sentiment${USERS.USER_B}`] || 'PENDING'
    }
  };
}

/** GET — obtiene todos los títulos */
export async function fetchItems() {
  const res = await fetch(`${SCRIPT_URL}?method=GET`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.map(rowToItem);
}

/** POST — agrega un nuevo título */
export async function addItem(item) {
  const payload = {
    id: item.id,
    title: item.title,
    category: item.category,
    createdBy: item.createdBy,
    [`sentiment${USERS.USER_A}`]: item.sentiments[USERS.USER_A] || 'PENDING',
    [`sentiment${USERS.USER_B}`]: item.sentiments[USERS.USER_B] || 'PENDING'
  };
  const res = await fetch(`${SCRIPT_URL}?method=POST`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** PATCH — actualiza el sentimiento de un usuario para un título */
export async function updateSentiment(id, user, sentiment) {
  const res = await fetch(`${SCRIPT_URL}?method=PATCH`, {
    method: 'POST',
    body: JSON.stringify({ id, user, sentiment })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** DELETE — elimina un título por id */
export async function deleteItem(id) {
  const res = await fetch(`${SCRIPT_URL}?method=DELETE`, {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
