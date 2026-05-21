'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown, Heart, Clock, Users, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  const services = [
    {
      icon: Heart,
      title: 'Critical Care',
      description: 'Expert emergency and intensive care services available 24/7',
    },
    {
      icon: Clock,
      title: 'Home Care',
      description: 'Professional in-home healthcare for patients with chronic conditions',
    },
    {
      icon: Users,
      title: 'Telemedicine',
      description: 'Remote consultations with qualified healthcare professionals',
    },
    {
      icon: Shield,
      title: 'Patient Safety',
      description: 'Highest standards of medical care and patient confidentiality',
    },
  ]

  const doctors = [
    {
      name: 'Dr. Michael Johnson',
      specialty: 'Cardiology',
      experience: '15+ years',
      image: '👨‍⚕️',
    },
    {
      name: 'Dr. Sarah Williams',
      specialty: 'General Medicine',
      experience: '12+ years',
      image: '👩‍⚕️',
    },
    {
      name: 'Dr. James Brown',
      specialty: 'Emergency Medicine',
      experience: '18+ years',
      image: '👨‍⚕️',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-semibold text-sm">Welcome to QuickMedicare</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Healthcare Excellence from{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Critical Care to Home
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Access professional healthcare services when and where you need them. Book appointments with experienced doctors and receive care tailored to your needs.
          </motion.p>

          <motion.div
            className="flex flex-row justify-center items-center gap-4 mb-12 mx-auto w-full"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link href="/appointment">
              <Button variant="outline" className="px-8 py-6 text-lg min-w-[210px]">
                Appointment
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-6 text-lg min-w-[210px]" asChild>
              <a href="#services">Learn More</a>
            </Button>
          </motion.div>

          <motion.div
            className="flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to meet your medical needs
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="p-8 h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary">
                  <service.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Medical Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experienced healthcare professionals committed to your wellness
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {doctors.map((doctor, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <Card className="p-8 text-center h-full border-border hover:border-primary hover:shadow-lg transition-all">
                  <div className="text-6xl mb-4">{doctor.image}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{doctor.name}</h3>
                  <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
                  <p className="text-muted-foreground text-sm">{doctor.experience}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent text-slate-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Quality Healthcare?</h2>
          <p className="text-lg mb-8 text-slate-700">
            Join thousands of patients who trust QuickMedicare for their healthcare needs
          </p>
          <Button
            asChild
            size="lg"
            className="border border-slate-900 bg-transparent px-8 py-6 text-lg text-slate-900 hover:bg-slate-900 hover:text-white"
          >
            <Link href="/auth/signup">Book Your First Appointment Today</Link>
          </Button>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { q: 'How do I book an appointment?', a: 'Simply sign up, choose your doctor and preferred time, and confirm your appointment.' },
              { q: 'Is my medical information secure?', a: 'Yes, we use industry-standard encryption and comply with all healthcare privacy regulations.' },
              { q: 'Can I have telemedicine consultations?', a: 'Yes, most consultations can be conducted via video call from the comfort of your home.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, insurance claims, and flexible payment plans.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-8">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold text-foreground">Phone</p>
              <p className="text-muted-foreground">+1 (800) 123-4567</p>
            </div>
            <div>
              <div className="text-3xl mb-2">✉️</div>
              <p className="font-semibold text-foreground">Email</p>
              <p className="text-muted-foreground">info@quickmedicare.com</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📍</div>
              <p className="font-semibold text-foreground">Address</p>
              <p className="text-muted-foreground">New York, USA</p>
            </div>
          </div>

          <Link href="/auth/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
