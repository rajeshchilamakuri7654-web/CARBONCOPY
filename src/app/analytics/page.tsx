"use client";

import { useState, useEffect } from "react";
import { BarChart3, Download, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AnalyticsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carboniq-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
            Advanced Analytics
          </h1>
          <p className="text-zinc-400 mt-2">
            Deep dive into your emission trends and generate reports.
          </p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="bg-zinc-800 hover:bg-zinc-700 rounded-xl px-6"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Generating..." : "Export CSV"}
        </Button>
      </div>

      <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center h-[300px] border border-dashed border-zinc-800">
         <TrendingDown className="h-10 w-10 text-emerald-500 mb-4" />
         <h3 className="text-xl font-bold text-white">Analytics Engine Loading...</h3>
         <p className="text-zinc-500 mt-2 max-w-md text-center">
           Connect your automated integrations or log more data to populate these advanced month-over-month trend charts.
         </p>
         <Button className="mt-6 rounded-full" variant="secondary">
           View Dashboard Instead <ArrowRight className="h-4 w-4 ml-2" />
         </Button>
      </div>
    </div>
  );
}
