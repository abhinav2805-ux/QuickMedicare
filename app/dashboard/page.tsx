'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface Appointment {
  _id: string
  doctorName: string
  specialization: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [userData, setUserData] = useState({ name: 'User', email: '' })
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: '',
    specialization: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    const controller = new AbortController()

    const fetchWithRetry = async (url: string, attempts = 2) => {
      let lastError: unknown

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await fetch(url, {
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          })
        } catch (error) {
          if (controller.signal.aborted) {
            throw error
          }

          lastError = error
          if (attempt < attempts) {
            await new Promise(resolve => setTimeout(resolve, 250))
          }
        }
      }

      throw lastError
    }

    const checkAuth = async () => {
      try {
        setDashboardError('')
        // Check if user is authenticated
        const response = await fetchWithRetry('/api/auth/verify')
        if (!response.ok) {
          router.push('/auth/login')
          return
        }

        const data = await response.json()
        if (data.success && data.data) {
          setUserData({
            name: data.data.name || 'User',
            email: data.data.email || '',
          })
        }

        // Fetch appointments
        const appointmentsRes = await fetchWithRetry('/api/appointments')
        const appointmentsData = await appointmentsRes.json()
        if (appointmentsData.success) {
          setAppointments(
            (appointmentsData.data || []).map((appointment: Appointment) => ({
              ...appointment,
              _id: String(appointment._id),
            }))
          )
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('[v0] Dashboard error:', error)
        setDashboardError('Unable to load dashboard data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    return () => {
      controller.abort()
    }
  }, [router])

  const specializationOptions = [
    'Cardiology',
    'General Medicine',
    'Emergency Medicine',
    'Orthopedics',
    'Pediatrics',
    'Neurology',
    'Psychiatry',
    'Dermatology',
  ]

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setAppointmentForm({
      doctorName: appointment.doctorName,
      specialization: appointment.specialization,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      reason: appointment.reason,
      notes: appointment.notes || '',
    })
    setFormError('')
    setIsRescheduleOpen(true)
  }

  const handleAppointmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setAppointmentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAppointmentSelectChange = (name: string, value: string) => {
    setAppointmentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAppointment) {
      return
    }

    setFormError('')
    setActionLoadingId(selectedAppointment._id)

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentForm),
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || data.message || 'Failed to update appointment')
        return
      }

      setAppointments(prev =>
        prev.map(appointment =>
          appointment._id === selectedAppointment._id
            ? { ...appointment, ...appointmentForm }
            : appointment
        )
      )
      setIsRescheduleOpen(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('[v0] Reschedule error:', error)
      setFormError('An error occurred while updating the appointment.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    const confirmed = window.confirm('Cancel this appointment?')
    if (!confirmed) {
      return
    }

    setActionLoadingId(appointmentId)

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || data.message || 'Failed to cancel appointment')
        return
      }

      setAppointments(prev => prev.filter(appointment => appointment._id !== appointmentId))
      if (selectedAppointment?._id === appointmentId) {
        setIsRescheduleOpen(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      console.error('[v0] Cancel appointment error:', error)
      alert('An error occurred while cancelling the appointment.')
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {dashboardError && (
            <Card className="mb-6 border-red-200 bg-red-50 p-4 text-red-700">
              <p>{dashboardError}</p>
            </Card>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-start mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Welcome back, {userData.name}!</p>
            </div>
            <Link href="/appointment">
              <Button variant="outline" className="border-primary text-blue-800 hover:bg-primary hover:text-blue-300  ">
                <Plus className="w-4 h-4 mr-2" />
                Add New Appointment
              </Button>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="p-6 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Appointments</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{appointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary/30" />
              </div>
            </Card>

            <Card className="p-6 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Confirmed</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500/30" />
              </div>
            </Card>

            <Card className="p-6 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {appointments.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500/30" />
              </div>
            </Card>

            <Card className="p-6 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {appointments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500/30" />
              </div>
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Link href="/appointment">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Book New Appointment
              </Button>
            </Link>
          </motion.div>

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Appointments</h2>

            {appointments.length === 0 ? (
              <Card className="p-12 text-center border-border">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No appointments yet</p>
                <Link href="/appointment">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Book Your First Appointment
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment, idx) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <Card className="p-6 border-border hover:border-primary hover:shadow-lg transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">Dr. {appointment.doctorName}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{appointment.specialization}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">{appointment.appointmentDate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Time</p>
                              <p className="font-medium text-foreground">{appointment.appointmentTime}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-muted-foreground text-sm">Reason for visit</p>
                            <p className="text-foreground">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            variant="outline"
                            className="flex-1 md:flex-none border-border"
                            onClick={() => openRescheduleDialog(appointment)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 md:flex-none border-border text-destructive"
                            onClick={() => handleCancelAppointment(appointment._id)}
                            disabled={actionLoadingId === appointment._id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <Dialog
            open={isRescheduleOpen}
            onOpenChange={(open) => {
              setIsRescheduleOpen(open)
              if (!open) {
                setSelectedAppointment(null)
                setFormError('')
              }
            }}
          >
            <DialogContent className="bg-white sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogDescription>
                  Update date and time or change any other details if needed.
                </DialogDescription>
              </DialogHeader>

              {formError && (
                <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <form onSubmit={handleRescheduleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Doctor Name</label>
                    <Input
                      name="doctorName"
                      value={appointmentForm.doctorName}
                      onChange={handleAppointmentFormChange}
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Specialization</label>
                    <Select
                      value={appointmentForm.specialization}
                      onValueChange={(value) => handleAppointmentSelectChange('specialization', value)}
                    >
                      <SelectTrigger className="w-full bg-input border-border">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50 shadow-md">
                        {specializationOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Appointment Date *</label>
                    <Input
                      type="date"
                      name="appointmentDate"
                      value={appointmentForm.appointmentDate}
                      onChange={handleAppointmentFormChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Appointment Time *</label>
                    <Input
                      type="time"
                      name="appointmentTime"
                      value={appointmentForm.appointmentTime}
                      onChange={handleAppointmentFormChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reason for Visit</label>
                  <Input
                    name="reason"
                    value={appointmentForm.reason}
                    onChange={handleAppointmentFormChange}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
                  <Textarea
                    name="notes"
                    value={appointmentForm.notes}
                    onChange={handleAppointmentFormChange}
                    className="bg-input border-border min-h-28"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsRescheduleOpen(false)} className="w-full">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-black border-1 hover:bg-primary/90"
                    disabled={actionLoadingId === selectedAppointment?._id}
                  >
                    {actionLoadingId === selectedAppointment?._id ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Footer />
    </div>
  )
}
