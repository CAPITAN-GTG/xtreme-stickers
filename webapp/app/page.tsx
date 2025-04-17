import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-black text-white h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero.jpeg')", filter: "blur(8px)" }}></div>
        
        {/* Graffiti-style decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 border-4 border-white transform rotate-45 opacity-20"></div>
        <div className="absolute bottom-1/4 right-10 w-20 h-20 border-4 border-white transform -rotate-45 opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border-4 border-white rounded-full opacity-20"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 border-4 border-white transform rotate-12 opacity-20"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-sedgwick text-5xl sm:text-7xl md:text-8xl mb-6 animate-fade-in">
            XTREME STICKERS
          </h1>
          <p className="text-xl sm:text-2xl mb-12 max-w-2xl mx-auto animate-fade-in-up">
            Express yourself with our custom stickers and merch. Make your mark!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link
              href="pages/creator"
              className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
