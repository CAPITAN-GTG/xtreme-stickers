import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/utils/connectDB';
import Sticker from '@/models/Sticker';
import Stripe from 'stripe';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

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

    const { status, orderId, paymentConfirmed } = await request.json();

    if (!status || !orderId) {
      return NextResponse.json(
        { error: 'Status and orderId are required' },
        { status: 400 }
      );
    }

    // Verify payment status with Stripe
    if (!paymentConfirmed) {
      return NextResponse.json(
        { error: 'Payment not confirmed' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(orderId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Verify that the payment was made by the same user
    if (paymentIntent.metadata.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized payment verification' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Update all stickers for this user and payment intent
    const result = await Sticker.updateMany(
      { 
        userId,
        orderId: paymentIntent.id,
      },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          paymentConfirmed: true,
          paymentIntentId: paymentIntent.id
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No stickers found to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} stickers to ${status}`,
      modifiedCount: result.modifiedCount
    });

  } catch (error: any) {
    console.error('Error updating sticker status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sticker status' },
      { status: 500 }
    );
  }
} 