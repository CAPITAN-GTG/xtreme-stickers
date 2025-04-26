import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectDB';
import Sticker from '@/models/Sticker';

export async function POST(request: Request) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const data = await request.json();
    
    const sticker = await Sticker.create({
      ...data,
      userId,
      status: 'draft', // Set initial status
    });

    return NextResponse.json(sticker);
  } catch (error) {
    console.error('Error creating sticker:', error);
    return NextResponse.json(
      { error: 'Failed to create sticker' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // If user is admin, return all stickers, otherwise only return user's stickers
    const isAdmin = userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID;
    const stickers = isAdmin 
      ? await Sticker.find().sort({ createdAt: -1 })
      : await Sticker.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(stickers);
  } catch (error) {
    console.error('Error fetching stickers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stickers' },
      { status: 500 }
    );
  }
} 