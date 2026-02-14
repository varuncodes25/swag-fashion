import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';  // ✅ Import Toaster

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
      <Toaster  // ✅ Add Toaster here
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          },
          // Success toast
          success: {
            duration: 3000,
            icon: '✅',
            style: {
              background: '#10b981',
              borderLeft: '4px solid #064e3b',
            },
          },
          // Error toast
          error: {
            duration: 4000,
            icon: '❌',
            style: {
              background: '#ef4444',
              borderLeft: '4px solid #991b1b',
            },
          },
          // Loading toast
          loading: {
            icon: '⏳',
            style: {
              background: '#f59e0b',
              borderLeft: '4px solid #92400e',
            },
          },
        }}
      />
    </PersistGate>
  </Provider>
);