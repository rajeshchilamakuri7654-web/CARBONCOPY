"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, HelpCircle, Eye, Star, X, Check, Leaf, Heart, Globe } from "lucide-react";

const ECO_TRIVIA = [
  {
    fact: "If food waste were a country, it would be the third-largest greenhouse gas emitter in the world, right after China and the USA.",
    source: "UN Food and Agriculture Organization",
  },
  {
    fact: "A single mature tree absorbs roughly 22 kg of carbon dioxide from the atmosphere every year, returning oxygen in exchange.",
    source: "European Environment Agency",
  },
  {
    fact: "Lighting accounts for around 15% of global electricity use. Shifting completely to LEDs immediately halves that carbon overhead.",
    source: "International Energy Agency",
  },
  {
    fact: "Commuting by bicycle instead of a passenger car just once a week drops your travel carbon footprint by nearly 200 kg annually.",
    source: "Environmental Protection Agency",
  },
];

export default function EducationHub() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  // Trivia states
  const [triviaIndex, setTriviaIndex] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/education");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
        setFilteredArticles(data.articles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (category: string) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter((art) => art.category.toLowerCase() === category.toLowerCase()));
    }
  };

  const handleOpenArticle = async (art: any) => {
    setActiveArticle(art);
    // increment read count on backend
    try {
      await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: art.id }),
      });
      // Update local read count
      setArticles(prev => prev.map(a => a.id === art.id ? { ...a, reads: a.reads + 1 } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ["All", "General", "Energy", "Food", "Transport"];

  return (
    <div className="flex flex-col gap-10 py-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-indigo-400" />
          Sustainability Education Hub
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Expand your environmental awareness. Read vetted sustainability guides and discover quick ecological facts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Articles Feed */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-900">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border shrink-0 ${
                  activeCategory === cat
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                    : "bg-zinc-950/20 border-zinc-900 text-zinc-450 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleOpenArticle(art)}
                  className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase text-indigo-400">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-zinc-550 flex items-center gap-1 font-bold">
                        <Eye className="h-3 w-3" />
                        {art.reads} Reads
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors leading-tight">
                      {art.title}
                    </h3>
                    
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-900/50">
                    <span className="text-[10px] text-violet-400 font-extrabold flex items-center gap-1">
                      <Star className="h-3 w-3 text-violet-400 fill-violet-400/20" />
                      +{art.carbonSaved} kg CO₂ saved / guide
                    </span>
                    <span className="text-zinc-500 text-[9px] font-bold">
                      {new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-550 text-xs italic">
              No articles found in this category.
            </div>
          )}
        </div>

        {/* Right Side: Trivia Carousel Widget */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          
          <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl" />
            
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-indigo-400" />
              Eco-Trivia Corner
            </h3>

            <div className="flex flex-col gap-4 min-h-[160px] justify-between">
              <p className="text-xs text-zinc-350 leading-relaxed">
                "{ECO_TRIVIA[triviaIndex].fact}"
              </p>
              
              <div className="flex justify-between items-center border-t border-zinc-900 pt-3">
                <span className="text-[9px] text-zinc-500 font-bold max-w-[150px] truncate">
                  Source: {ECO_TRIVIA[triviaIndex].source}
                </span>
                
                <button
                  onClick={() => setTriviaIndex((triviaIndex + 1) % ECO_TRIVIA.length)}
                  className="text-[9px] font-extrabold text-indigo-400 hover:text-indigo-300"
                >
                  Next Fact
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 flex flex-col gap-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Global Goal</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Achieving the Paris Agreement targets requires personal lifestyles to average under 2.0 tonnes of CO2 emissions annually by 2050. CarbonIQ is built to guide this transition.
            </p>
          </div>

        </div>

      </div>

      {/* ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel rounded-3xl max-h-[85vh] overflow-y-auto flex flex-col relative">
            
            {/* Header / Banner */}
            <div className="sticky top-0 z-10 w-full bg-[#0c0f0d]/90 backdrop-blur px-6 py-4 border-b border-zinc-900 flex justify-between items-center">
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase text-indigo-400">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                {activeArticle.title}
              </h2>
              
              <div className="text-xs text-zinc-500 flex gap-4 font-bold border-b border-zinc-950 pb-4">
                <span>Reads: {activeArticle.reads}</span>
                <span>Category: {activeArticle.category}</span>
                <span className="text-violet-400">Est. Savings: {activeArticle.carbonSaved} kg CO₂</span>
              </div>

              {/* Render article body paragraph by paragraph */}
              <div className="text-xs md:text-sm text-zinc-350 leading-relaxed flex flex-col gap-4">
                {activeArticle.content.split("\n\n").map((para: string, pIdx: number) => {
                  if (para.startsWith("###")) {
                    return (
                      <h3 key={pIdx} className="text-sm md:text-base font-bold text-white mt-4 border-b border-zinc-900 pb-1.5">
                        {para.replace("###", "").trim()}
                      </h3>
                    );
                  }
                  if (para.startsWith("- **")) {
                    return (
                      <ul key={pIdx} className="list-disc list-inside pl-2 flex flex-col gap-2 my-2">
                        {para.split("\n").map((line, lIdx) => {
                          const boldHeader = line.match(/\*\*(.*?)\*\*/)?.[1] || "";
                          const cleanText = line.replace(/^\s*-?\s*\*\*/, "").replace(/\*\*/, "");
                          return (
                            <li key={lIdx} className="text-zinc-350 pl-1">
                              {boldHeader && <strong className="text-white font-bold">{boldHeader}:</strong>}
                              {cleanText.replace(boldHeader, "").replace(/^:\s*/, "")}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  if (para.startsWith("1. **")) {
                    return (
                      <ol key={pIdx} className="list-decimal list-inside pl-2 flex flex-col gap-2 my-2">
                        {para.split("\n").map((line, lIdx) => {
                          const boldHeader = line.match(/\*\*(.*?)\*\*/)?.[1] || "";
                          const cleanText = line.replace(/^\s*\d+\.\s*\*\*/, "").replace(/\*\*/, "");
                          return (
                            <li key={lIdx} className="text-zinc-350 pl-1">
                              {boldHeader && <strong className="text-white font-bold">{boldHeader}:</strong>}
                              {cleanText.replace(boldHeader, "").replace(/^:\s*/, "")}
                            </li>
                          );
                        })}
                      </ol>
                    );
                  }
                  return <p key={pIdx}>{para}</p>;
                })}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 w-full bg-[#0c0f0d]/90 backdrop-blur px-6 py-4 border-t border-zinc-900 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">Earn point updates by logging actions on dashboard.</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="glow-btn bg-indigo-500 text-black font-extrabold rounded-xl px-5 py-2"
              >
                I Understand, Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
