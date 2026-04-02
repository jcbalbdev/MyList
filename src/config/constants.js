export const USERS = {
  USER_A: 'José',
  USER_B: 'Diana'
};

export const CATEGORIES = {
  PELIS:      { id: 'pelis',      label: 'Pelis',      color: 'var(--color-pelis)' },
  SERIES:     { id: 'series',     label: 'Series',     color: 'var(--color-series)' },
  ANIME:      { id: 'anime',      label: 'Anime',      color: 'var(--color-anime)' },
  PELIS_ANIME:{ id: 'pelis-anime',label: 'Pelis Anime',color: 'var(--color-pelis-anime)' }
};

export const SENTIMENTS = {
  PENDING:    { id: 'pending',    label: '⏳ Te falta mirarlo' },
  WATCHING:   { id: 'watching',   label: '👀 Estoy viendo' },
  FASCINATED: { id: 'fascinated', label: '😍 Me fascinó' },
  LIKED:      { id: 'liked',      label: '👍 Me gustó' },
  AVERAGE:    { id: 'average',    label: '😐 Para pasar el rato' },
  DISLIKED:   { id: 'disliked',   label: '👎 No me gustó' }
};

// Claves de almacenamiento local — fuente única de verdad
export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  ITEMS_CACHE:  'myListItems_cache'
};
