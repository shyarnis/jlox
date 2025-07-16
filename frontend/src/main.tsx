import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoxEditor from './LoxEditor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoxEditor />
  </StrictMode>,
)
