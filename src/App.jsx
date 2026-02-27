import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import BazaarDetail from './pages/BazaarDetail.jsx'
import SubmitBazaar from './pages/SubmitBazaar.jsx'
import Admin from './pages/Admin.jsx'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Analytics />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bazaar/:id" element={<BazaarDetail />} />
        <Route path="/submit" element={<SubmitBazaar />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}