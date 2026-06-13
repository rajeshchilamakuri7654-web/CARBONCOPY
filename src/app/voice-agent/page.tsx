"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Mic, Square, Loader2, Volume2, Sparkles, Activity } from "lucide-react";

export default function VoiceAgent() {
  const { data: session } = useSession();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Speech Synthesis
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // When listening stops and we have a transcript, send to AI
  useEffect(() => {
    if (!isListening && transcript && !isThinking) {
      handleAskAI(transcript);
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop any current speech
      if (synthRef.current) synthRef.current.cancel();
      setTranscript("");
      setResponse("");
      recognitionRef.current.start();
    }
  };

  const handleAskAI = async (text: string) => {
    setIsThinking(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setResponse(data.reply);
        speakResponse(data.reply);
      } else {
        setResponse("I'm sorry, I encountered an error processing that.");
      }
    } catch (err) {
      console.error(err);
      setResponse("Network error. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    // Stop any existing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-2">
          <Mic className="h-6 w-6 text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">AI Voice Agent</h1>
        <p className="text-slate-600 max-w-lg">
          Speak naturally about your carbon footprint, ask for sustainability tips, or request facts about climate impact.
        </p>
      </div>

      {/* Main Interaction Area */}
      <div className="glass-panel rounded-3xl p-8 md:p-12 flex flex-col items-center relative overflow-hidden min-h-[450px]">
        
        {/* Ambient glow depending on state */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${
          isListening ? "bg-amber-500/10 scale-110" : 
          isSpeaking ? "bg-emerald-500/20 scale-125" : 
          isThinking ? "bg-sky-500/20 animate-pulse" : "bg-sky-500/5"
        }`} />

        {/* The Orb */}
        <div className="relative flex items-center justify-center h-48 w-48 mb-8 mt-4">
          {/* Pulsing rings when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-4 rounded-full border-2 border-amber-500/60 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
            </>
          )}

          {/* Activity rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-pulse" />
              <div className="absolute -inset-4 rounded-full border border-emerald-500/20 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute -inset-8 rounded-full border border-emerald-500/10 animate-spin border-dashed" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
            </>
          )}

          <button
            onClick={toggleListening}
            className={`relative z-10 flex items-center justify-center h-28 w-28 rounded-full transition-all duration-500 shadow-2xl ${
              isListening 
                ? "bg-amber-500 shadow-amber-500/50 scale-110 hover:bg-red-600" 
                : "bg-gradient-to-br from-sky-600 to-emerald-600 shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105"
            }`}
          >
            {isListening ? (
              <Square className="h-10 w-10 text-slate-900 fill-white" />
            ) : (
              <Mic className="h-12 w-12 text-slate-900" />
            )}
          </button>
        </div>

        {/* Status Text */}
        <div className="h-8 mb-4">
          {isListening && <span className="text-amber-600 font-bold flex items-center gap-2"><Activity className="h-4 w-4 animate-pulse" /> Listening...</span>}
          {isThinking && <span className="text-sky-400 font-bold flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing AI response...</span>}
          {isSpeaking && <span className="text-emerald-400 font-bold flex items-center gap-2"><Volume2 className="h-4 w-4 animate-pulse" /> Agent speaking...</span>}
          {!isListening && !isThinking && !isSpeaking && (
            <span className="text-slate-600 text-sm font-semibold">Tap the mic to start speaking</span>
          )}
        </div>

        {/* Transcript / Conversation UI */}
        <div className="w-full max-w-2xl flex flex-col gap-6 z-10">
          
          {/* User Transcript */}
          {transcript && (
            <div className="flex flex-col items-end gap-1.5 w-full animate-in fade-in slide-in-from-bottom-4">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">You said</span>
              <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl rounded-tr-sm px-5 py-3.5 text-slate-900 text-sm max-w-[85%]">
                "{transcript}"
              </div>
            </div>
          )}

          {/* AI Response */}
          {response && (
            <div className="flex flex-col items-start gap-1.5 w-full animate-in fade-in slide-in-from-bottom-4">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> CarbonIQ Agent
              </span>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 text-slate-700 text-sm leading-relaxed max-w-[90%] shadow-lg">
                {response}
              </div>
              
              {isSpeaking && (
                <button 
                  onClick={stopSpeaking}
                  className="mt-1 text-[10px] text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1"
                >
                  <Square className="h-3 w-3" /> Stop audio
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

