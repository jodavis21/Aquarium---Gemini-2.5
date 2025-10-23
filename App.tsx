
import React, { useState, useEffect, useRef } from 'react';
import { useAquarium } from './hooks/useAquarium';
import FishComponent from './components/Fish';
import FoodPellet from './components/FoodPellet';
import Bubble from './components/Bubble';
import { MutedIcon, UnmutedIcon } from './components/Icons';

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const App: React.FC = () => {
  const { width, height } = useWindowSize();
  const { fish, food, bubbles, addFood } = useAquarium(width, height);
  const [isMuted, setIsMuted] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        addFood();
        if (showInstructions) {
          setShowInstructions(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addFood, showInstructions]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-cyan-600 via-blue-800 to-indigo-900">
      {/* Light Rays */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-white/10 to-transparent transform -skew-x-12 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-b from-white/5 to-transparent transform skew-x-12 pointer-events-none"></div>
      
      {/* Aquarium Content */}
      {fish.map(f => (
        <FishComponent key={f.id} {...f} />
      ))}
      {food.map(p => (
        <FoodPellet key={p.id} {...p} />
      ))}
      {bubbles.map(b => (
        <Bubble key={b.id} {...b} />
      ))}

      {/* Sand */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-yellow-800 via-yellow-700 to-yellow-600/50">
        <div className="w-full h-full bg-repeat-x opacity-20" style={{backgroundImage: `url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="%23a0522d" fill-opacity="0.4" fill-rule="evenodd"><circle cx="3" cy="3" r="3"/><circle cx="13" cy="13" r="3"/></g></svg>')`}}></div>
      </div>
      
      {/* UI Elements */}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={toggleMute} className="p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors">
          {isMuted ? <MutedIcon /> : <UnmutedIcon />}
        </button>
      </div>
      
      {showInstructions && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/30 text-white rounded-lg text-lg animate-pulse z-10">
          Press <kbd className="px-2 py-1 mx-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Space</kbd> to feed the fish
        </div>
      )}
      
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-underwater-deep-sea-ambience-2134.mp3" loop />
    </div>
  );
};

export default App;
