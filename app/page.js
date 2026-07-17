//page.js
"use client";
import "@/styles/lines.css";
import { useRouter } from "next/navigation";
import SECTION_DATA from "@/constants/sectionData";
import HeroSection from "@/components/home/HeroSection";
import Section from "@/components/home/Section";
import useScrollReveal from "@/hooks/useScrollReveal";
import Logo from "@/components/ui/Logo";
import style from "@/components/ui/Button.module.css";
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";
import WalletIntegrationBox from "@/components/home/WalletIntegrationBox";
import Footer from "@/components/Footer";

import {
  useTotalSupply,
  useMaxSupply,
  useFaucetDrip,
  useFaucetCooldown,
  useTokenomicsStatus,
  useTokenName,
  useTokenSymbol,
  useTokenDecimals,
  useUserBalance,
} from "../hooks/useOverviewStats";

import { formatEther } from 'viem';


// Lazy load non-essential components
const Background = dynamic(() => import("@/components/ui/Background"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900" />
});

const Lypcursor = dynamic(() => import("@/components/ui/Lypcursor"), {
  ssr: false,
  loading: () => null
});

const RouteLoadingBar = dynamic(() => import("@/components/ui/RouteLoadingBar"), {
  ssr: false,
  loading: () => null
});

const Coin = dynamic(() => import('@/components/ui/Coin'), {
  ssr: false,
  loading: () => (
    <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
  )
});



export default function Home() {
  const router = useRouter();
  const { isScrolled, scrollProgress, tokenBoxReveal } = useScrollReveal();

  const { data: totalSupply } = useTotalSupply();
  const { data: maxSupply } = useMaxSupply();
  const { data: tokenName } = useTokenName();
  const { data: tokenSymbol } = useTokenSymbol();
  const { data: decimals } = useTokenDecimals();
  const { data: faucetDrip } = useFaucetDrip();
  const { data: tokenomicsInitialized } = useTokenomicsStatus();

  const totalSupplyFormatted = totalSupply ? parseFloat(formatEther(totalSupply)).toLocaleString() : 'Loading...';
  const maxSupplyFormatted = maxSupply ? parseFloat(formatEther(maxSupply)).toLocaleString() : 'Loading...';
  const faucetDripFormatted = faucetDrip ? parseFloat(formatEther(faucetDrip)).toLocaleString() : 'Loading...';

  return (
    <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <Suspense fallback={null}>
        <RouteLoadingBar />
      </Suspense>
      <Suspense fallback={null}>
        <Lypcursor />
      </Suspense>
      <Suspense fallback={<div className="fixed inset-0 bg-gray-100 dark:bg-gray-900" />}>
        <Background />
      </Suspense>

      {/* Theme Toggle Button is now in Background component */}

      <Navbar />

      <HeroSection sectionData={SECTION_DATA} isScrolled={isScrolled} router={router} />

      {/* Render all sections */}
      {SECTION_DATA.map((section, i) => (
        <div key={i} className="mb-8">
          <Section
            title={section.title}
            bgColor={section.bgColor}
            items={section.items}
            buttonColor={section.buttonColor}
            sectionIndex={i}
          />
          <br />
        </div>
      ))}

      {/* Token Section with Coin in Middle */}
      <div className="relative w-full mx-auto mb-8 flex justify-center items-center gap-8 px-8">
        {/* Left Token Box */}
        <div
          className={`w-1/3 bg-purple-600 dark:bg-purple-800 rounded-xl border-4 border-black p-6 transition-all duration-1000 ${tokenBoxReveal > 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
            }`}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">Tokenomics</h2>
          <div className="space-y-4 text-white">
            <div>
              <h3 className="font-semibold">Max Supply Cap</h3>
              <p>{maxSupplyFormatted} 2LYP</p>
            </div>
            <div>
              <h3 className="font-semibold">Current Supply Cap</h3>
              <p>{totalSupplyFormatted} 2LYP</p>
            </div>
            <div>
              <h3 className="font-semibold">Token Value</h3>
              <p>$5</p>
            </div>
          </div>
        </div>

        {/* Coin in Center */}
        <div className="z-10">
          <Suspense fallback={
            <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          }>
            <Coin scrollProgress={scrollProgress} showTokenBox={tokenBoxReveal > 0} />
          </Suspense>
        </div>

        {/* Right Token Box */}
        <WalletIntegrationBox tokenBoxReveal={tokenBoxReveal} />
      </div>
      <br /><br />
      <Footer />
    </main>
  );
}