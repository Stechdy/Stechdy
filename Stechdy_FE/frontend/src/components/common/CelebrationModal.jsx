import React, { useEffect, useState } from "react";
import "./CelebrationModal.css";

const CelebrationModal = ({ show, emoji, title, message, onClose }) => {
  const [fireworks, setFireworks] = useState([]);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate fireworks
      const newFireworks = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 0.5,
      }));
      setFireworks(newFireworks);

      // Generate confetti
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1,
        rotation: Math.random() * 360,
        color: [
          "#FFD700",
          "#FF69B4",
          "#00CED1",
          "#FF6347",
          "#9370DB",
          "#32CD32",
          "#FF1493",
          "#00BFFF",
        ][Math.floor(Math.random() * 8)],
      }));
      setConfetti(newConfetti);

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="celebration-overlay">
      {/* Fireworks */}
      <div className="fireworks-container">
        {fireworks.map((fw) => (
          <div
            key={fw.id}
            className="firework"
            style={{
              left: `${fw.left}%`,
              animationDelay: `${fw.delay}s`,
              animationDuration: `${fw.duration}s`,
            }}
          >
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
          </div>
        ))}
      </div>

      {/* Confetti */}
      <div className="confetti-container">
        {confetti.map((conf) => (
          <div
            key={conf.id}
            className="confetti"
            style={{
              left: `${conf.left}%`,
              backgroundColor: conf.color,
              animationDelay: `${conf.delay}s`,
              animationDuration: `${conf.duration}s`,
              transform: `rotate(${conf.rotation}deg)`,
            }}
          ></div>
        ))}
      </div>

      {/* Main celebration content */}
      <div className="celebration-content">
        <div className="celebration-emoji-container">
          <div className="celebration-emoji">{emoji || "🎉"}</div>
          <div className="celebration-glow"></div>
        </div>
        <h2 className="celebration-title">{title || "Chúc mừng!"}</h2>
        <p className="celebration-message">{message || "Bạn thật tuyệt vời!"}</p>
      </div>

      {/* Sparkles */}
      <div className="sparkles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
};

export default CelebrationModal;
