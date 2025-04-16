import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import BookGrid from './components/BookGrid';
import '../../static/home/Navbar.css';
import '../../static/home/HeroCarousel.css';
import '../../static/home/BookGrid.css';

export default function Home() {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const q = query(collection(db, "books"), orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      setTrendingBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchRecommended = async () => {
      const q = query(collection(db, "books"), where("genre", "==", "Fiction"), limit(10));
      const snapshot = await getDocs(q);
      setRecommendedBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchTrending();
    fetchRecommended();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <main>
        <HeroCarousel />
        <BookGrid title="Trending Now" books={trendingBooks} />
        <BookGrid title="Recommended for You" books={recommendedBooks} />
      </main>
    </div>
  );
}