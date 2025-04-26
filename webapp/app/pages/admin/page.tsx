"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Package2, Clock, CheckCircle2, Loader2, Search, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

type OrderStatus = 'draft' | 'pending' | 'processing' | 'completed';

interface Order {
  _id: string;
  imageUrl: string;
  size: {
    size: string;
    price: number;
  };
  quantity: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  userId: string;
}

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    draft: {
      icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      text: 'Draft'
    },
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

const AdminPage = () => {
  const { isSignedIn, user, isLoaded: isUserLoaded } = useUser();

  // Check for admin access
  if (isUserLoaded && (!isSignedIn || user?.id !== process.env.NEXT_PUBLIC_ADMIN_USER_ID)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl font-bold">Access Denied</div>
      </div>
    );
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  const fetchUsernames = async (userIds: string[]) => {
    try {
      const response = await fetch('/api/getUsernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usernames');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching usernames:', error);
      return {};
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/stickers');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const items = await response.json();

        // Get unique user IDs and ensure they are strings
        const userIds = [...new Set(items.map((order: Order) => order.userId))] as string[];
        
        // Fetch usernames for all unique user IDs
        const userDataMap = await fetchUsernames(userIds);
        setUserMap(userDataMap);

        // Sort by date, newest first
        const sortedItems = items.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedItems);
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
  }, [isUserLoaded]);

  const filteredOrders = orders.filter(order => {
    const searchString = searchTerm.toLowerCase();
    const username = userMap[order.userId]?.toLowerCase() || '';
    const matchesSearch = 
      order._id.toLowerCase().includes(searchString) ||
      username.includes(searchString);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/stickers/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center">
                <Package2 className="w-8 h-8 text-purple-500 mr-3" />
                <h1 className="text-4xl font-sedgwick text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Admin Dashboard
                </h1>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by ID or username..."
                    className="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-200"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col p-4 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={order.imageUrl}
                        alt="Sticker preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-center mb-3">
                        <StatusBadge status={order.status} />
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                          className="px-2 py-1 bg-gray-600 rounded-md text-sm text-gray-200 border border-gray-500 focus:outline-none focus:border-purple-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">{userMap[order.userId]}</span>
                      </div>

                      <p className="text-gray-300">
                        Order ID: <span className="text-gray-100">{order._id}</span>
                      </p>
                      <p className="text-gray-300">
                        Size: <span className="text-gray-100">{order.size.size}</span>
                      </p>
                      <p className="text-gray-300">
                        Quantity: <span className="text-gray-100">{order.quantity}</span>
                      </p>
                      <p className="text-gray-300">
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

export default AdminPage;