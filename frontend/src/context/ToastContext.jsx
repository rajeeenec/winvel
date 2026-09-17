import { createContext, useContext, useState, useCallback } from 'react';
import './ToastContext.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, description, type = 'success', actionText, onAction, duration = 4000, image }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, description, type, actionText, onAction, duration, image };

    setToasts((prev) => [...prev.slice(-4), newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title, description, actionText, onAction) =>
      addToast({ title, description, type: 'success', actionText, onAction }),
    error: (title, description) =>
      addToast({ title, description, type: 'error' }),
    warning: (title, description) =>
      addToast({ title, description, type: 'warning' }),
    info: (title, description) =>
      addToast({ title, description, type: 'info' }),
    cart: (productName, details, onViewCart, image) =>
      addToast({
        title: 'Added to Shopping Bag!',
        description: `${productName} ${details ? `(${details})` : ''}`,
        type: 'cart',
        actionText: 'VIEW BAG →',
        onAction: onViewCart,
        image,
      }),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            <div className="toast-left">
              {t.image ? (
                <img src={t.image} alt="Product" className="toast-img" />
              ) : (
                <div className="toast-icon">
                  {t.type === 'cart' && '🛒'}
                  {t.type === 'success' && '✓'}
                  {t.type === 'error' && '✕'}
                  {t.type === 'warning' && '⚠️'}
                  {t.type === 'info' && 'ℹ️'}
                </div>
              )}
              <div className="toast-content">
                <div className="toast-title">{t.title}</div>
                {t.description && <div className="toast-desc">{t.description}</div>}
              </div>
            </div>

            <div className="toast-right">
              {t.actionText && (
                <button
                  type="button"
                  className="toast-action-btn"
                  onClick={() => {
                    if (t.onAction) t.onAction();
                    removeToast(t.id);
                  }}
                >
                  {t.actionText}
                </button>
              )}
              <button
                type="button"
                className="toast-close-btn"
                onClick={() => removeToast(t.id)}
              >
                ✕
              </button>
            </div>
            {t.duration > 0 && (
              <div className="toast-progress" style={{ animationDuration: `${t.duration}ms` }} />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: (title, desc) => console.log(title, desc),
        error: (title, desc) => console.error(title, desc),
        warning: (title, desc) => console.warn(title, desc),
        info: (title, desc) => console.log(title, desc),
        cart: (name, details) => console.log('Cart:', name, details),
      },
    };
  }
  return context;
}
