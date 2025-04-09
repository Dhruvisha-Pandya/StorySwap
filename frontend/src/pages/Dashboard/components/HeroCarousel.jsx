// HeroCarousel.jsx
export default function HeroCarousel() {
  const slides = [
    {
      title: "Swap Physical Books",
      desc: "Trade paperbacks with readers nearby",
      img: "/assets/carousel/swap-books.jpg" // From public folder
    },
    {
      title: "Join Book Clubs",
      desc: "Discuss your favorite reads",
      img: "/assets/carousel/join-clubs.jpg"
    }
  ];

  return (
    <div className="hero-carousel">
      {slides.map((slide, index) => (
        <div key={index} className="carousel-slide">
          <img 
            src={slide.img} 
            alt={slide.title}
            onError={(e) => {
              e.target.src = '/assets/default-book.jpg'; // Fallback image
            }}
          />
          <div className="slide-content">
            <h3>{slide.title}</h3>
            <p>{slide.desc}</p>
            <button>Explore</button>
          </div>
        </div>
      ))}
    </div>
  );
}