import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/models'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    )

    response.cookies.delete('authToken')
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')
    response.cookies.delete('next-auth.csrf-token')
    response.cookies.delete('__Secure-next-auth.callback-url')
    response.cookies.delete('next-auth.callback-url')

    return response
  } catch (error) {
    console.error('[v0] Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
