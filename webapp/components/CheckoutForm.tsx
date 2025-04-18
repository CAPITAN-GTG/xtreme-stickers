"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2 } from 'lucide-react';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_BASE_URL is not defined');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !baseUrl) {
      toast.error('Payment configuration error. Please try again later.', {
        position: "top-right",
        theme: "dark",
        style: {
          background: '#1f2937',
          color: '#e5e7eb',
          borderRadius: '0.5rem',
          border: '1px solid rgba(147, 51, 234, 0.1)',
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${baseUrl}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.', {
          position: "top-right",
          theme: "dark",
          style: {
            background: '#1f2937',
            color: '#e5e7eb',
            borderRadius: '0.5rem',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          },
        });
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Show processing message
        toast.info('Processing your order...', {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          style: {
            background: '#1f2937',
            color: '#e5e7eb',
            borderRadius: '0.5rem',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          },
        });

        // Only update stickers after confirming payment success
        const response = await fetch('/api/stickers/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: 'processing',
            orderId: paymentIntent.id,
            paymentConfirmed: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update order status');
        }

        // Show success message
        toast.success('Payment successful! Redirecting to orders...', {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
          style: {
            background: '#1f2937',
            color: '#e5e7eb',
            borderRadius: '0.5rem',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          },
        });

        // Wait for toast to be visible before redirecting
        setTimeout(() => {
          router.push('/pages/orders');
          router.refresh();
        }, 2000);
      } else {
        // Payment not successful
        toast.error('Payment was not successful. Please try again.', {
          position: "top-right",
          theme: "dark",
          style: {
            background: '#1f2937',
            color: '#e5e7eb',
            borderRadius: '0.5rem',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          },
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'An error occurred during payment', {
        position: "top-right",
        theme: "dark",
        style: {
          background: '#1f2937',
          color: '#e5e7eb',
          borderRadius: '0.5rem',
          border: '1px solid rgba(147, 51, 234, 0.1)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <PaymentElement />
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-4 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay now'
        )}
      </button>
    </form>
  );
} 