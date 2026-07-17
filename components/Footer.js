// components/Footer.js
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  
  return (
    <footer
      className="w-full bg-white dark:bg-black border-t-2 border-black dark:border-white py-12 px-6 mt-16 transition-colors duration-300"
      style={{
        position: "relative",
        zIndex: 40,
        backgroundColor: "var(--background)",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="text-xl font-bold font-mono tracking-tight text-black dark:text-white">
            2LYP Computations
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
            Delivering high-performance computational tools and next-generation decentralized solutions. Built on clarity, efficiency, and robustness.
          </p>
          <div className="text-xs text-gray-500 font-mono">
            © {new Date().getFullYear()} Two-Lyp Computations Private Limited.
            <br />
            All rights reserved.
          </div>
        </div>

        {/* Column 2: Navigation / Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-mono text-black dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm font-mono">
            <li>
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200">
                &gt; Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200">
                &gt; About Us
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200">
                &gt; Products
              </Link>
            </li>
            <li>
              <Link href="/hub" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200">
                &gt; Hub Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Corporate Info / Compliance */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-mono text-black dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
            Corporate Info
          </h3>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
            <div>
              <span className="font-semibold text-black dark:text-white">CIN:</span> U62011AP2025PTC117438
            </div>
            <div>
              <span className="font-semibold text-black dark:text-white">GSTIN:</span> 37AALCT5213E1ZE
            </div>
            <div>
              <span className="font-semibold text-black dark:text-white">CEO:</span> Siddhu Manoj Katikitala
            </div>
            <div>
              <span className="font-semibold text-black dark:text-white">Address:</span> Vijayawada, Andhra Pradesh, India
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}