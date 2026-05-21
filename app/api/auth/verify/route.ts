import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from '@/lib/jwt'
import { ApiResponse } from '@/lib/models'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const token = req.cookies.get('authToken')?.value

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        return NextResponse.json(
          {
            success: true,
            message: 'Token is valid',
            data: decoded,
          },
          { status: 200 }
        )
      }
    }

    const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!nextAuthToken?.sub || !nextAuthToken?.email) {
      return NextResponse.json(
        { success: false, message: 'No token found', error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Token is valid',
        data: {
          userId: nextAuthToken.sub,
          email: nextAuthToken.email,
          name: nextAuthToken.name || 'User',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Verify error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
