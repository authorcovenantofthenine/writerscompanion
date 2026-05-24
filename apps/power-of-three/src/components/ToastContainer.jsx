import React from 'react';
import Toast from './Toast.jsx';

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}