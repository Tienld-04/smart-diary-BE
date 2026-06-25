import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3200,
            style: {
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
              color: '#2c2747',
              boxShadow: '0 18px 50px -18px rgba(33,26,79,0.4)',
              border: '1px solid rgba(33,26,79,0.06)',
              fontWeight: 500,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            },
            success: { iconTheme: { primary: '#6d5efc', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f1417f', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
