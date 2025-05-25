import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import './index.css'
import { DBProvider } from './context/DBContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DBProvider>
      <App />
    </DBProvider>
  </StrictMode>
)
