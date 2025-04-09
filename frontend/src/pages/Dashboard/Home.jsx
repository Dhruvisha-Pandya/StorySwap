import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import BookGrid from './components/BookGrid';
import '../../static/home/Navbar.css';  // Direct path to CSS
import '../../static/home/HeroCarousel.css';
import '../../static/home/BookGrid.css';

export default function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <main>
        <HeroCarousel />
        <BookGrid title="Trending Now" />
        <BookGrid title="Recommended for You" />
      </main>
    </div>
  );
}