import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { romanticAudio } from '../utils/audioPlayer';

interface MusicControllerProps {
  trackTitle?: string;
}

export const MusicController: React.FC<MusicControllerProps> = ({
  trackTitle = 'Birthday Music Box Lullaby',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = romanticAudio.subscribe((playing) => {
      setIsPlaying(playing);
    });
    setIsPlaying(romanticAudio.getIsPlaying());
    setVolume(romanticAudio.getVolume());
    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      romanticAudio.pause();
    } else {
      romanticAudio.play();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    romanticAudio.setVolume(val);
  };

  const handleMuteToggle = () => {
    if (volume > 0) {
      setVolume(0);
      romanticAudio.setVolume(0);
    } else {
      setVolume(0.65);
      romanticAudio.setVolume(0.65);
    }
  };

  return (
    <aside
      aria-label="Background music controls"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 glass-panel-deep px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/80 transition-all duration-300"
    >
      {/* Play/Pause Button */}
      <button
        onClick={handleToggle}
        title={isPlaying ? 'Pause music' : 'Play romantic music'}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
          isPlaying
            ? 'glass-button-primary text-white'
            : 'glass-panel-subtle text-pink-700 hover:bg-white/80'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-white" />
        ) : (
          <Play className="w-5 h-5 fill-pink-700 ml-0.5" />
        )}
      </button>

      {/* Track info & Sound wave animation */}
      <div
        className="flex flex-col cursor-pointer max-w-[120px] sm:max-w-[160px]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5">
          <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-pink-500 animate-spin-slow' : 'text-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-800 truncate">
            {trackTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-pink-700">
          <span>{isPlaying ? 'Playing melody' : 'Paused'}</span>
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-2.5">
              <span className="w-0.5 h-full bg-pink-500 animate-pulse"></span>
              <span className="w-0.5 h-2/3 bg-pink-400 animate-pulse delay-75"></span>
              <span className="w-0.5 h-4/5 bg-pink-500 animate-pulse delay-150"></span>
            </span>
          )}
        </div>
      </div>

      {/* Volume slider (toggled or desktop inline) */}
      <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/60">
        <button
          onClick={handleMuteToggle}
          className="text-pink-700 hover:text-pink-900 p-1 cursor-pointer"
          title={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Adjust music volume"
          className="w-16 h-1.5 bg-white/60 rounded-lg appearance-none cursor-pointer accent-pink-500 border border-white/50"
        />
      </div>
    </aside>
  );
};
