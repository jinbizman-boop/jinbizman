import { useEffect, useRef, useState } from "react";
import { ResponsiveMedia } from "./ResponsiveMedia";

export function VideoHero({ poster, video, alt }: { poster: string; video?: string; alt: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!video || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current.pause();
      setPaused(true);
      return;
    }
    void ref.current.play().catch(() => setPaused(true));
  }, [video]);

  if (!video) return <div className="hero-media"><ResponsiveMedia src={poster} alt={alt} eager /></div>;

  return <div className="hero-media">
    <ResponsiveMedia src={poster} alt={alt} eager className={videoReady ? "hero-poster is-hidden" : "hero-poster"} />
    <video ref={ref} className={videoReady ? "hero-video is-ready" : "hero-video"} autoPlay loop playsInline muted={muted} poster={poster} onCanPlay={() => setVideoReady(true)}>
      <source src={video} />
    </video>
    <div className="hero-media-controls" aria-label="Media controls">
      <button type="button" onClick={() => { if (!ref.current) return; if (ref.current.paused) void ref.current.play(); else ref.current.pause(); setPaused(!paused); }}>{paused ? "Play" : "Pause"}</button>
      <button type="button" onClick={() => { if (!ref.current) return; ref.current.muted = !muted; setMuted(!muted); }}>{muted ? "Sound" : "Mute"}</button>
    </div>
  </div>;
}
