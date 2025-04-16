// import React from 'react';
// import '../../../static/home/HeroCarousel.css'; // Static CSS path

// export default function HeroCarousel() {
//   const slides = [
//     {
//       title: "Swap Physical Books",
//       desc: "Trade paperbacks with readers nearby",
//       // img: "/static/images/carousel/swap.PNG",
//       link: "/swap"
//     },
//     {
//       title: "Join Book Clubs",
//       desc: "Discuss your favorite reads",
//       img: "/static/images/carousel/book-club.jpg",
//       link: "/clubs"
//     }
//   ];

//   return (
//     <div className="hero-carousel">
//       {slides.map((slide, index) => (
//         <div key={index} className="carousel-slide">
//           <img
//             src={slide.img}
//             alt={slide.title}
//             onError={(e) => {
//               e.target.src = '/static/images/default-book.jpg';
//             }}
//           />
//           <div className="slide-content">
//             <h3>{slide.title}</h3>
//             <p>{slide.desc}</p>
//             <button className="carousel-button">Explore</button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }




import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import '../../../static/home/HeroCarousel.css';

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch slides from Firestore (or use local data)
  useEffect(() => {
    const fetchSlides = async () => {
      const snapshot = await getDocs(collection(db, 'carousel'));
      setSlides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchSlides();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  return (
    <div className="hero-carousel">
      {/* Slides */}
      <div className="slides-container">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.imageURL || slide.image})` }}
          >
            <div className="slide-content">
              <h3>{slide.title}</h3>
              <p>{slide.description}</p>
              <a href={slide.link} className="cta-button">
                {slide.ctaText || "Explore"}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}