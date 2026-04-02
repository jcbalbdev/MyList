import React from 'react';
import { SENTIMENTS } from '../config/constants.js';

/**
 * Select de sentimiento editable, visualmente idéntico al SentimentChip.
 * @param {string} value - Clave del sentimiento actual (ej: 'LIKED')
 * @param {function} onChange - Callback cuando el usuario cambia el valor
 * @param {object} style - Estilos base compartidos con el chip
 */
export default function SentimentSelect({ value, onChange, style }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    >
      {Object.entries(SENTIMENTS).map(([key, sentiment]) => (
        <option key={key} value={key}>{sentiment.label}</option>
      ))}
    </select>
  );
}
