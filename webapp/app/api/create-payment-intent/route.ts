import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if STRIPE_SECRET_KEY is configured
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    // Log the start of the request
    console.log('Creating payment intent...');

    const { amount } = await request.json();
    console.log('Received amount:', amount);

    // Validate amount
    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return NextResponse.json(
        { error: "Invalid amount. Amount must be greater than 0." },
        { status: 400 }
      );
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);
    console.log('Amount in cents:', amountInCents);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

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