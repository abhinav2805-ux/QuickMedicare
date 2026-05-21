import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { decodeToken } from '@/lib/jwt'
import { sendAppointmentConfirmation } from '@/lib/email'
import { ApiResponse, Appointment } from '@/lib/models'

async function getAuthenticatedUser(req: NextRequest): Promise<{ userId: string; email: string; name: string } | null> {
  const token = req.cookies.get('authToken')?.value
  if (token) {
    const decoded = decodeToken(token)
    if (decoded?.userId) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      }
    }
  }

  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (nextAuthToken?.sub && nextAuthToken?.email) {
    return {
      userId: nextAuthToken.sub,
      email: nextAuthToken.email,
      name: nextAuthToken.name || 'User',
    }
  }

  return null
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const appointmentsCollection = db.collection('appointments')

    const appointments = await appointmentsCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ appointmentDate: -1 })
      .toArray()

    return NextResponse.json(
      {
        success: true,
        message: 'Appointments fetched successfully',
        data: appointments.map(appointment => ({
          ...appointment,
          _id: appointment._id.toString(),
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Get appointments error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { doctorName, specialization, appointmentDate, appointmentTime, reason, notes } = body

    if (!doctorName || !specialization || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'All fields are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const appointmentsCollection = db.collection('appointments')

    const newAppointment: Appointment = {
      userId: new ObjectId(user.userId),
      doctorName,
      specialization,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await appointmentsCollection.insertOne(newAppointment)

    await sendAppointmentConfirmation(user.email, user.name, {
      doctorName,
      specialization,
      appointmentDate,
      appointmentTime,
    }).catch(error => {
      console.error('[v0] Appointment confirmation email error:', error)
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        data: {
          _id: result.insertedId.toString(),
          ...newAppointment,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Create appointment error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
