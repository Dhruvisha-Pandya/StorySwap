// BookGrid.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

export default function BookGrid({ title, category }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(collection(db, "books"));
      const booksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBooks(booksData);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <section className="book-section">
      <h2>{title}</h2>
      <div className="book-grid">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <img 
              src={book.coverUrl || '/assets/book-covers/default.jpg'} 
              alt={book.title}
            />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <p>⭐ {book.rating || 'New'}</p>
              <button>View Details</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}