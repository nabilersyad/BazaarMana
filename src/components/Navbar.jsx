import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Map' },
    //{ to: '/submit', label: 'Submit a Bazaar' },
    //{ to: '/admin', label: 'Admin' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-forest text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          {/* <span className="text-gold text-xl">☽</span> - maybe add a moon icon later?*/}
          <img src="BazaarManaLogo.svg" alt="BazaarMana" className="h-10 w-10" />
          <span className="font-display font-bold text-lg leading-tight">BazaarMana</span>
        </Link>

        {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm font-medium transition-colors hover:text-gold ${
              pathname === link.to ? 'text-gold' : 'text-green-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
        
        <a href="https://github.com/nabilersyad"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-green-300 hover:text-gold transition-colors"
        >
          by nabilersyad
        </a>
        
        <a href="https://buymeacoffee.com/nabilersyad"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] bg-gold text-white font-semibold px-2 py-1 rounded-md hover:bg-yellow-600 transition-colors"
        >
          ☕ Buy me a coffee
        </a>
      </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-green-800 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1.5">
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 px-4 pb-4">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-green-800 last:border-0 hover:text-gold transition-colors ${
                pathname === link.to ? 'text-gold' : 'text-green-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}