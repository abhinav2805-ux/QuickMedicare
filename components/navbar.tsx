'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated by checking for token in localStorage
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Logo.png"
              alt="QuickMedicare Solutions logo"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/appointment" className="text-foreground hover:text-primary transition">
              Appointment
            </Link>
            <a href="#services" className="text-foreground hover:text-primary transition">
              Services
            </a>
            <a href="#doctors" className="text-foreground hover:text-primary transition">
              Doctors
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition">
              Contact
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="https://wa.me/919315769573" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80">
              <Phone className="w-4 h-4" />
              <span className="text-sm">WhatsApp</span>
            </a>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="text-destructive">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <a href="https://wa.me/919315769573" target="_blank" rel="noopener noreferrer" className="p-2 text-primary">
              <Phone className="w-5 h-5" />
            </a>
            <button onClick={toggleMenu} className="p-2 hover:bg-muted rounded-lg">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link href="/" className="block py-2 px-4 text-foreground hover:bg-muted">
              Home
            </Link>
            <Link href="/appointment" className="block py-2 px-4 text-foreground hover:bg-muted">
              Appointment
            </Link>
            <a href="#services" className="block py-2 px-4 text-foreground hover:bg-muted">
              Services
            </a>
            <a href="#doctors" className="block py-2 px-4 text-foreground hover:bg-muted">
              Doctors
            </a>
            <a href="#contact" className="block py-2 px-4 text-foreground hover:bg-muted">
              Contact
            </a>
            <div className="border-t border-border mt-2 pt-2 px-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full text-destructive">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
