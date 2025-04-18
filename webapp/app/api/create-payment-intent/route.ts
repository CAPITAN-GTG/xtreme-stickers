import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDatabase from '@/utils/connectDB';
import Sticker from '@/models/Sticker';
import { auth } from '@clerk/nextjs/server';

// Check if STRIPE_SECRET_KEY is configured
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    // Get the user ID from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Parse the request body
    const { amount, items } = await request.json();
    
    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be greater than 0." },
        { status: 400 }
      );
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
      },
    });

    // Connect to MongoDB
    await connectToDatabase();

    // Only associate the payment intent ID with the stickers, don't change status yet
    const updatePromises = items.map(async (item: any) => {
      return Sticker.findOneAndUpdate(
        { _id: item._id, userId },
        { 
          $set: { 
            orderId: paymentIntent.id,
            // Don't change status here - it will be changed after payment confirmation
            paymentIntentId: paymentIntent.id,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error: any) {
    // Detailed error logging
    console.error('Error in create-payment-intent:', {
      error: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });

    let errorMessage = "Failed to create payment intent";
    let statusCode = 500;

    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeCardError':
          errorMessage = 'Your card was declined.';
          statusCode = 402;
          break;
        case 'StripeInvalidRequestError':
          errorMessage = 'Invalid payment request.';
          statusCode = 400;
          break;
        case 'StripeAuthenticationError':
          errorMessage = 'Authentication with Stripe failed.';
          statusCode = 401;
          break;
        default:
          errorMessage = 'An unexpected error occurred.';
      }
    }

    // Return appropriate error response
    return NextResponse.json(
      { 
        error: errorMessage,
        message: error.message 
      },
      { status: statusCode }
    );
  }
} 