"use client";

import { useState } from "react";
import { RefreshCw, MapPin, Home, CreditCard, CheckCircle2, Plug, Mic } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Integration = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "maps", name: "Google Maps", icon: MapPin, description: "Auto-sync daily commutes and travel distance.", color: "text-blue-400" },
  { id: "smarthome", name: "Smart Thermostat", icon: Home, description: "Pull HVAC power usage from Nest/Ecobee.", color: "text-orange-400" },
  { id: "financial", name: "Banking API", icon: CreditCard, description: "Estimate footprint from grocery/fuel transactions.", color: "text-emerald-400" },
  { id: "iot_plug", name: "Kasa Smart Plug", icon: Plug, description: "Stream live wattage draw via Web Bluetooth.", color: "text-yellow-400" },
  { id: "voice_assistant", name: "Siri / Alexa", icon: Mic, description: "Voice-activated Webhook for footprint logging.", color: "text-purple-400" },
];

export function SyncDataPanel() {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncedIds, setSyncedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    setMessage(null);

    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationType: id }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSyncedIds((prev) => [...prev, id]);
        setMessage(data.message);
        
        // Clear message after 4s
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to connect to integration service.");
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 w-full">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-indigo-400" />
          Smart Automations
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Connect third-party apps to automatically track your footprint without manual entry. 
          (+10 bonus points per sync!)
        </p>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {INTEGRATIONS.map((int) => {
          const isSyncing = syncingId === int.id;
          const isSynced = syncedIds.includes(int.id);

          return (
            <div key={int.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${int.color}`}>
                  <int.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{int.name}</h4>
                  <p className="text-xs text-zinc-500">{int.description}</p>
                </div>
              </div>
              
              <Button
                variant={isSynced ? "secondary" : "primary"}
                size="sm"
                onClick={() => handleSync(int.id)}
                disabled={isSyncing}
                className="min-w-[100px]"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isSynced ? (
                  "Sync Again"
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
