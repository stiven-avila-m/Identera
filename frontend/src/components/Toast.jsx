import { useState, useEffect, useCallback, useRef } from 'react';
import { listeners } from './toastService';
import './Toast.css';

/**
 * Coloca <ToastContainer /> una sola vez en Layout.jsx
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef({});

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    timerMap.current[t.id] = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
      delete timerMap.current[t.id];
    }, t.duration);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  }, [addToast]);

  const dismiss = useCallback((id) => {
    clearTimeout(timerMap.current[id]);
    delete timerMap.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
