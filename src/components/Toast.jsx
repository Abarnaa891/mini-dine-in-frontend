import { useEffect, useState, createContext, useContext } from 'react';
import '../styles/layout.css';

function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const close = () => { setVisible(false); setTimeout(onClose, 300); };

  return (
    <div className={`toast toast--${type} ${visible ? 'toast--in' : 'toast--out'}`}>
      <span className="toast-icon">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={close}>×</button>
    </div>
  );
}

export const ToastContext = createContext({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
  };

  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default Toast;