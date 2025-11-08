import React, { useEffect, useState } from "react";
import "../../static/home/HeroCarousel.css";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % textSlides.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-carousel-container">
      {textSlides.map((slide, index) => (
        <div
          key={index}
          className={`text-slide ${index === current ? "active" : ""}`}
        >
          <h1 className="carousel-title">{slide.title}</h1>
          <p className="carousel-subtitle">{slide.subtitle}</p>
        </div>
      ))}

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {textSlides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}
