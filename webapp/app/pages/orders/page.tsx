"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Package2, Clock, CheckCircle2, Loader2 } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'completed';

interface OrderItem {
  _id: string;
  imageUrl: string;
  size: {
    size: string;
    price: number;
  };
  quantity: number;
  total: number;
  status: 'draft' | OrderStatus;
  createdAt: string;
}

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      text: 'Pending'
    },
    processing: {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      text: 'Processing'
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      text: 'Completed'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}>
      <Icon className={`${config.color} w-4 h-4 mr-2 ${status === 'processing' ? 'animate-spin' : ''}`} />
      <span className={`${config.color} text-sm font-medium`}>{config.text}</span>
    </div>
  );
};

const Orders = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/stickers');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const items = await response.json();
        // Filter out draft items
        const nonDraftItems = items
          .filter((item: OrderItem) => item.status !== 'draft')
          .sort((a: OrderItem, b: OrderItem) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setOrders(nonDraftItems);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (isUserLoaded) {
      fetchOrders();
    }
  }, [user, isUserLoaded]);

  // Show loading state while checking user authentication
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show sign-in message for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <Package2 className="w-16 h-16 text-purple-500 mb-4" />
        <h1 className="text-4xl font-sedgwick text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-4">
          Your Orders
        </h1>
        <p className="text-gray-300 text-center">Please sign in to view your orders</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-center mb-8">
              <Package2 className="w-8 h-8 text-purple-500 mr-3" />
              <h1 className="text-4xl font-sedgwick text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Your Orders
              </h1>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-purple-500/30 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={order.imageUrl}
                        alt="Sticker preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow text-center sm:text-left">
                      <div className="mb-3">
                        <StatusBadge status={order.status as OrderStatus} />
                      </div>
                      <p className="text-gray-300 mb-2">
                        Size: <span className="text-gray-100">{order.size.size}</span>
                      </p>
                      <p className="text-gray-300 mb-2">
                        Quantity: <span className="text-gray-100">{order.quantity}</span>
                      </p>
                      <p className="text-gray-300 mb-2">
                        Total: <span className="text-gray-100">${order.total.toFixed(2)}</span>
                      </p>
                      <p className="text-gray-400 text-sm">
                        Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders; 