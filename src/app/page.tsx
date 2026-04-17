"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload, Sparkles, Play, Share2, CheckCircle, AlertTriangle,
  ChevronRight, Music, RotateCcw, Type, Image as ImageIcon,
  Download, ExternalLink, X, Camera, Star, Zap, Clock
} from "lucide-react";

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
  { id: "luxury", name: "Luxury", emoji: "✨", description: "Slow pans, golden tones, orchestral strings", color: "#F39C12", musicLabel: "Cinematic Orchestra" },
  { id: "modern", name: "Modern", emoji: "🏙️", description: "Clean cuts, cool tones, electronic ambient", color: "#6B8AFF", musicLabel: "Electronic Ambient" },
  { id: "warm", name: "Warm & Inviting", emoji: "🏡", description: "Gentle motion, warm light, acoustic guitar", color: "#E67E22", musicLabel: "Acoustic Warmth" },
  { id: "coastal", name: "Coastal", emoji: "🌊", description: "Airy drift, bright tones, ambient waves", color: "#3498DB", musicLabel: "Ocean Breeze" },
  { id: "urban", name: "Urban Loft", emoji: "🏢", description: "Dynamic angles, deep bass, industrial chic", color: "#9B59B6", musicLabel: "Deep Urban" },
  { id: "classic", name: "Classic Elegance", emoji: "🎻", description: "Timeless pacing, rich tones, piano melody", color: "#2ECC71", musicLabel: "Piano Sonata" },
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
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
            i === current
              ? "bg-[#6B8AFF] text-white"
              : i < current
              ? "bg-[#6B8AFF]/20 text-[#6B8AFF]"
              : "bg-[#1A2744] text-white/30"
          }`}>
            {i < current ? <CheckCircle size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={14} className={i < current ? "text-[#6B8AFF]/50" : "text-white/10"} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── HEADER ───
function Header() {
  return (
    <header className="border-b border-white/5 bg-[#0A1628]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold tracking-wider">
            C<span className="text-[0.7em]">●</span>MPASS
          </div>
          <div className="w-px h-5 bg-white/20" />
          <div className="text-sm font-medium text-white/60">Video Studio</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Zap size={12} className="text-[#6B8AFF]" />
          <span>AI-Powered</span>
          <span className="text-white/10">|</span>
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
      const quality = Math.random() * 5 + 5; // 5-10
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
        <h2 className="text-2xl font-bold mb-2">Upload Listing Photos</h2>
        <p className="text-white/50 text-sm">Upload 6–12 photos. AI will score quality and classify each room.</p>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-[#1A2744] rounded-xl p-8 text-center mb-6 cursor-pointer hover:border-[#6B8AFF]/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={32} className="mx-auto mb-3 text-[#6B8AFF]" />
        <p className="text-sm text-white/60 mb-1">Drag & drop photos here, or click to browse</p>
        <p className="text-xs text-white/30">JPG, PNG, HEIC — max 20MB per image</p>
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
            <div key={img.id} className="relative group bg-[#111D33] rounded-lg overflow-hidden">
              <img src={img.url} alt={img.room} className="w-full h-32 object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
              <div className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate">{img.room}</span>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${
                    img.status === "good" ? "text-[#2ECC71]" :
                    img.status === "warning" ? "text-[#F39C12]" : "text-[#E74C3C]"
                  }`}>
                    <Star size={10} fill="currentColor" />
                    {img.quality}
                  </span>
                </div>
                {img.status === "bad" && (
                  <div className="text-[10px] text-[#E74C3C] flex items-center gap-1">
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
      <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
        <div className="w-2 h-2 rounded-full bg-[#2ECC71]" />
        Connected to MLS — photos auto-sync when listing is published
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <button
          disabled={images.length < 3}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            images.length >= 3
              ? "bg-[#6B8AFF] text-white hover:bg-[#5A7AEE]"
              : "bg-[#1A2744] text-white/30 cursor-not-allowed"
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
        <h2 className="text-2xl font-bold mb-2">Select Your Vibe</h2>
        <p className="text-white/50 text-sm">
          AI suggests: <span className="text-[#F39C12] font-medium">{VIBES.find(v => v.id === suggestedVibe)?.name} {VIBES.find(v => v.id === suggestedVibe)?.emoji}</span>
          <span className="text-white/30 ml-1">based on property type & price tier</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {VIBES.map((vibe) => (
          <button
            key={vibe.id}
            onClick={() => setSelectedVibe(vibe.id)}
            className={`relative p-5 rounded-xl text-left transition-all duration-200 ${
              selectedVibe === vibe.id
                ? "bg-[#111D33] ring-2"
                : "bg-[#111D33]/60 hover:bg-[#111D33] ring-1 ring-white/5 hover:ring-white/10"
            }`}
            style={{ "--tw-ring-color": selectedVibe === vibe.id ? vibe.color : undefined } as React.CSSProperties}
          >
            {vibe.id === suggestedVibe && (
              <div className="absolute -top-2 -right-2 bg-[#F39C12] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                AI Pick
              </div>
            )}
            <div className="text-2xl mb-2">{vibe.emoji}</div>
            <div className="font-semibold text-sm mb-1">{vibe.name}</div>
            <div className="text-[11px] text-white/40 leading-relaxed">{vibe.description}</div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
              <Music size={10} />
              {vibe.musicLabel}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors">
          ← Back
        </button>
        <button
          disabled={!selectedVibe}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            selectedVibe
              ? "bg-[#6B8AFF] text-white hover:bg-[#5A7AEE]"
              : "bg-[#1A2744] text-white/30 cursor-not-allowed"
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
      <div className="w-24 h-24 rounded-full bg-[#111D33] pulse-glow flex items-center justify-center mx-auto mb-8">
        <Sparkles size={36} className="text-[#6B8AFF]" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Generating Your Video</h2>
      <p className="text-white/40 text-sm mb-8">This takes about 3–5 minutes in production</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#1A2744] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#6B8AFF] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {PROCESSING_STEPS.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
            i === currentStep ? "bg-[#111D33] shimmer" :
            i < currentStep ? "opacity-40" : "opacity-20"
          }`}>
            <span className="text-base">{step.icon}</span>
            <span className="text-sm">{step.label}</span>
            {i < currentStep && <CheckCircle size={14} className="ml-auto text-[#2ECC71]" />}
            {i === currentStep && <Clock size={14} className="ml-auto text-[#6B8AFF] animate-spin" />}
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
  const totalDuration = images.length * 4; // 4 sec per clip

  // Sort images in narrative order
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
        <h2 className="text-2xl font-bold mb-2">Preview & Edit</h2>
        <p className="text-white/50 text-sm">Your video is ready. Swap shots, change music, or adjust the sequence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
            {/* Current frame with parallax */}
            {sortedImages[currentClip] && (
              <img
                src={sortedImages[currentClip].url}
                alt="Video frame"
                className={`w-full h-full object-cover ${playing ? `parallax-${currentClip % 4}` : ""}`}
              />
            )}

            {/* Brand overlay */}
            <div className="absolute top-4 left-4 text-xs font-bold tracking-widest opacity-60">
              C<span className="text-[0.7em]">●</span>MPASS
            </div>
            <div className="absolute bottom-12 left-4 right-4">
              <div className="text-lg font-bold drop-shadow-lg">4521 Oceanview Drive</div>
              <div className="text-sm text-white/70 drop-shadow">$2,450,000 · 4 BD · 3 BA · 3,200 SF</div>
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
                <div className="h-full bg-[#6B8AFF] rounded-full transition-all" style={{ width: `${(elapsed / totalDuration) * 100}%` }} />
              </div>
              <span className="text-[10px] text-white/50">{formatTime(elapsed)} / {formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Timeline</div>
            <div className="flex gap-1">
              {sortedImages.map((img, i) => {
                const colors = ["#9B59B6", "#2ECC71", "#F39C12", "#E74C3C", "#6B8AFF", "#3498DB", "#E91E63", "#FF9800"];
                return (
                  <button
                    key={img.id}
                    onClick={() => { setCurrentClip(i); setElapsed(i * 4); }}
                    className={`timeline-clip flex-1 h-10 rounded-md flex items-center justify-center text-[9px] font-medium ${
                      i === currentClip ? "ring-2 ring-white/40" : ""
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
          <div className="bg-[#111D33] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Video Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Vibe</label>
                <div className="mt-1 flex items-center gap-2 bg-[#1A2744] rounded-lg px-3 py-2">
                  <span>{vibe.emoji}</span>
                  <span className="text-sm">{vibe.name}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Music</label>
                <div className="mt-1 flex items-center gap-2 bg-[#1A2744] rounded-lg px-3 py-2">
                  <Music size={14} className="text-[#6B8AFF]" />
                  <span className="text-sm">{vibe.musicLabel}</span>
                  <button className="ml-auto text-[10px] text-[#6B8AFF]">Change</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Text Overlay</label>
                <div className="mt-1 bg-[#1A2744] rounded-lg px-3 py-2 text-sm">
                  <div className="text-white/60">4521 Oceanview Drive</div>
                  <div className="text-white/30 text-xs">$2,450,000 · Auto-populated from MLS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111D33] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: RotateCcw, label: "Regenerate" },
                { icon: Music, label: "Music" },
                { icon: Type, label: "Edit Text" },
                { icon: ImageIcon, label: "Swap Shot" },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-2 bg-[#1A2744] rounded-lg px-3 py-2.5 text-xs hover:bg-[#1A2744]/80 transition-colors">
                  <action.icon size={14} className="text-white/50" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111D33] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Quality Score</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-[#2ECC71]">9.2</div>
              <div className="text-xs text-white/40 leading-relaxed">
                Excellent quality<br />
                No artifacts detected<br />
                Brand compliant ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors">
          ← Regenerate
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm bg-[#2ECC71] text-white hover:bg-[#27AE60] transition-colors"
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
    { name: "MLS Attachment", icon: "🏠", color: "#2ECC71" },
    { name: "Listing Page", icon: "🌐", color: "#6B8AFF" },
  ];

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-[#2ECC71]/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-[#2ECC71]" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your Video is Ready!</h2>
      <p className="text-white/50 text-sm mb-8">Published to your listing. Share across platforms with one click.</p>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-8">
        <div>
          <div className="text-2xl font-bold text-[#6B8AFF]">1:28</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Duration</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#6B8AFF]">1080p</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Resolution</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#2ECC71]">9.2</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Quality</div>
        </div>
      </div>

      {/* Share grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {platforms.map((p) => (
          <button
            key={p.name}
            className="flex items-center gap-3 bg-[#111D33] rounded-xl p-4 hover:bg-[#1A2744] transition-colors text-left"
          >
            <span className="text-xl">{p.icon}</span>
            <div>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-[10px] text-white/30">Auto-format & publish</div>
            </div>
            <ExternalLink size={14} className="ml-auto text-white/20" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 mb-6">
        <button className="flex items-center gap-2 bg-[#1A2744] rounded-lg px-4 py-2.5 text-sm hover:bg-[#1A2744]/80 transition-colors">
          <Download size={16} />
          Download MP4
        </button>
        <button
          onClick={() => { navigator.clipboard?.writeText("https://compass.com/v/abc123"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-2 bg-[#1A2744] rounded-lg px-4 py-2.5 text-sm hover:bg-[#1A2744]/80 transition-colors"
        >
          <Share2 size={16} />
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button className="flex items-center gap-2 bg-[#1A2744] rounded-lg px-4 py-2.5 text-sm hover:bg-[#1A2744]/80 transition-colors">
          <Camera size={16} />
          Embed Player
        </button>
      </div>

      <button
        onClick={onRestart}
        className="text-sm text-[#6B8AFF] hover:underline"
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
    <div className="flex flex-col min-h-screen">
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
      <footer className="border-t border-white/5 py-3 px-6 text-center text-[10px] text-white/20">
        Compass Video Studio — AI-Powered Listing Videos — POC by Toptal · Confidential
      </footer>
    </div>
  );
}

