'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, LogOut, Menu, Mail, User, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState({ name: 'User', email: '', userId: '' })
  const [avatarSrc, setAvatarSrc] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (!response.ok) {
          setIsAuthenticated(false)
          return
        }

        const data = await response.json()
        if (data.success && data.data) {
          const profile = {
            name: data.data.name || 'User',
            email: data.data.email || '',
            userId: data.data.userId || '',
          }

          setUserData(profile)
          setIsAuthenticated(true)

          const storageKey = `avatar:${profile.email || profile.userId}`
          const savedAvatar = localStorage.getItem(storageKey)
          if (savedAvatar) {
            setAvatarSrc(savedAvatar)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('[v0] Navbar auth error:', error)
        setIsAuthenticated(false)
      }
    }

    loadProfile()
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const avatarStorageKey = `avatar:${userData.email || userData.userId}`

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('[v0] Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      setIsAuthenticated(false)
      setProfileOpen(false)
      router.push('/')
    }
  }

  const handleAvatarPick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setAvatarSrc(result)
        localStorage.setItem(avatarStorageKey, result)
      }
    }
    reader.readAsDataURL(file)
  }

  const userInitials = userData.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U'

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
                <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 pr-3 text-sm text-foreground transition hover:bg-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarSrc} alt={userData.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate">{userData.name}</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="left-auto right-4 top-1/2 h-[60vh] w-full max-w-[22rem] -translate-y-1/2 translate-x-0 rounded-2xl border-border bg-white p-6 shadow-2xl overflow-y-auto sm:max-w-[22rem]">
                    <DialogHeader>
                      <DialogTitle>Profile</DialogTitle>
                      <DialogDescription>
                        View your account details, change your avatar, or log out.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={avatarSrc} alt={userData.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-semibold text-foreground truncate">{userData.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{userData.email || 'No email available'}</p>
                        </div>
                      </div>

                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                      <div className="grid gap-3">
                        <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="text-sm text-foreground">{userData.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="truncate text-sm text-foreground">{userData.email || 'No email available'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={handleAvatarPick} variant="outline" className="flex-1">
                          <Camera className="mr-2 h-4 w-4" />
                          Change Avatar
                        </Button>
                        <Button onClick={handleLogout} variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  <Button onClick={() => setProfileOpen(true)} variant="outline" className="w-full justify-start gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={avatarSrc} alt={userData.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{userData.name}</span>
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
