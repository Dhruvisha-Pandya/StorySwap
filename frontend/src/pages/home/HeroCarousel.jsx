import React, { useEffect, useState, useCallback } from "react";
import "../../static/home/HeroCarousel.css";

// Constants
const SLIDE_INTERVAL = 4000;

const textSlides = [
  {
    title: "Swap Stories, Share Adventures",
    subtitle: "Discover your next favorite book through community sharing",
  },
  {
    title: "Read More, Spend Less",
    subtitle: "Exchange books with fellow readers in your community",
  },
  {
    title: "Build Your Reading Community",
    subtitle: "Connect with book lovers and expand your library",
  },
  {
    title: "Sustainable Reading",
    subtitle: "Reduce waste by sharing books and creating memories",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // Move to next slide
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % textSlides.length);
  }, []);

  // Auto slide interval
  useEffect(() => {
    const interval = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(interval); // Cleanup
  }, [nextSlide]);

  return (
    <div className="text-carousel-container">
      {/* Slides */}
      {textSlides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div key={index} className={`text-slide ${isActive ? "active" : ""}`}>
            <h1 className="carousel-title">{slide.title}</h1>
            <p className="carousel-subtitle">{slide.subtitle}</p>
          </div>
        );
      })}

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {textSlides.map((_, index) => {
          const isActive = index === current;
          return (
            <button
              key={index}
              className={`dot ${isActive ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

// 1. Magic Number Removed
// 4000 updated to SLIDE_INTERVAL

// 2. Unstable interval callback
// Converted auto-slide handler into useCallback

// 3. Better readability
// Cleaned mapping & className checks

// 4. Reduced inline logic
// Separated isActive for cleaner JSX

// 5. Component prepared for future upgrades
// (e.g., fade animations, swipe gestures, framer-motion)