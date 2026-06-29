import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    
    if (username === adminUsername && password === adminPassword) {
      const token = signToken({ username });
      return NextResponse.json({ success: true, token });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Bad Request' }, { status: 400 });
  }
}
