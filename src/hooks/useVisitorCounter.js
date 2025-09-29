import { useState, useEffect } from 'react';
import visitorCounterService from '../services/visitorCounter';

const useVisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Initialize visitor count
    const initializeCounter = () => {
      try {
        const count = visitorCounterService.incrementCount();
        setVisitorCount(count);
        setIsLoading(false);
        
        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      } catch (error) {
        console.error('Error initializing visitor counter:', error);
        setVisitorCount(1250); // Fallback count
        setIsLoading(false);
      }
    };

    initializeCounter();

    // Simulate periodic updates (every 30 seconds)
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of update
        const newCount = visitorCounterService.simulateRealisticGrowth();
        setVisitorCount(newCount);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getFormattedCount = () => {
    return visitorCount.toLocaleString('es-CO');
  };

  return {
    visitorCount,
    formattedCount: getFormattedCount(),
    isLoading,
    isAnimating
  };
};

export default useVisitorCounter;
