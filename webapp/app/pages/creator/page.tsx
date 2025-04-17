"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CartItem {
  id: string;
  imageUrl: string;
  size: typeof STICKER_SIZES[0];
  quantity: number;
  total: number;
}

const STICKER_SIZES = [
  { id: 1, size: "2\" x 2\"", price: 2.99 },
  { id: 2, size: "3\" x 3\"", price: 3.99 },
  { id: 3, size: "4\" x 4\"", price: 4.99 }
];

const Creator = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState(STICKER_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(Number((selectedSize.price * quantity).toFixed(2)));
  }, [selectedSize, quantity]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !previewUrl) {
      toast.error('Please select an image for your sticker', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
      // Create a new cart item
      const newItem: CartItem = {
        id: Date.now().toString(),
        imageUrl: previewUrl,
        size: selectedSize,
        quantity,
        total: Number((selectedSize.price * quantity).toFixed(2))
      };

      // Get existing cart items
      const existingCart = localStorage.getItem('cart');
      const cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
      
      // Add new item
      cartItems.push(newItem);
      
      // Save back to localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));

      // Navigate to cart first
      router.push('/pages/cart');
      
      // Show success toast after a brief delay to ensure it appears after navigation
      setTimeout(() => {
        toast.success('Added to cart successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          style: {
            background: '#1f2937',
            color: '#e5e7eb',
            borderRadius: '0.5rem',
            border: '1px solid rgba(147, 51, 234, 0.1)',
          },
        });
      }, 100); // Small delay to ensure toast appears after navigation

    } catch (error) {
      console.error('Error saving to cart:', error);
      toast.error('There was an error adding the item to cart. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        style: {
          background: '#1f2937',
          color: '#e5e7eb',
          borderRadius: '0.5rem',
          border: '1px solid rgba(147, 51, 234, 0.1)',
        },
      });
    }
  };

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
                </label>
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-300 ${
                    isDragActive
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-purple-500/50'
                  }`}
                >
                  <div className="space-y-1 text-center w-full">
                    <input {...getInputProps()} />
                    {previewUrl ? (
                      <div className="relative w-full h-64 group">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain rounded-lg"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUrl('');
                              setSelectedFile(null);
                            }}
                            className="bg-red-500/80 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-400">
                          {isDragActive
                            ? "Drop your image here"
                            : "Drag and drop your image here, or click to select"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
                    onClick={decrementQuantity}
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
                    onChange={handleQuantityChange}
                    className="block w-20 text-center text-gray-200 bg-gray-700 rounded-md border-gray-600 focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={incrementQuantity}
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
                <button
                  type="submit"
                  className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-4 rounded-md text-white font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creator;