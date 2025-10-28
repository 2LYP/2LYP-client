//components/home/WalletIntegrationBox.js
"use client";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function WalletIntegrationBox({ tokenBoxReveal }) {
  const router = useRouter();
  return (
    <div
      className={`w-1/3 bg-purple-600 dark:bg-purple-800 rounded-xl border-4 border-black p-6 transition-all duration-1000 ${
        tokenBoxReveal > 0 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Wallet Integration</h2>
      <div className="space-y-4 text-white">
        <Button
          className="w-full typewriter"
          style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}
          onClick={() => console.log("Add to MetaMask clicked")}
        >
          Add to MetaMask
        </Button>
        <Button
          className="w-full typewriter"
          style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}
          onClick={() => console.log("Connect Wallet clicked")}
        >
          Connect Wallet
        </Button>
        <Button
          className="w-full typewriter"
          style={{ "--button-bg-light": "rgb(128 0 128)", fontSize: "18px", height: "50px" }}
          onClick={() => router.push("/faucet")}
        >
          Get Free Tokens
        </Button>
      </div>
    </div>
  );
}
