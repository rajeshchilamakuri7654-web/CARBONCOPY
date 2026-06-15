"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Scan, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ScannedObject = {
  id: string;
  name: string;
  co2: number;
  x: number;
  y: number;
};

export default function ARScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedObjects, setScannedObjects] = useState<ScannedObject[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        setError("Camera access denied or not available on this device.");
        console.error(err);
      }
    }
    setupCamera();

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const triggerMockScan = () => {
    setIsScanning(true);
    setScannedObjects([]);
    
    // Simulate AI Vision Object Detection Delay
    setTimeout(() => {
      setScannedObjects([
        { id: "1", name: "Refrigerator", co2: 320, x: 30, y: 40 },
        { id: "2", name: "SUV Vehicle", co2: 4500, x: 60, y: 65 },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Scan className="h-5 w-5 text-emerald-400" />
            AR Carbon Scanner
          </h1>
          <p className="text-xs text-zinc-300 mt-1">Powered by AI Vision & WebXR</p>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0" onClick={() => window.history.back()}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative overflow-hidden bg-zinc-900">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">Camera Error</h2>
            <p className="text-zinc-400 text-sm">{error}</p>
            <div className="mt-8 p-6 bg-zinc-800 rounded-2xl border border-zinc-700">
              <p className="text-emerald-400 font-bold mb-2">Hackathon Demo Mode:</p>
              <p className="text-sm text-zinc-300">
                In a real deployment, this uses <code>navigator.mediaDevices</code>.
                If you are on desktop without a webcam or HTTP, this fails securely.
              </p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Scan Overlay UI */}
        {isScanning && (
          <div className="absolute inset-0 bg-emerald-500/10 z-20 flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-emerald-400/50 rounded-3xl relative animate-pulse">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl"></div>
            </div>
            <p className="mt-8 text-emerald-400 font-bold tracking-widest uppercase text-sm animate-bounce">Analyzing Objects...</p>
          </div>
        )}

        {/* AR Floating Tags */}
        {!isScanning && scannedObjects.map((obj) => (
          <div 
            key={obj.id}
            className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
          >
            <div className="relative group cursor-pointer">
              {/* Tag connecting line / dot */}
              <div className="h-3 w-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] mx-auto mb-2 animate-pulse" />
              
              {/* Floating Info Card */}
              <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-700 p-3 rounded-xl shadow-2xl flex flex-col items-center min-w-[120px]">
                <span className="text-xs font-bold text-zinc-300 uppercase">{obj.name}</span>
                <span className="text-lg font-black text-red-400 mt-1">{obj.co2} <span className="text-[10px] text-zinc-500">kg CO₂/yr</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 z-10 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center">
        <button 
          onClick={triggerMockScan}
          disabled={!streamActive || isScanning}
          className="h-20 w-20 bg-white rounded-full flex items-center justify-center p-1 cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-4 border-zinc-400"
        >
          <div className="h-full w-full bg-black rounded-full flex items-center justify-center border-2 border-white">
             <Camera className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}
