import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'
import { ApiResponse, User } from '@/lib/models'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, phone } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password too short', error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists', error: 'Email is already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const newUser: User = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    // Create token
    const token = signToken({
      userId: result.insertedId.toString(),
      email,
      name: `${firstName} ${lastName}`,
    })

    const response = NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: {
          userId: result.insertedId.toString(),
          email,
          firstName,
          lastName,
        },
      },
      { status: 201 }
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
    console.error('[v0] Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
