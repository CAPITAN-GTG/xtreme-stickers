"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CheckoutForm from '@/components/CheckoutForm';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CartItem {
  _id: string;
  imageUrl: string;
  size: {
    id: number;
    size: string;
    price: number;
  };
  quantity: number;
  total: number;
  status: string;
}

// Define the appearance type correctly
const appearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#9333EA',
    colorBackground: '#1F2937',
    colorText: '#E5E7EB',
    colorDanger: '#EF4444',
    borderRadius: '8px',
  },
} as const;

const Cart = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/stickers');
        if (!response.ok) {
          throw new Error('Failed to fetch stickers');
        }
        const items = await response.json();
        // Filter for draft items only
        const draftItems = items.filter((item: CartItem) => item.status === 'draft');
        setCartItems(draftItems);
        // Calculate total
        const total = draftItems.reduce((sum: number, item: CartItem) => sum + item.total, 0);
        setTotalAmount(total);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast.error('Failed to load cart items');
      }
    };

    fetchCartItems();
  }, [user]);

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/stickers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Remove item from local state
      const updatedCart = cartItems.filter(item => item._id !== id);
      setCartItems(updatedCart);
      
      // Update total
      const newTotal = updatedCart.reduce((sum, item) => sum + item.total, 0);
      setTotalAmount(newTotal);

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to proceed with checkout', {
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
      return;
    }

    try {
      setIsLoading(true);

      // Validate total amount
      if (!totalAmount || totalAmount <= 0) {
        throw new Error('Invalid cart amount');
      }

      // Create payment intent and update stickers in MongoDB
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: totalAmount,
          items: cartItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'An error occurred during checkout. Please try again.', {
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
    } finally {
      setIsLoading(false);
    }
  };

  const CheckoutButton = () => {
    if (!isUserLoaded) return null;

    if (!user) {
      return (
        <SignInButton mode="modal">
          <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02]">
            Sign in to Checkout
          </button>
        </SignInButton>
      );
    }

    return (
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-4xl font-sedgwick text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-8">
              Your Cart
            </h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
                <Link
                  href="/pages/creator"
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Create a Sticker
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-purple-500/30 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt="Sticker preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-grow text-center sm:text-left">
                        <p className="text-gray-300 mb-2">
                          Size: <span className="text-gray-100">{item.size.size}</span>
                        </p>
                        <p className="text-gray-300 mb-2">
                          Quantity: <span className="text-gray-100">{item.quantity}</span>
                        </p>
                        <p className="text-gray-300">
                          Price: <span className="text-gray-100">${item.total.toFixed(2)}</span>
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total and Checkout */}
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-medium text-gray-300">Total</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                      <CheckoutForm />
                    </Elements>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/pages/creator"
                        className="flex-1 px-6 py-3 text-center border border-purple-500/50 text-purple-400 rounded-md hover:bg-purple-500/10 transition-all duration-300"
                      >
                        Add More Stickers
                      </Link>
                      <CheckoutButton />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;