import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
//import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  //const u_id = uuidv4();
  const createdAt = new Date();
  const { username, password, firstname, lastname , role } = await req.json();

  try {
    // ✅ Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create the user in the database
    await prisma.user.create({
      data: {
   
        username,
        password: hashedPassword,
        firstname,
        lastname,
        createdAt,
        role,
      },
    });

    return NextResponse.json({ message: 'User created' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
