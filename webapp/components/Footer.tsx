"use client"
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link href="/" className="font-sedgwick text-2xl hover:scale-105 transition-all duration-300">
              Xtreme Stickers
            </Link>
            <p className="font-poppins text-sm mt-2">© {new Date().getFullYear()} Xtreme Stickers. All rights reserved.</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="font-poppins text-sm">
              <a href="mailto:shera@teestogo.com" className="hover:text-gray-300">
                shera@teestogo.com
              </a>
            </p>
            <p className="font-poppins text-sm mt-1">
              <a href="tel:9034548326" className="hover:text-gray-300">
                (903) 454-8326
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 