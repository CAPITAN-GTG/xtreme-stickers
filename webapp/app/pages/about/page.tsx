import Link from 'next/link';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to Xtreme Stickers
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-zinc-300">
              Your vision, our expertise - Custom stickers that make a statement
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-invert mx-auto">
            <div className="space-y-6 text-lg">
              <p className="leading-relaxed">
                At Xtreme Stickers, we specialize in bringing your unique designs to life through high-quality, 
                custom-made stickers. As part of the TeesToGo family, we share their commitment to exceptional 
                customization and quality craftsmanship.
              </p>
              
              <p className="leading-relaxed">
                While TeesToGo offers a complete range of customized products - from t-shirts and hoodies to 
                banners and promotional items - we've focused our expertise on creating the perfect custom 
                stickers. Each sticker is crafted with precision and care, ensuring your design stands out 
                with vibrant colors and lasting durability.
              </p>

              <div className="mt-12 text-center">
                <a
                  href="https://www.teestogo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-black border-2 border-white/20 rounded-lg hover:bg-white hover:text-black transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:border-white"
                >
                  <span>Visit TeesToGo</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
