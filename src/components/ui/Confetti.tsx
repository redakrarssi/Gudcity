import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  duration?: number;
  pieces?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({
  duration = 5000,
  pieces = 200
}) => {
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showConfetti, setShowConfetti] = useState(true);

  // Update window dimensions when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Hide confetti after duration
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowConfetti(false);
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, [duration]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={windowDimension.width}
      height={windowDimension.height}
      recycle={false}
      numberOfPieces={pieces}
      gravity={0.2}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
    />
  );
};

export default Confetti; 