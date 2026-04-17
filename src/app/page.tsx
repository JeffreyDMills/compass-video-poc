"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload, Sparkles, Play, Pause, Share2, CheckCircle, AlertTriangle,
  ChevronRight, Music, RotateCcw, Type, Image as ImageIcon,
  Download, ExternalLink, X, Camera, Star, Zap, Clock, Copy, Code,
  ArrowRight, Eye, Volume2, VolumeX
} from "lucide-react";

// ─── AMBIENT MUSIC ENGINE (Web Audio API) ───
// Generates vibe-matched ambient soundscapes using pure Web Audio — no external files needed
class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private vibeId: string = "";

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0;
      this.gainNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private createPad(freq: number, type: OscillatorType, gainVal: number, detuneVal: number = 0) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detuneVal;

    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 1;

    oscGain.gain.value = gainVal;

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.gainNode!);
    osc.start();

    this.oscillators.push(osc);

    // Slow LFO on filter for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05 + Math.random() * 0.1;
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.oscillators.push(lfo);
  }

  play(vibeId: string) {
    if (this.isPlaying && this.vibeId === vibeId) return;
    this.stop();

    const ctx = this.getCtx();
    if (ctx.state === "suspended") ctx.resume();

    this.vibeId = vibeId;
    this.isPlaying = true;

    // Vibe-specific chord voicings and timbres
    const vibeConfigs: Record<string, { notes: number[]; type: OscillatorType; filterFreq?: number }> = {
      luxury:  { notes: [130.81, 196.00, 261.63, 329.63, 392.00], type: "sine" },       // C major spread — warm orchestral
      modern:  { notes: [110.00, 164.81, 220.00, 329.63, 440.00], type: "triangle" },    // Am9 — cool electronic
      warm:    { notes: [146.83, 220.00, 293.66, 369.99, 440.00], type: "sine" },         // D major — warm acoustic
      coastal: { notes: [174.61, 261.63, 349.23, 440.00, 523.25], type: "sine" },         // F major — bright airy
      urban:   { notes: [98.00, 146.83, 196.00, 293.66, 392.00], type: "sawtooth" },      // G minor — deep moody
      classic: { notes: [130.81, 164.81, 196.00, 261.63, 329.63], type: "sine" },         // C/E — elegant piano-like
    };

    const config = vibeConfigs[vibeId] || vibeConfigs.luxury;

    config.notes.forEach((freq, i) => {
      this.createPad(freq, config.type, 0.06 - i * 0.008, (Math.random() - 0.5) * 15);
    });

    // Fade in
    this.gainNode!.gain.setValueAtTime(0, ctx.currentTime);
    this.gainNode!.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    }

    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      this.oscillators = [];
    }, 600);
  }

  setVolume(v: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.1);
    }
  }

  get playing() { return this.isPlaying; }

  dispose() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton music engine
let musicEngine: AmbientMusicEngine | null = null;
function getMusicEngine(): AmbientMusicEngine {
  if (!musicEngine) musicEngine = new AmbientMusicEngine();
  return musicEngine;
}

// ─── COMPASS LOGO SVG (from compass.com) ───
function CompassLogo({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 16" fill={color}>
      <title>Compass</title>
      <path d="M53,.457,45,11.314,37,.457V15h2V6.543l6,8.143,6-8.143V15h2ZM60,15H58V1h6.5a4.5,4.5,0,0,1,0,9H60Zm0-7h4.5a2.5,2.5,0,0,0,0-5H60Zm22.863,7h2.275L77.5.9,69.863,15h2.275l1.625-3h7.475Zm-8.018-5L77.5,5.1,80.155,10ZM97,11.085c0,2.371-2.175,4.16-5.06,4.16a6.494,6.494,0,0,1-4.878-2.355l1.41-1.375A4.494,4.494,0,0,0,91.94,13.29c1.8,0,3.06-.906,3.06-2.2,0-1.11-.756-1.856-2.31-2.283L91,8.42c-3.6-.884-3.6-3.043-3.6-3.753,0-2.232,1.8-3.732,4.485-3.732a6.1,6.1,0,0,1,4.581,2.05l-1.41,1.378a4.629,4.629,0,0,0-3.171-1.472c-1.579,0-2.485.647-2.485,1.777,0,.337.128,1.462,1.773,1.816l1.533.345C95.516,7.487,97,8.96,97,11.085Zm14,0c0,2.371-2.175,4.16-5.06,4.16a6.494,6.494,0,0,1-4.878-2.355l1.41-1.375a4.494,4.494,0,0,0,3.468,1.775c1.8,0,3.06-.906,3.06-2.2,0-1.11-.756-1.856-2.31-2.283L105,8.42c-3.6-.884-3.6-3.043-3.6-3.753,0-2.232,1.8-3.732,4.485-3.732a6.1,6.1,0,0,1,4.581,2.05l-1.41,1.378a4.629,4.629,0,0,0-3.171-1.472c-1.579,0-2.485.647-2.485,1.777,0,.337.128,1.462,1.773,1.816l1.533.345C109.516,7.487,111,8.96,111,11.085Zm-98.611.8h0a5.5,5.5,0,1,1,0-7.778h0l.354.354L14.157,3.05,13.8,2.7h0a7.5,7.5,0,1,0,0,10.607l0,0h0l.354-.353-1.414-1.415ZM25.5.5A7.5,7.5,0,1,0,33,8,7.5,7.5,0,0,0,25.5.5Zm0,13A5.5,5.5,0,1,1,31,8,5.5,5.5,0,0,1,25.5,13.5Zm3.207-7.293L27.293,4.793l-5,5,1.414,1.414Z" />
    </svg>
  );
}

// ─── TYPES ───
interface ListingPhoto {
  id: string;
  url: string;
  room: string;
  quality: number;
  status: "good" | "warning";
}

interface Vibe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  musicLabel: string;
  thumbnail: string;
}

// ─── LISTING DATA (realistic Compass listing) ───
const LISTING = {
  address: "1247 Coast Village Road",
  city: "Montecito",
  state: "CA",
  zip: "93108",
  price: "$4,895,000",
  beds: 5,
  baths: 4,
  sqft: "4,280",
  lot: "0.42 acres",
  yearBuilt: 2019,
  mls: "24-3847",
  type: "Single Family",
  description: "An exquisite Mediterranean estate nestled in the hills of Montecito with sweeping ocean views, resort-style pool, and chef's kitchen with La Cornue range.",
};

// ─── AGENT DATA (realistic Compass agent profile) ───
const AGENT = {
  name: "Victoria Chen",
  title: "Licensed Associate Real Estate Broker",
  team: "The Chen Group",
  phone: "(805) 555-0142",
  email: "victoria.chen@compass.com",
  photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  license: "DRE #02087541",
  office: "Compass · Montecito",
  transactions: "127 transactions",
  volume: "$284M career volume",
};

// ─── PRE-LOADED LISTING PHOTOS (Unsplash - free to use) ───
const DEMO_PHOTOS: ListingPhoto[] = [
  { id: "p1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", room: "Front Exterior", quality: 9.4, status: "good" },
  { id: "p2", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", room: "Living Room", quality: 9.1, status: "good" },
  { id: "p3", url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80", room: "Kitchen", quality: 8.8, status: "good" },
  { id: "p4", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", room: "Dining Room", quality: 9.2, status: "good" },
  { id: "p5", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80", room: "Primary Bedroom", quality: 8.5, status: "good" },
  { id: "p6", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", room: "Bathroom", quality: 7.9, status: "warning" },
  { id: "p7", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", room: "Second Bedroom", quality: 8.7, status: "good" },
  { id: "p8", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", room: "Pool & Backyard", quality: 9.3, status: "good" },
];

// ─── CONSTANTS ───
const VIBES: Vibe[] = [
  { id: "luxury", name: "Luxury", emoji: "✨", description: "Slow pans, golden tones, orchestral strings", color: "#B8860B", musicLabel: "Cinematic Orchestra", thumbnail: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=200&q=60" },
  { id: "modern", name: "Modern", emoji: "🏙️", description: "Clean cuts, cool tones, electronic ambient", color: "#0064E5", musicLabel: "Electronic Ambient", thumbnail: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=200&q=60" },
  { id: "warm", name: "Warm & Inviting", emoji: "🏡", description: "Gentle motion, warm light, acoustic guitar", color: "#D4760A", musicLabel: "Acoustic Warmth", thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=60" },
  { id: "coastal", name: "Coastal", emoji: "🌊", description: "Airy drift, bright tones, ambient waves", color: "#0088CC", musicLabel: "Ocean Breeze", thumbnail: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&q=60" },
  { id: "urban", name: "Urban Loft", emoji: "🏢", description: "Dynamic angles, deep bass, industrial chic", color: "#6B4C9A", musicLabel: "Deep Urban", thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=60" },
  { id: "classic", name: "Classic Elegance", emoji: "🎻", description: "Timeless pacing, rich tones, piano melody", color: "#2E7D32", musicLabel: "Piano Sonata", thumbnail: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=200&q=60" },
];

const PROCESSING_STEPS = [
  { label: "Analyzing image composition & quality", icon: "🔍", duration: 1800 },
  { label: "Classifying rooms with vision AI", icon: "🏠", duration: 1400 },
  { label: "Generating depth maps for parallax", icon: "📐", duration: 2200 },
  { label: "Creating Ken Burns motion paths", icon: "🎬", duration: 2800 },
  { label: "Sequencing narrative flow", icon: "📖", duration: 1200 },
  { label: "Matching music to vibe profile", icon: "🎵", duration: 900 },
  { label: "Compositing HD video frames", icon: "🎞️", duration: 2400 },
  { label: "Applying Compass brand template", icon: "🎨", duration: 1100 },
  { label: "Running final quality check", icon: "✅", duration: 1200 },
];

// ─── ANIMATED NUMBER ───
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1200;
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value * 10) / 10);
        if (progress >= 1) clearInterval(interval);
      }, 30);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return <>{display.toFixed(1)}</>;
}

// ─── STEP INDICATOR ───
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
            i === current
              ? "bg-[#0064E5] text-white scale-105"
              : i < current
              ? "bg-[#0064E5]/10 text-[#0064E5]"
              : "bg-gray-100 text-gray-400"
          }`}>
            {i < current ? <CheckCircle size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={14} className={`transition-colors duration-300 ${i < current ? "text-[#0064E5]/40" : "text-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── HEADER ───
function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CompassLogo className="h-4 w-auto" color="#000000" />
          <div className="w-px h-5 bg-gray-200" />
          <div className="text-sm font-medium text-gray-500">Video Studio</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Zap size={12} className="text-[#0064E5]" />
          <span>AI-Powered</span>
          <span className="text-gray-200">|</span>
          <span>POC v0.2</span>
        </div>
      </div>
    </header>
  );
}

// ─── STEP 1: UPLOAD (with pre-loaded demo) ───
function UploadStep({ images, setImages, onNext }: {
  images: ListingPhoto[];
  setImages: (imgs: ListingPhoto[]) => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [analyzingIdx, setAnalyzingIdx] = useState(-1);

  const loadDemoPhotos = () => {
    setLoading(true);
    setAnalyzingIdx(0);

    // Simulate photos loading one by one
    DEMO_PHOTOS.forEach((photo, i) => {
      setTimeout(() => {
        setImages(DEMO_PHOTOS.slice(0, i + 1));
        setAnalyzingIdx(i);
        if (i === DEMO_PHOTOS.length - 1) {
          setTimeout(() => {
            setLoading(false);
            setLoaded(true);
            setAnalyzingIdx(-1);
          }, 600);
        }
      }, i * 350);
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Listing Photos</h2>
        <p className="text-gray-500 text-sm">Upload 6–12 photos. AI will score quality and classify each room.</p>
      </div>

      {/* Drop zone / Demo loader */}
      {images.length === 0 && !loading ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center mb-6">
          <Upload size={32} className="mx-auto mb-3 text-[#0064E5]" />
          <p className="text-sm text-gray-600 mb-1">Drag & drop photos here, or click to browse</p>
          <p className="text-xs text-gray-400 mb-6">JPG, PNG, HEIC — max 20MB per image</p>
          <button
            onClick={loadDemoPhotos}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0064E5] text-white rounded-lg text-sm font-medium hover:bg-[#0049A8] transition-colors shadow-sm"
          >
            <Zap size={14} />
            Load Demo Listing — {LISTING.address}
          </button>
          <div className="mt-3 inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <img src={AGENT.photo} alt={AGENT.name} className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left">
              <div className="text-xs font-medium text-gray-700">{AGENT.name} · {AGENT.team}</div>
              <div className="text-[10px] text-gray-400">{LISTING.address}, {LISTING.city}, {LISTING.state} · MLS #{LISTING.mls}</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Image grid with staggered load animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-in"
                style={{
                  animation: `fadeSlideIn 0.4s ease-out ${i * 0.08}s both`,
                }}
              >
                <div className="relative">
                  <img src={img.url} alt={img.room} className="w-full h-36 object-cover" />
                  {analyzingIdx === i && loading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <div className="w-3 h-3 border-2 border-[#0064E5] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-medium text-gray-700">Analyzing...</span>
                      </div>
                    </div>
                  )}
                  {analyzingIdx > i || !loading ? (
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                        img.status === "good" ? "bg-green-500/90 text-white" : "bg-amber-500/90 text-white"
                      }`}>
                        <Star size={8} fill="currentColor" />
                        {img.quality}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{img.room}</span>
                    {img.status === "good" && (analyzingIdx > i || !loading) && (
                      <CheckCircle size={12} className="text-green-500" />
                    )}
                    {img.status === "warning" && (analyzingIdx > i || !loading) && (
                      <AlertTriangle size={12} className="text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Analysis summary */}
          {loaded && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-4"
              style={{ animation: "fadeSlideIn 0.4s ease-out" }}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-green-800">All 8 photos analyzed</div>
                <div className="text-xs text-green-600">Average quality: 8.9/10 — Excellent. All rooms classified. Ready for video generation.</div>
              </div>
              <div className="ml-auto text-right flex-shrink-0">
                <div className="text-2xl font-bold text-green-700">8.9</div>
                <div className="text-[9px] text-green-500 uppercase tracking-wider">Avg Score</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MLS sync hint */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Connected to MLS — photos auto-sync when listing is published
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <button
          disabled={images.length < 3 || loading}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            images.length >= 3 && !loading
              ? "bg-[#0064E5] text-white hover:bg-[#0049A8] shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Choose Vibe <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: VIBE SELECT ───
function VibeStep({ selectedVibe, setSelectedVibe, onNext, onBack, suggestedVibe }: {
  selectedVibe: string | null;
  setSelectedVibe: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  suggestedVibe: string;
}) {
  const [previewVibe, setPreviewVibe] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Vibe</h2>
        <p className="text-gray-500 text-sm">
          AI analyzed your photos and suggests: <span className="text-[#0064E5] font-medium">{VIBES.find(v => v.id === suggestedVibe)?.name} {VIBES.find(v => v.id === suggestedVibe)?.emoji}</span>
          <span className="text-gray-400 ml-1">— best match for luxury properties</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {VIBES.map((vibe, i) => (
          <button
            key={vibe.id}
            onClick={() => setSelectedVibe(vibe.id)}
            onMouseEnter={() => setPreviewVibe(vibe.id)}
            onMouseLeave={() => setPreviewVibe(null)}
            className={`relative p-5 rounded-xl text-left transition-all duration-200 border overflow-hidden ${
              selectedVibe === vibe.id
                ? "border-2 shadow-lg ring-1 ring-opacity-20"
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            style={{
              borderColor: selectedVibe === vibe.id ? vibe.color : undefined,
              // @ts-ignore — Tailwind ring color via CSS variable
              '--tw-ring-color': selectedVibe === vibe.id ? vibe.color : undefined,
              animation: `fadeSlideIn 0.3s ease-out ${i * 0.06}s both`,
            } as React.CSSProperties}
          >
            {/* Thumbnail preview */}
            <div className="absolute inset-0 opacity-[0.04]">
              <img src={vibe.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative">
              {vibe.id === suggestedVibe && (
                <div className="absolute -top-2 -right-2 bg-[#0064E5] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap size={8} /> AI Pick
                </div>
              )}
              {selectedVibe === vibe.id && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: vibe.color }}>
                  <CheckCircle size={12} className="text-white" />
                </div>
              )}
              <div className="text-2xl mb-2">{vibe.emoji}</div>
              <div className="font-semibold text-sm text-gray-900 mb-1">{vibe.name}</div>
              <div className="text-[11px] text-gray-500 leading-relaxed">{vibe.description}</div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400">
                <Music size={10} />
                {vibe.musicLabel}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Vibe preview strip */}
      {(selectedVibe || previewVibe) && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-4"
          style={{ animation: "fadeSlideIn 0.3s ease-out" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Eye size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview — {VIBES.find(v => v.id === (previewVibe || selectedVibe))?.name}</span>
          </div>
          <div className="flex gap-2 overflow-hidden rounded-lg">
            {DEMO_PHOTOS.slice(0, 4).map((photo, i) => (
              <div key={photo.id} className="flex-1 h-20 rounded-md overflow-hidden relative">
                <img src={photo.url} alt={photo.room} className={`w-full h-full object-cover ${
                  (previewVibe || selectedVibe) === "luxury" ? "saturate-[1.1] brightness-[1.05]" :
                  (previewVibe || selectedVibe) === "modern" ? "saturate-[0.8] contrast-[1.1]" :
                  (previewVibe || selectedVibe) === "warm" ? "saturate-[1.3] sepia-[0.15]" :
                  (previewVibe || selectedVibe) === "coastal" ? "brightness-[1.1] saturate-[1.1]" :
                  (previewVibe || selectedVibe) === "urban" ? "contrast-[1.15] brightness-[0.95]" :
                  "saturate-[0.9] brightness-[1.02]"
                } transition-all duration-500`} />
                <div className="absolute bottom-1 left-1 text-[8px] text-white font-medium bg-black/40 backdrop-blur-sm px-1 rounded">{photo.room}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </button>
        <button
          disabled={!selectedVibe}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            selectedVibe
              ? "bg-[#0064E5] text-white hover:bg-[#0049A8] shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Sparkles size={16} />
          Generate Video
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: PROCESSING (enhanced) ───
function ProcessingStep({ onComplete, images }: { onComplete: () => void; images: ListingPhoto[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    // Rotate preview photos
    const photoInterval = setInterval(() => {
      setCurrentPhoto(p => (p + 1) % images.length);
    }, 2000);
    return () => clearInterval(photoInterval);
  }, [images.length]);

  useEffect(() => {
    if (currentStep >= PROCESSING_STEPS.length) {
      setTimeout(onComplete, 800);
      return;
    }
    const step = PROCESSING_STEPS[currentStep];
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setProgress(((currentStep + 1) / PROCESSING_STEPS.length) * 100);
    }, step.duration);
    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Processing hero */}
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Rotating photo preview */}
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.room}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === currentPhoto ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          {/* Scanning overlay */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="scan-line" />
          </div>
          {/* Pulsing ring */}
          <div className="absolute -inset-2 rounded-2xl border-2 border-[#0064E5]/30 pulse-glow" />
          {/* AI badge */}
          <div className="absolute -bottom-2 -right-2 bg-[#0064E5] text-white rounded-full p-2 shadow-lg">
            <Sparkles size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Video</h2>
        <p className="text-gray-400 text-sm">AI is analyzing {images.length} photos and creating cinematic motion</p>
      </div>

      {/* Big progress bar */}
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span>{currentStep < PROCESSING_STEPS.length ? PROCESSING_STEPS[currentStep]?.label : "Complete!"}</span>
        <span className="font-mono">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0064E5] to-[#0088CC] rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-1.5">
        {PROCESSING_STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
              i === currentStep ? "bg-blue-50 shadow-sm" :
              i < currentStep ? "opacity-50" : "opacity-20"
            }`}
          >
            <span className="text-base w-6 text-center">{step.icon}</span>
            <span className={`text-sm flex-1 ${i === currentStep ? "text-gray-900 font-medium" : "text-gray-600"}`}>
              {step.label}
            </span>
            {i < currentStep && <CheckCircle size={14} className="text-green-500" />}
            {i === currentStep && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#0064E5] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ETA */}
      <div className="text-center mt-6">
        <p className="text-[10px] text-gray-300">In production this takes 3–5 minutes. Demo is accelerated.</p>
      </div>
    </div>
  );
}

// ─── STEP 4: PREVIEW (cinematic video player) ───
function PreviewStep({ images, vibe, onNext, onBack }: {
  images: ListingPhoto[];
  vibe: Vibe;
  onNext: () => void;
  onBack: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentClip, setCurrentClip] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipDuration = 5; // seconds per clip
  const totalDuration = images.length * clipDuration;
  const [transitionClass, setTransitionClass] = useState("");

  // Music engine integration
  useEffect(() => {
    const engine = getMusicEngine();
    if (playing && !muted) {
      engine.play(vibe.id);
    } else {
      engine.stop();
    }
    return () => { engine.stop(); };
  }, [playing, muted, vibe.id]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => !m);
  };

  // Auto-hide controls
  useEffect(() => {
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 2000);
    } else {
      setShowControls(true);
    }
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  }, [playing, currentClip]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 0.05;
          if (next >= totalDuration) {
            setPlaying(false);
            return 0;
          }
          const newClip = Math.floor(next / clipDuration) % images.length;
          if (newClip !== Math.floor(e / clipDuration) % images.length) {
            // Trigger crossfade transition
            setTransitionClass("crossfade-out");
            setTimeout(() => {
              setCurrentClip(newClip);
              setTransitionClass("crossfade-in");
            }, 300);
          }
          return next;
        });
      }, 50);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, totalDuration, images.length, clipDuration]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const jumpTo = (clipIdx: number) => {
    setCurrentClip(clipIdx);
    setElapsed(clipIdx * clipDuration);
    setTransitionClass("crossfade-in");
  };

  return (
    <div className="max-w-5xl mx-auto" style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Edit</h2>
        <p className="text-gray-500 text-sm">Your cinematic listing video is ready. Play it, tweak it, then share.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player */}
        <div className="lg:col-span-2">
          <div
            className="bg-black rounded-xl overflow-hidden relative aspect-video shadow-xl cursor-pointer group"
            onClick={() => setPlaying(!playing)}
            onMouseMove={() => { setShowControls(true); if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); controlsTimerRef.current = setTimeout(() => { if (playing) setShowControls(false); }, 2000); }}
          >
            {/* All images stacked for crossfade */}
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.room}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  i === currentClip ? `opacity-100 ${playing ? `parallax-${i % 4}` : ""}` : "opacity-0"
                } ${i === currentClip ? transitionClass : ""}`}
              />
            ))}

            {/* Vignette overlay */}
            <div className="absolute inset-0 vignette-overlay pointer-events-none" />

            {/* Brand overlay - top */}
            <div className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-60"}`}>
              <CompassLogo className="h-3 w-auto" color="#FFFFFF" />
            </div>

            {/* Listing info overlay - bottom */}
            <div className={`absolute bottom-14 left-4 right-4 transition-opacity duration-500 ${showControls || !playing ? "opacity-100" : "opacity-80"}`}>
              <div className="text-xl font-bold text-white drop-shadow-lg tracking-tight">{LISTING.address}</div>
              <div className="text-sm text-white/80 drop-shadow flex items-center gap-2 mt-0.5">
                {LISTING.price} <span className="text-white/40">·</span> {LISTING.beds} BD <span className="text-white/40">·</span> {LISTING.baths} BA <span className="text-white/40">·</span> {LISTING.sqft} SF
              </div>
            </div>

            {/* Room label */}
            {playing && (
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
                {images[currentClip]?.room}
              </div>
            )}

            {/* Play/Pause button */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              !playing || showControls ? "opacity-100" : "opacity-0"
            }`}>
              {!playing ? (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 shadow-2xl">
                  <Play size={28} fill="white" className="text-white ml-1" />
                </div>
              ) : showControls ? (
                <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pause size={20} fill="white" className="text-white" />
                </div>
              ) : null}
            </div>

            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent flex items-end px-3 pb-2.5 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
              <div className="flex-1 h-1 bg-white/20 rounded-full mr-3 cursor-pointer relative" onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; setElapsed(pct * totalDuration); setCurrentClip(Math.floor(pct * images.length)); }}>
                <div className="h-full bg-[#0064E5] rounded-full transition-all duration-100" style={{ width: `${(elapsed / totalDuration) * 100}%` }} />
                {/* Clip markers */}
                {images.map((_, i) => i > 0 && (
                  <div key={i} className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2.5 bg-white/30" style={{ left: `${(i / images.length) * 100}%` }} />
                ))}
              </div>
              <span className="text-[10px] text-white/70 font-mono tabular-nums">{formatTime(elapsed)} / {formatTime(totalDuration)}</span>
            </div>

            {/* Music control */}
            {playing && (
              <button
                onClick={toggleMute}
                className="absolute bottom-12 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1.5 hover:bg-black/60 transition-colors cursor-pointer"
              >
                {muted ? (
                  <VolumeX size={11} className="text-white/60" />
                ) : (
                  <>
                    <Volume2 size={11} className="text-white/80" />
                    <div className="flex items-end gap-[2px]">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-[2px] bg-white/70 rounded-full music-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Timeline</div>
              <div className="text-[10px] text-gray-300">{images.length} clips · {formatTime(totalDuration)} total</div>
            </div>
            <div className="flex gap-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => jumpTo(i)}
                  className={`relative flex-1 h-14 rounded-md overflow-hidden transition-all ${
                    i === currentClip ? "ring-2 ring-[#0064E5] ring-offset-1 scale-[1.02]" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.room} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-1 text-[8px] font-medium text-white">{img.room.split(" ").pop()}</span>
                  {i === currentClip && playing && (
                    <div className="absolute top-1 left-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Edit panel */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Video Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Vibe</label>
                <div className="mt-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span>{vibe.emoji}</span>
                  <span className="text-sm text-gray-700">{vibe.name}</span>
                  <span className="ml-auto text-[10px] text-[#0064E5] font-medium cursor-pointer hover:underline">Change</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Music</label>
                <div className="mt-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Music size={14} className="text-[#0064E5]" />
                  <span className="text-sm text-gray-700">{vibe.musicLabel}</span>
                  <span className="ml-auto text-[10px] text-[#0064E5] font-medium cursor-pointer hover:underline">Change</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Listing Info</label>
                <div className="mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <div className="text-gray-700 font-medium">{LISTING.address}</div>
                  <div className="text-gray-400 text-xs">{LISTING.price} · {LISTING.city}, {LISTING.state} · MLS #{LISTING.mls}</div>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Agent</label>
                <div className="mt-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <img src={AGENT.photo} alt={AGENT.name} className="w-6 h-6 rounded-full object-cover" />
                  <div>
                    <div className="text-xs text-gray-700 font-medium">{AGENT.name}</div>
                    <div className="text-[9px] text-gray-400">{AGENT.office}</div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Duration</label>
                <div className="mt-1 flex items-center gap-3">
                  {["0:30", "0:45", "1:00", "1:30"].map(d => (
                    <button key={d} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${d === "0:40" ? "bg-[#0064E5] text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: RotateCcw, label: "Regenerate" },
                { icon: Music, label: "Swap Music" },
                { icon: Type, label: "Edit Text" },
                { icon: ImageIcon, label: "Swap Shot" },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all">
                  <action.icon size={14} className="text-gray-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quality Score</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-green-600"><AnimatedNumber value={9.2} /></div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Excellent quality<br />
                No artifacts detected<br />
                Brand compliant ✓
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Composition", score: 9.4 },
                { label: "Motion", score: 9.1 },
                { label: "Color", score: 9.0 },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-sm font-bold text-gray-700">{item.score}</div>
                  <div className="text-[9px] text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Regenerate
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm bg-[#0064E5] text-white hover:bg-[#0049A8] shadow-sm transition-all hover:shadow-md"
        >
          <CheckCircle size={16} />
          Approve & Share
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5: SHARE (enhanced) ───
function ShareStep({ images, onRestart }: { images: ListingPhoto[]; onRestart: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [published, setPublished] = useState<string[]>([]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePublish = (name: string) => {
    setPublished(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const platforms = [
    { name: "YouTube", icon: "📺", color: "#FF0000", desc: "Full-length HD" },
    { name: "Instagram Reels", icon: "📱", color: "#E1306C", desc: "Vertical 9:16" },
    { name: "Facebook", icon: "👍", color: "#4267B2", desc: "Feed + Stories" },
    { name: "TikTok", icon: "🎵", color: "#000000", desc: "Short-form viral" },
    { name: "MLS Attachment", icon: "🏠", color: "#2E7D32", desc: "Auto-sync" },
    { name: "Listing Page", icon: "🌐", color: "#0064E5", desc: "Embedded player" },
  ];

  return (
    <div className="max-w-3xl mx-auto" style={{ animation: "fadeSlideIn 0.5s ease-out" }}>
      {/* Success hero */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 relative">
          <CheckCircle size={40} className="text-green-600" />
          <div className="absolute -inset-1 rounded-full border-2 border-green-200 animate-ping opacity-30" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Video is Ready!</h2>
        <p className="text-gray-500 text-sm">Published to your listing. Share across platforms with one click.</p>
      </div>

      {/* Video thumbnail */}
      <div className="relative rounded-xl overflow-hidden mb-8 shadow-lg aspect-video max-w-lg mx-auto">
        <img src={images[0]?.url} alt="Video thumbnail" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute top-3 left-3">
          <CompassLogo className="h-2.5 w-auto" color="#FFFFFF" />
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="text-sm font-bold text-white">{LISTING.address}</div>
          <div className="text-[10px] text-white/70">{LISTING.price} · {LISTING.city}, {LISTING.state}</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          0:40
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-8">
        {[
          { value: "0:40", label: "Duration" },
          { value: "1080p", label: "Resolution" },
          { value: "9.2", label: "Quality", color: "text-green-600" },
          { value: "8", label: "Clips" },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className={`text-xl font-bold ${stat.color || "text-gray-900"}`}>{stat.value}</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Share grid */}
      <div className="mb-6">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Distribute to Platforms</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((p) => (
            <button
              key={p.name}
              onClick={() => togglePublish(p.name)}
              className={`flex items-center gap-3 bg-white border rounded-xl p-3.5 transition-all text-left ${
                published.includes(p.name) ? "border-green-300 bg-green-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <span className="text-xl">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                <div className="text-[10px] text-gray-400">{p.desc}</div>
              </div>
              {published.includes(p.name) ? (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              ) : (
                <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm">
          <Download size={16} />
          Download MP4
        </button>
        <button
          onClick={() => copyText("https://compass.com/listing/4521-oceanview-dr/video", "link")}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm"
        >
          {copied === "link" ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
          {copied === "link" ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => copyText('<iframe src="https://compass.com/embed/v/abc123" width="640" height="360" frameborder="0"></iframe>', "embed")}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm"
        >
          {copied === "embed" ? <CheckCircle size={16} className="text-green-500" /> : <Code size={16} />}
          {copied === "embed" ? "Copied!" : "Embed Code"}
        </button>
      </div>

      {/* Agent card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-4">
        <img src={AGENT.photo} alt={AGENT.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">{AGENT.name}</div>
          <div className="text-xs text-gray-500">{AGENT.title}</div>
          <div className="text-xs text-gray-400">{AGENT.office} · {AGENT.license}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400">{AGENT.phone}</div>
          <div className="text-[10px] text-[#0064E5]">{AGENT.email}</div>
          <div className="text-[9px] text-gray-300 mt-1">{AGENT.volume}</div>
        </div>
      </div>

      {/* Analytics teaser */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Performance (simulated)</div>
          <span className="text-[9px] text-gray-300">Updates in real-time</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Views", value: "2,847", delta: "+12%" },
            { label: "Avg Watch", value: "0:32", delta: "80%" },
            { label: "Saves", value: "184", delta: "+8%" },
            { label: "Inquiries", value: "23", delta: "+15%" },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="text-lg font-bold text-gray-900">{m.value}</div>
              <div className="text-[9px] text-gray-400">{m.label}</div>
              <div className="text-[9px] text-green-500 font-medium">{m.delta}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onRestart}
          className="text-sm text-[#0064E5] hover:underline font-medium"
        >
          Create another video →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function Home() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<ListingPhoto[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  const steps = ["Upload", "Vibe", "Generate", "Preview", "Share"];
  const suggestedVibe = "luxury";
  const currentVibe = VIBES.find((v) => v.id === selectedVibe) || VIBES[0];

  const restart = () => {
    setStep(0);
    setImages([]);
    setSelectedVibe(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 px-4 py-8">
        <StepIndicator current={step} steps={steps} />
        {step === 0 && <UploadStep images={images} setImages={setImages} onNext={() => setStep(1)} />}
        {step === 1 && (
          <VibeStep
            selectedVibe={selectedVibe}
            setSelectedVibe={setSelectedVibe}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
            suggestedVibe={suggestedVibe}
          />
        )}
        {step === 2 && <ProcessingStep onComplete={() => setStep(3)} images={images} />}
        {step === 3 && (
          <PreviewStep
            images={images}
            vibe={currentVibe}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && <ShareStep images={images} onRestart={restart} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 px-6 text-center text-[10px] text-gray-400">
        Compass Video Studio — AI-Powered Listing Videos — POC by Toptal · Confidential
      </footer>
    </div>
  );
}
