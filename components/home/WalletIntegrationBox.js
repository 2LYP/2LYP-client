//components/home/WalletIntegrationBox.js
"use client";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { useUserBalance } from '../../hooks/useOverviewStats'
import { formatEther } from 'viem';
import { injected } from "wagmi/connectors";


export default function WalletIntegrationBox({ tokenBoxReveal }) {
  const router = useRouter();

  const { address, isConnected } = useAccount();
  const [addStatus, setAddStatus] = useState('idle'); // idle | pending | success | error
  const [addError, setAddError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  useEffect(() => {
    if (addStatus === 'success' || addStatus === 'error') {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 5000); // auto hide after 5s
      return () => clearTimeout(t);
    }
  }, [addStatus]);

  // Read user's 2LYP balance (pass undefined when not connected)
  const { data: navbarBalance } = useUserBalance(isConnected ? address : undefined);
  const navbarBalanceStr = !isConnected
    ? null
    : navbarBalance
      ? `${parseFloat(formatEther(navbarBalance)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 18 })} 2LYP`
      : 'Loading...';


  const handleAddToMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setAddError('MetaMask not detected');
      setAddStatus('error');
      return;
    }
    setAddStatus('pending');
    setAddError(null);
    try {
      // Adjust decimals if not 18
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: CONTRACT_ADDRESS,
            symbol: '2LYP',
            decimals: 18,
            image: `${window.location.origin}/2lyp-icon.png`,
          },
        },
      });
      if (wasAdded) {
        setAddStatus('success');
      } else {
        setAddStatus('error');
        setAddError('User rejected');
      }
    } catch (e) {
      setAddStatus('error');
      setAddError(e?.message || 'Failed to add token');
    }
  };


  return (
    <>
      <div
        className={`w-1/3 bg-purple-600 dark:bg-purple-800 rounded-xl border-4 border-black p-6 transition-all duration-1000 ${tokenBoxReveal > 0 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
          }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Wallet Integration</h2>
        <div className="space-y-4 text-white">
          {isConnected && (
            <Button
              className="w-full typewriter"
              style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}

              onClick={handleAddToMetaMask}
              disabled={addStatus === 'pending'}
            >
              {addStatus === 'pending' ? 'Adding…' : addStatus === 'success' ? 'Added ✔' : 'Add to MetaMask'}
            </Button>
          )}
          {isConnected ? (
            <Button
              className="w-full typewriter"
              style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}

              onClick={() => disconnect()}>
              {shortAddress}
            </Button>
          ) : (
            <Button
              className="w-full typewriter"
              style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}
              onClick={() => connect({ connector: injected() })}
            >
              Connect Wallet
            </Button>
          )}
          <Button
            className="w-full typewriter"
            style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}
            onClick={() => router.push("http://localhost:3001/airdrop")}
          >
            Claim Free Tokens
          </Button>
        </div>
      </div>
      {showToast && addStatus === 'error' && addError && (
        <div className="fixed bottom-2 right-2 text-xs px-3 py-2 bg-red-600 text-white rounded shadow flex items-center gap-3">
          <span>{addError}</span>
          <button onClick={() => setShowToast(false)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}
      {showToast && addStatus === 'success' && (
        <div className="fixed bottom-2 right-2 text-xs px-3 py-2 bg-green-600 text-white rounded shadow flex items-center gap-3">
          <span>Token added to MetaMask</span>
          <button onClick={() => setShowToast(false)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}
    </>
  );
}
