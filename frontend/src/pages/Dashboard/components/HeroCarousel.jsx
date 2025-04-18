import React, { useEffect, useState } from "react";
import "../../../static/home/HeroCarousel.css";

const images = [
  require("../../../assets/carousel/Slide1.png"),
  require("../../../assets/carousel/Slide2.png"),
  // require("../../../assets/carousel/Slide3.png"),
  // require("../../../assets/carousel/Slide4.png"),
  // require("../../../assets/carousel/Slide5.png"),
  // require("../../../assets/carousel/Slide6.png"),
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`slide-${index}`}
          className={`carousel-image ${index === current ? "active" : ""}`}
        />
      ))}
    </div>
  );
}
