import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'
import { ApiResponse } from '@/lib/models'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid password', error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create token
    const token = signToken({
      userId: user._id!.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    })

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          userId: user._id!.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 200 }
    )

    // Set httpOnly cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: 'Failed to login' },
      { status: 500 }
    )
  }
}
