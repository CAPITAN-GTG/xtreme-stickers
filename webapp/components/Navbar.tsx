"use client"
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu, X, Info, Package } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-white sticky top-0 z-50 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-sedgwick text-2xl hover:scale-105 transition-all duration-300">Xtreme Stickers</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <Link href="/pages/cart" className="flex items-center hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
              </Link>
              <Link href="/pages/about" className="flex items-center hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <Info className="w-5 h-5 mr-2" />
                About Us
              </Link>
              <Link href="https://teestogo.com" className="flex items-center hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <Package className="w-5 h-5 mr-2" />
                More Merch
              </Link>
              <div className="ml-4">
                <button className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/pages/cart" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
            </Link>
            <Link href="/pages/about" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors">
              <Info className="w-5 h-5 mr-2" />
              About Us
            </Link>
            <Link href="/merch" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors">
              <Package className="w-5 h-5 mr-2" />
              More Merch
            </Link>
            <div className="px-3 py-2">
              <button className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 