"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { FileUpload } from '@/components/FileUpload';
import Link from 'next/link';

const STICKER_SIZES = [
  { id: 1, size: "2\" x 2\"", price: 2.99 },
  { id: 2, size: "3\" x 3\"", price: 3.99 },
  { id: 3, size: "4\" x 4\"", price: 4.99 }
];

const Creator = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState(STICKER_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTotal(Number((selectedSize.price * quantity).toFixed(2)));
  }, [selectedSize, quantity]);

  const handleUploadSuccess = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !selectedSize || !quantity) {
      toast.error('Please select an image, size, and quantity');
      return;
    }

    try {
      setIsLoading(true);
      const stickerData = {
        imageUrl,
        size: selectedSize,
        quantity,
        price: total,
      };

      const response = await fetch('/api/stickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stickerData),
      });

      if (!response.ok) {
        throw new Error('Failed to save sticker');
      }

      toast.success('Sticker saved successfully! Go to the Cart to place an order.');
      // Reset form
      setImageUrl('');
      setSelectedSize(STICKER_SIZES[0]);
      setQuantity(1);
      setTotal(0);
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const AddToCartButton = () => {
    if (!isUserLoaded) return null;

    if (!user) {
      return (
        <SignInButton mode="modal">
          <button className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-4 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02]">
            Sign in to Add to Cart
          </button>
        </SignInButton>
      );
    }

    return (
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-4 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Add to Cart'}
        </button>
        <Link
          href="/pages/cart"
          className="mt-6 flex-1 text-center border border-purple-500/50 text-purple-400 py-3 px-4 rounded-md hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-[1.02]"
        >
          Go to Cart
        </Link>
      </div>
    );
  };

  // Show loading state while user status is being determined
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show sign-in screen for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-sedgwick text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-8">
          Create Your Custom Sticker
        </h1>
        <p className="text-gray-300 mb-8 text-center">Please sign in to create custom stickers</p>
        <SignInButton mode="modal">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-8 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02]">
            Sign In to Continue
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-4xl font-sedgwick text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-8">
              Create Your Custom Sticker
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Upload Your Design
                  <span className="ml-1 text-xs text-gray-400">(Max size: 10MB)</span>
                </label>
                <FileUpload
                  onUpload={handleUploadSuccess}
                  imageUrl={imageUrl}
                  onRemove={() => setImageUrl('')}
                />
              </div>

              {/* Size Selection */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {STICKER_SIZES.map((size) => (
                  <div
                    key={size.id}
                    className={`relative rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                      selectedSize.id === size.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-purple-500/50'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <div className="flex flex-col items-center p-4 cursor-pointer">
                      <span className="text-lg font-medium text-gray-200">
                        {size.size}
                      </span>
                      <span className="mt-1 text-sm text-gray-400">
                        ${size.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-300"
                >
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-300 border border-gray-600 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
                  >
                    <span className="sr-only">Decrease quantity</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="block w-20 text-center text-gray-200 bg-gray-700 rounded-md border-gray-600 focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-300 border border-gray-600 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
                  >
                    <span className="sr-only">Increase quantity</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Total and Order Button */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-300">Total</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <AddToCartButton />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creator;