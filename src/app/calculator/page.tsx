"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Car,
  Plane,
  Zap,
  ShoppingBag,
  Leaf,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  Award,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import {
  calculateTransportationEmissions,
  calculateElectricityEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  calculateScoreAndRating,
  calculateTreesEquivalent,
  FoodType,
} from "@/lib/carbonCalculator";

export default function Calculator() {
  const router = useRouter();
  const { data: session, update } = useSession();

  // Active Tab: 0=Transport, 1=Electricity, 2=Food, 3=Waste, 4=Summary
  const [activeStep, setActiveStep] = useState(0);

  // Form States
  const [carDistance, setCarDistance] = useState(250);
  const [bikeDistance, setBikeDistance] = useState(50);
  const [busDistance, setBusDistance] = useState(100);
  const [trainDistance, setTrainDistance] = useState(0);
  const [flightDistance, setFlightDistance] = useState(0); // annual flight km

  const [electricityKwh, setElectricityKwh] = useState(150);

  const [foodType, setFoodType] = useState<FoodType>("mixed");

  const [wasteKg, setWasteKg] = useState(20);

  // Calculating state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  // Intermediate values
  const transportEmissions = calculateTransportationEmissions(
    carDistance,
    bikeDistance,
    busDistance,
    trainDistance,
    flightDistance / 12 // convert annual flight km to monthly equivalent
  );
  const electricityEmissions = calculateElectricityEmissions(electricityKwh);
  const foodEmissions = calculateFoodEmissions(foodType);
  const wasteEmissions = calculateWasteEmissions(wasteKg);

  const totalEmissions = Number(
    (transportEmissions + electricityEmissions + foodEmissions + wasteEmissions).toFixed(1)
  );

  const { score, rating } = calculateScoreAndRating(totalEmissions);
  const treesOffset = calculateTreesEquivalent(Math.max(0, 450 - totalEmissions) * 12);

  const steps = [
    { title: "Transportation", icon: Car },
    { title: "Energy Usage", icon: Zap },
    { title: "Diet habits", icon: ShoppingBag },
    { title: "Waste Output", icon: Leaf },
    { title: "Review & Save", icon: Award },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSave = async () => {
    if (!session) {
      router.push("/register");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/emissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carDistance,
          bikeDistance,
          busDistance,
          trainDistance,
          flightDistance: flightDistance / 12, // save as monthly
          electricityKwh,
          foodType,
          wasteKg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEarnedPoints(data.pointsEarned);
        setStreakDays(data.newStreak);
        setSubmitSuccess(true);
        // Trigger NextAuth token session reload
        update({
          points: data.totalPoints,
          streak: data.newStreak,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Carbon Footprint Calculator</h1>
        <p className="text-slate-500 text-sm mt-1">
          Provide your monthly usage metrics below. We will calculate your equivalent CO₂ footprint.
        </p>
      </div>

      {submitSuccess ? (
        <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-8 flex flex-col items-center text-center gap-6 relative">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-slate-900">Footprint Logged Successfully!</h2>
            <p className="text-slate-500 max-w-md text-sm">
              Your carbon emissions have been recorded on your dashboard. Keep up the consistent tracking!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col items-center">
              <Sparkles className="h-5 w-5 text-emerald-600 mb-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Points Awarded</span>
              <span className="text-xl font-extrabold text-emerald-600">+{earnedPoints} pts</span>
            </div>
            
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col items-center">
              <Flame className="h-5 w-5 text-orange-400 mb-1 fill-orange-400/20" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Current Streak</span>
              <span className="text-xl font-extrabold text-orange-400">{streakDays} Days</span>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm mt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="glow-btn flex-1 bg-gradient-to-r from-emerald-600 to-mint-500 hover:from-emerald-500 hover:to-mint-400 text-slate-900 py-3 rounded-xl font-bold text-sm"
            >
              View Analytics
            </button>
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setActiveStep(0);
              }}
              className="flex-1 border border-slate-200 hover:bg-slate-100 py-3 rounded-xl text-slate-600 font-semibold text-sm"
            >
              Log New Record
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Side: Step Forms */}
          <div className="flex-1 w-full glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            
            {/* Step Progress Indicators */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 overflow-x-auto gap-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const active = idx === activeStep;
                const completed = idx < activeStep;
                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(idx)}
                    className="flex flex-col items-center gap-1.5 focus:outline-none shrink-0"
                  >
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center border text-xs transition-all ${
                        active
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : completed
                          ? "bg-zinc-900 text-slate-600 border-slate-300"
                          : "text-zinc-650 border-slate-200"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-tight capitalize ${
                        active ? "text-emerald-600" : completed ? "text-slate-500" : "text-slate-600"
                      }`}
                    >
                      {step.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: Transportation */}
            {activeStep === 0 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Car className="h-5 w-5 text-emerald-600" />
                  Transportation Commute
                </h3>
                <p className="text-xs text-slate-500 -mt-3">Specify your monthly vehicle distances in kilometers.</p>

                {/* Car Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Gasoline/Diesel Car Driving</span>
                    <span className="text-slate-900">{carDistance} km / month</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={carDistance}
                    onChange={(e) => setCarDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Public-transit alternatives drop this footprint</span>
                    <span>~{(carDistance * 0.18).toFixed(0)} kg CO₂</span>
                  </div>
                </div>

                {/* Bus Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Bus Commuting</span>
                    <span className="text-slate-900">{busDistance} km / month</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="20"
                    value={busDistance}
                    onChange={(e) => setBusDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Shared public transit is highly efficient</span>
                    <span>~{(busDistance * 0.08).toFixed(0)} kg CO₂</span>
                  </div>
                </div>

                {/* Train Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Metro / Train Travel</span>
                    <span className="text-slate-900">{trainDistance} km / month</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    step="50"
                    value={trainDistance}
                    onChange={(e) => setTrainDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500">~{(trainDistance * 0.04).toFixed(0)} kg CO₂</span>
                </div>

                {/* Flights Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Annual Flight Distance (e.g. vacation)</span>
                    <span className="text-slate-900">{flightDistance} km / year</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={flightDistance}
                    onChange={(e) => setFlightDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Flights have extreme greenhouse consequences</span>
                    <span>~{(flightDistance * 0.15).toFixed(0)} kg CO₂ / yr</span>
                  </div>
                </div>

                {/* Bike Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Biking & Walking (Active Transit)</span>
                    <span className="text-slate-900">{bikeDistance} km / month</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={bikeDistance}
                    onChange={(e) => setBikeDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-emerald-600 font-medium">Bicycle transit produces absolutely zero emissions!</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Electricity */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  Electricity Grid Consumption
                </h3>
                <p className="text-xs text-slate-500 -mt-3">Provide your average monthly utility meter usage in kWh.</p>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-350">Grid Power Draw</span>
                    <span className="text-slate-900 font-bold">{electricityKwh} kWh / month</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={electricityKwh}
                    onChange={(e) => setElectricityKwh(Number(e.target.value))}
                    className="w-full h-1.5 bg-white rounded-lg appearance-none cursor-pointer accent-green-500"
                  />

                  <div className="rounded-2xl border border-slate-200 bg-white/20 p-4 mt-2 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-600">Equivalent calculations:</h4>
                    <ul className="text-xs text-slate-500 list-disc list-inside flex flex-col gap-1">
                      <li>Estimated CO₂ generation: <strong className="text-slate-500">{electricityEmissions} kg</strong></li>
                      <li>Calculated at global average grid factor: <strong className="text-slate-500">0.45 kg CO₂ / kWh</strong></li>
                      <li>Switching to solar or LED replacements reduces this immediately.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Food */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-violet-400" />
                  Dietary Habits
                </h3>
                <p className="text-xs text-slate-500 -mt-3">Choose the food profile that closely aligns with your habits.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <button
                    onClick={() => setFoodType("vegetarian")}
                    className={`rounded-2xl border p-5 flex flex-col text-left gap-3 transition-all ${
                      foodType === "vegetarian"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : "bg-slate-900/30 border-slate-800 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-extrabold text-sm block">Vegetarian Diet</span>
                    <span className="text-[11px] text-slate-500">
                      Excludes beef, pork, poultry, and fish. Relies on grains, fruits, vegetables, and legumes.
                    </span>
                    <div className="text-xs font-bold mt-auto pt-2">
                      ~45.8 kg CO₂ / month
                    </div>
                  </button>

                  <button
                    onClick={() => setFoodType("mixed")}
                    className={`rounded-2xl border p-5 flex flex-col text-left gap-3 transition-all ${
                      foodType === "mixed"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : "bg-slate-900/30 border-slate-800 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-extrabold text-sm block">Mixed Diet</span>
                    <span className="text-[11px] text-slate-500">
                      Standard diet containing moderate quantities of poultry, fish, dairy, and occasional red meat.
                    </span>
                    <div className="text-xs font-bold mt-auto pt-2">
                      ~76.3 kg CO₂ / month
                    </div>
                  </button>

                  <button
                    onClick={() => setFoodType("non-vegetarian")}
                    className={`rounded-2xl border p-5 flex flex-col text-left gap-3 transition-all ${
                      foodType === "non-vegetarian"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : "bg-slate-900/30 border-slate-800 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-extrabold text-sm block">High-Meat Diet</span>
                    <span className="text-[11px] text-slate-500">
                      Frequent consumption of beef, lamb, pork, and animal products. High carbon cost.
                    </span>
                    <div className="text-xs font-bold mt-auto pt-2">
                      ~122.0 kg CO₂ / month
                    </div>
                  </button>

                </div>
              </div>
            )}

            {/* TAB CONTENT: Waste */}
            {activeStep === 3 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-amber-400" />
                  Waste Management
                </h3>
                <p className="text-xs text-slate-500 -mt-3">Estimate the total non-recycled waste generated monthly in kg.</p>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-350">Waste Output</span>
                    <span className="text-slate-900 font-bold">{wasteKg} kg / month</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={wasteKg}
                    onChange={(e) => setWasteKg(Number(e.target.value))}
                    className="w-full h-1.5 bg-white rounded-lg appearance-none cursor-pointer accent-green-500"
                  />

                  <div className="text-[10px] text-slate-500 leading-relaxed italic">
                    Note: Municipal solid waste decomposes in landfills creating methane gas. Recycling, composting, and reducing packaging is highly recommended.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Summary Review */}
            {activeStep === 4 && (
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Review Emissions Calculation
                </h3>
                <p className="text-xs text-slate-500 -mt-3">Inspect your monthly sub-totals before logging the record.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="rounded-2xl border border-slate-200 bg-white/20 p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">Transportation Subtotal</span>
                      <span className="text-xs text-zinc-550">Car, transit, and flights</span>
                    </div>
                    <span className="text-base font-black text-slate-900">{transportEmissions} kg</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/20 p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">Electricity Subtotal</span>
                      <span className="text-xs text-zinc-550">Home utility grid draw</span>
                    </div>
                    <span className="text-base font-black text-slate-900">{electricityEmissions} kg</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/20 p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">Food Habits Subtotal</span>
                      <span className="text-xs text-zinc-550">Dietary carbon equivalent</span>
                    </div>
                    <span className="text-base font-black text-slate-900">{foodEmissions} kg</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/20 p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">Waste Subtotal</span>
                      <span className="text-xs text-zinc-550">Landfill emissions factor</span>
                    </div>
                    <span className="text-base font-black text-slate-900">{wasteEmissions} kg</span>
                  </div>

                </div>

                {!session && (
                  <div className="flex gap-2.5 items-start rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 mt-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900 block">Not Logged In</span>
                      Register or Sign In to save this monthly footprint to your dashboard history, earn +50 eco-points, and compete on the leaderboard.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {activeStep === steps.length - 1 ? (
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="glow-btn flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-mint-500 hover:from-emerald-500 hover:to-mint-400 text-slate-900 px-6 py-2.5 text-xs font-black shadow-lg shadow-emerald-500/10"
                >
                  {isSubmitting
                    ? "Saving..."
                    : session
                    ? "Save to Dashboard"
                    : "Register to Save"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 px-5 py-2.5 text-xs font-semibold hover:bg-emerald-500/20"
                >
                  Next Section
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>

          {/* Right Side: Live Calculation Widget */}
          <div className="w-full lg:w-80 glass-panel rounded-3xl p-6 flex flex-col gap-6 sticky top-24">
            
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Live Footprint</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Calculated Impact</h3>
            </div>

            {/* Score circle */}
            <div className="flex flex-col items-center justify-center relative py-4">
              <div className="h-28 w-28 rounded-full border-4 border-slate-200 flex flex-col items-center justify-center relative">
                
                {/* Visual indicator ring based on score */}
                <div
                  className={`absolute inset-0 rounded-full border-4 ${
                    score >= 75
                      ? "border-emerald-500/40"
                      : score >= 40
                      ? "border-amber-500/40"
                      : "border-red-500/40"
                  } -m-1`}
                  style={{ clipPath: `polygon(0 0, 100% 0, 100% ${score}%, 0 ${score}%)` }}
                />

                <span className="text-3xl font-black text-slate-900">{score}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Eco Score</span>
              </div>
              
              <span
                className={`mt-4 rounded-full px-3 py-1 text-xs font-black border ${
                  rating === "Low Impact"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    : rating === "Moderate Impact"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {rating}
              </span>
            </div>

            {/* Data grid */}
            <div className="flex flex-col gap-3 mt-2">
              
              <div className="flex justify-between items-center text-xs font-semibold py-2 border-b border-slate-200">
                <span className="text-zinc-550 flex items-center gap-1.5">Total Emissions</span>
                <span className="text-slate-900 font-bold">{totalEmissions} kg CO₂ / mo</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold py-2 border-b border-slate-200">
                <span className="text-zinc-550">Annualized Footprint</span>
                <span className="text-slate-900">{(totalEmissions * 12).toFixed(0)} kg CO₂</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold py-2">
                <span className="text-zinc-550 flex items-center gap-1">Trees Needed (Offset)</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  {treesOffset} Trees 🌳
                </span>
              </div>

            </div>

            {/* Micro-insight */}
            <div className="rounded-2xl bg-white/20 border border-slate-200 p-4 mt-2 flex items-start gap-2 text-[11px] text-slate-500">
              <TrendingDown className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                CarbonIQ users targeting an eco score above <strong className="text-slate-300">75</strong> save over 1.2 tonnes of carbon annually.
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

