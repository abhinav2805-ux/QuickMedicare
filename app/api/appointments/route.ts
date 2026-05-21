import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { decodeToken } from '@/lib/jwt'
import { ApiResponse, Appointment } from '@/lib/models'

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('authToken')?.value
  if (token) {
    const decoded = decodeToken(token)
    if (decoded?.userId) {
      return decoded.userId
    }
  }

  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (nextAuthToken?.sub) {
    return nextAuthToken.sub
  }

  return null
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const appointmentsCollection = db.collection('appointments')

    const appointments = await appointmentsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ appointmentDate: -1 })
      .toArray()

    return NextResponse.json(
      {
        success: true,
        message: 'Appointments fetched successfully',
        data: appointments,
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
    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
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
      userId: new ObjectId(userId),
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

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        data: {
          _id: result.insertedId,
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
