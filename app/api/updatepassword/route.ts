// File: /app/api/update-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed
import bcrypt from 'bcrypt';

export async function PUT(req: NextRequest) {
  // 1. Authenticate the user by checking cookies.
  //    This is crucial for security: only the logged-in user can change their own password.
  const authCookie = req.cookies.get('auth');
  const usernameCookie = req.cookies.get('user'); // We assume the username is stored in a cookie

  if (!authCookie || authCookie.value !== 'true' || !usernameCookie) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to update your password.' }, { status: 401 });
  }

  // Get the username from the cookie to identify which user's password to update
  const username = decodeURIComponent(usernameCookie.value);

  // Get current and new passwords from the request body
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: 'Current password and new password are required.' }, { status: 400 });
  }

  try {
    // 2. Verify the provided current password against the stored hash in the database.
    // Assuming 'user_table' is represented by 'User' model in Prisma schema
    const user = await prisma.user.findUnique({
      where: {
        username: username, // Find the user by username
      },
      select: {
        password: true, // Select only the hashed password
      },
    });

    if (!user) {
      // This case should ideally not be hit if the username from the cookie is valid,
      // but it's a good safeguard.
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Invalid current password.' }, { status: 401 });
    }

    // 3. Hash the new password before storing it.
    //    NEVER store plain-text passwords.
    const saltRounds = 10; // A good balance between security and performance
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4. Update the password in the database.
    await prisma.user.update({
      where: {
        username: username, // Identify the user to update
      },
      data: {
        password: hashedNewPassword, // Update with the new hashed password
      },
    });

    return NextResponse.json({ message: 'Password updated successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Password update error:', error);
    // Handle Prisma-specific errors or general database errors
    return NextResponse.json({ message: 'Internal server error during password update.' }, { status: 500 });
  }
}
