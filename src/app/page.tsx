"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload, Sparkles, Play, Share2, CheckCircle, AlertTriangle,
  ChevronRight, Music, RotateCcw, Type, Image as ImageIcon,
  Download, ExternalLink, X, Camera, Star, Zap, Clock
} from "lucide-react";

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
interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  room: string;
  quality: number;
  status: "good" | "warning" | "bad";
}

interface Vibe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  musicLabel: string;
}

// ─── CONSTANTS ───
const VIBES: Vibe[] = [
  { id: "luxury", name: "Luxury", emoji: "✨", description: "Slow pans, golden tones, orchestral strings", color: "#B8860B", musicLabel: "Cinematic Orchestra" },
  { id: "modern", name: "Modern", emoji: "🏙️", description: "Clean cuts, cool tones, electronic ambient", color: "#0064E5", musicLabel: "Electronic Ambient" },
  { id: "warm", name: "Warm & Inviting", emoji: "🏡", description: "Gentle motion, warm light, acoustic guitar", color: "#D4760A", musicLabel: "Acoustic Warmth" },
  { id: "coastal", name: "Coastal", emoji: "🌊", description: "Airy drift, bright tones, ambient waves", color: "#0088CC", musicLabel: "Ocean Breeze" },
  { id: "urban", name: "Urban Loft", emoji: "🏢", description: "Dynamic angles, deep bass, industrial chic", color: "#6B4C9A", musicLabel: "Deep Urban" },
  { id: "classic", name: "Classic Elegance", emoji: "🎻", description: "Timeless pacing, rich tones, piano melody", color: "#2E7D32", musicLabel: "Piano Sonata" },
];

const ROOMS = ["Front Exterior", "Entryway", "Living Room", "Kitchen", "Dining Room", "Primary Bedroom", "Bathroom", "Backyard", "Pool", "Garage"];

const PROCESSING_STEPS = [
  { label: "Analyzing image quality", icon: "🔍", duration: 1500 },
  { label: "Classifying rooms", icon: "🏠", duration: 1200 },
  { label: "Generating depth maps", icon: "📐", duration: 2000 },
  { label: "Creating parallax motion", icon: "🎬", duration: 2500 },
  { label: "Sequencing narrative flow", icon: "📖", duration: 1000 },
  { label: "Matching music to vibe", icon: "🎵", duration: 800 },
  { label: "Compositing video", icon: "🎞️", duration: 2000 },
  { label: "Applying brand template", icon: "🎨", duration: 1000 },
  { label: "Final quality check", icon: "✅", duration: 1000 },
];

// ─── STEP INDICATOR ───
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
            i === current
              ? "bg-[#0064E5] text-white"
              : i < current
              ? "bg-[#0064E5]/10 text-[#0064E5]"
              : "bg-gray-100 text-gray-400"
          }`}>
            {i < current ? <CheckCircle size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={14} className={i < current ? "text-[#0064E5]/40" : "text-gray-200"} />
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
          <span>POC v0.1</span>
        </div>
      </div>
    </header>
  );
}

// ─── STEP 1: UPLOAD ───
function UploadStep({ images, setImages, onNext }: {
  images: UploadedImage[];
  setImages: (imgs: UploadedImage[]) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: UploadedImage[] = Array.from(files).map((file, i) => {
      const quality = Math.random() * 5 + 5;
      const roomIdx = (images.length + i) % ROOMS.length;
      return {
        id: `img-${Date.now()}-${i}`,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        room: ROOMS[roomIdx],
        quality: Math.round(quality * 10) / 10,
        status: quality > 7 ? "good" : quality > 5 ? "warning" : "bad",
      };
    });
    setImages([...images, ...newImages]);
  }, [images, setImages]);

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Listing Photos</h2>
        <p className="text-gray-500 text-sm">Upload 6–12 photos. AI will score quality and classify each room.</p>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center mb-6 cursor-pointer hover:border-[#0064E5]/40 hover:bg-blue-50/30 transition-all"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={32} className="mx-auto mb-3 text-[#0064E5]" />
        <p className="text-sm text-gray-600 mb-1">Drag & drop photos here, or click to browse</p>
        <p className="text-xs text-gray-400">JPG, PNG, HEIC — max 20MB per image</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {images.map((img) => (
            <div key={img.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <img src={img.url} alt={img.room} className="w-full h-32 object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} className="text-white" />
              </button>
              <div className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate">{img.room}</span>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${
                    img.status === "good" ? "text-green-600" :
                    img.status === "warning" ? "text-amber-500" : "text-red-500"
                  }`}>
                    <Star size={10} fill="currentColor" />
                    {img.quality}
                  </span>
                </div>
                {img.status === "bad" && (
                  <div className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertTriangle size={9} />
                    Low quality — retake suggested
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MLS sync hint */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        Connected to MLS — photos auto-sync when listing is published
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <button
          disabled={images.length < 3}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            images.length >= 3
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
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Vibe</h2>
        <p className="text-gray-500 text-sm">
          AI suggests: <span className="text-[#0064E5] font-medium">{VIBES.find(v => v.id === suggestedVibe)?.name} {VIBES.find(v => v.id === suggestedVibe)?.emoji}</span>
          <span className="text-gray-400 ml-1">based on property type & price tier</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {VIBES.map((vibe) => (
          <button
            key={vibe.id}
            onClick={() => setSelectedVibe(vibe.id)}
            className={`relative p-5 rounded-xl text-left transition-all duration-200 border ${
              selectedVibe === vibe.id
                ? "bg-white border-2 shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            style={{ borderColor: selectedVibe === vibe.id ? vibe.color : undefined }}
          >
            {vibe.id === suggestedVibe && (
              <div className="absolute -top-2 -right-2 bg-[#0064E5] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                AI Pick
              </div>
            )}
            <div className="text-2xl mb-2">{vibe.emoji}</div>
            <div className="font-semibold text-sm text-gray-900 mb-1">{vibe.name}</div>
            <div className="text-[11px] text-gray-500 leading-relaxed">{vibe.description}</div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400">
              <Music size={10} />
              {vibe.musicLabel}
            </div>
          </button>
        ))}
      </div>

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

// ─── STEP 3: PROCESSING ───
function ProcessingStep({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= PROCESSING_STEPS.length) {
      setTimeout(onComplete, 500);
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
    <div className="max-w-lg mx-auto text-center">
      <div className="w-24 h-24 rounded-full bg-blue-50 pulse-glow flex items-center justify-center mx-auto mb-8">
        <Sparkles size={36} className="text-[#0064E5]" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Video</h2>
      <p className="text-gray-400 text-sm mb-8">This takes about 3–5 minutes in production</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#0064E5] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {PROCESSING_STEPS.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
            i === currentStep ? "bg-blue-50 shimmer" :
            i < currentStep ? "opacity-40" : "opacity-20"
          }`}>
            <span className="text-base">{step.icon}</span>
            <span className="text-sm text-gray-700">{step.label}</span>
            {i < currentStep && <CheckCircle size={14} className="ml-auto text-green-500" />}
            {i === currentStep && <Clock size={14} className="ml-auto text-[#0064E5] animate-spin" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 4: PREVIEW ───
function PreviewStep({ images, vibe, onNext, onBack }: {
  images: UploadedImage[];
  vibe: Vibe;
  onNext: () => void;
  onBack: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentClip, setCurrentClip] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = images.length * 4;

  const sortedImages = [...images].sort((a, b) => {
    const order = ROOMS;
    return order.indexOf(a.room) - order.indexOf(b.room);
  });

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 0.1;
          if (next >= totalDuration) {
            setPlaying(false);
            return 0;
          }
          setCurrentClip(Math.floor(next / 4) % sortedImages.length);
          return next;
        });
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, totalDuration, sortedImages.length]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Edit</h2>
        <p className="text-gray-500 text-sm">Your video is ready. Swap shots, change music, or adjust the sequence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-xl overflow-hidden relative aspect-video shadow-lg">
            {sortedImages[currentClip] && (
              <img
                src={sortedImages[currentClip].url}
                alt="Video frame"
                className={`w-full h-full object-cover ${playing ? `parallax-${currentClip % 4}` : ""}`}
              />
            )}

            {/* Brand overlay */}
            <div className="absolute top-4 left-4">
              <CompassLogo className="h-3 w-auto" color="#FFFFFF" />
            </div>
            <div className="absolute bottom-12 left-4 right-4">
              <div className="text-lg font-bold text-white drop-shadow-lg">4521 Oceanview Drive</div>
              <div className="text-sm text-white/80 drop-shadow">$2,450,000 · 4 BD · 3 BA · 3,200 SF</div>
            </div>

            {/* Play button */}
            {!playing && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Play size={28} fill="white" className="text-white ml-1" />
                </div>
              </button>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent flex items-end px-3 pb-1.5">
              <div className="flex-1 h-1 bg-white/20 rounded-full mr-2 cursor-pointer" onClick={() => setPlaying(!playing)}>
                <div className="h-full bg-[#0064E5] rounded-full transition-all" style={{ width: `${(elapsed / totalDuration) * 100}%` }} />
              </div>
              <span className="text-[10px] text-white/60">{formatTime(elapsed)} / {formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Timeline</div>
            <div className="flex gap-1">
              {sortedImages.map((img, i) => {
                const colors = ["#6B4C9A", "#2E7D32", "#D4760A", "#C62828", "#0064E5", "#0088CC", "#AD1457", "#E65100"];
                return (
                  <button
                    key={img.id}
                    onClick={() => { setCurrentClip(i); setElapsed(i * 4); }}
                    className={`timeline-clip flex-1 h-10 rounded-md flex items-center justify-center text-[9px] font-medium text-white ${
                      i === currentClip ? "ring-2 ring-gray-900" : ""
                    }`}
                    style={{ backgroundColor: colors[i % colors.length] }}
                  >
                    {img.room.split(" ").pop()}
                  </button>
                );
              })}
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
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Music</label>
                <div className="mt-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Music size={14} className="text-[#0064E5]" />
                  <span className="text-sm text-gray-700">{vibe.musicLabel}</span>
                  <button className="ml-auto text-[10px] text-[#0064E5] font-medium">Change</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Text Overlay</label>
                <div className="mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <div className="text-gray-700">4521 Oceanview Drive</div>
                  <div className="text-gray-400 text-xs">$2,450,000 · Auto-populated from MLS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: RotateCcw, label: "Regenerate" },
                { icon: Music, label: "Music" },
                { icon: Type, label: "Edit Text" },
                { icon: ImageIcon, label: "Swap Shot" },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
                  <action.icon size={14} className="text-gray-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quality Score</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-green-600">9.2</div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Excellent quality<br />
                No artifacts detected<br />
                Brand compliant ✓
              </div>
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
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm bg-[#0064E5] text-white hover:bg-[#0049A8] shadow-sm transition-colors"
        >
          <CheckCircle size={16} />
          Approve & Share
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5: SHARE ───
function ShareStep({ onRestart }: { onRestart: () => void }) {
  const [copied, setCopied] = useState(false);

  const platforms = [
    { name: "YouTube", icon: "📺", color: "#FF0000" },
    { name: "Instagram Reels", icon: "📱", color: "#E1306C" },
    { name: "Facebook", icon: "👍", color: "#4267B2" },
    { name: "TikTok", icon: "🎵", color: "#000000" },
    { name: "MLS Attachment", icon: "🏠", color: "#2E7D32" },
    { name: "Listing Page", icon: "🌐", color: "#0064E5" },
  ];

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Video is Ready!</h2>
      <p className="text-gray-500 text-sm mb-8">Published to your listing. Share across platforms with one click.</p>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-8">
        <div>
          <div className="text-2xl font-bold text-gray-900">1:28</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Duration</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">1080p</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Resolution</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">9.2</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Quality</div>
        </div>
      </div>

      {/* Share grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {platforms.map((p) => (
          <button
            key={p.name}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left"
          >
            <span className="text-xl">{p.icon}</span>
            <div>
              <div className="text-sm font-medium text-gray-900">{p.name}</div>
              <div className="text-[10px] text-gray-400">Auto-format & publish</div>
            </div>
            <ExternalLink size={14} className="ml-auto text-gray-300" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 mb-6">
        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={16} />
          Download MP4
        </button>
        <button
          onClick={() => { navigator.clipboard?.writeText("https://compass.com/v/abc123"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Share2 size={16} />
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Camera size={16} />
          Embed Player
        </button>
      </div>

      <button
        onClick={onRestart}
        className="text-sm text-[#0064E5] hover:underline font-medium"
      >
        Create another video →
      </button>
    </div>
  );
}

// ─── MAIN APP ───
export default function Home() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);
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
        {step === 2 && <ProcessingStep onComplete={() => setStep(3)} />}
        {step === 3 && (
          <PreviewStep
            images={images}
            vibe={currentVibe}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && <ShareStep onRestart={restart} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 px-6 text-center text-[10px] text-gray-400">
        Compass Video Studio — AI-Powered Listing Videos — POC by Toptal · Confidential
      </footer>
    </div>
  );
}

