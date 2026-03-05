import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { useNavigate, BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { ThemeProvider as NextThemesProvider } from "next-themes"; 
import './i18n'; 
import App from './App'
import './index.css'

const GOOGLE_CLIENT_ID = "769929631616-3l8td61vmac7ckbo2imahoodvuu3vuln.apps.googleusercontent.com";

const AppProvider = () => {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate}>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <main className="text-foreground bg-background min-h-screen">
          <App />
        </main>
      </NextThemesProvider>
    </HeroUIProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
         <AppProvider />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)