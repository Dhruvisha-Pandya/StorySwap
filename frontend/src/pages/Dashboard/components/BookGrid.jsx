import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebase';

export default function BookGrid({ title, filter = 'all' }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      let q;
      if (filter === 'my-books') {
        q = query(collection(db, "books"), where("ownerId", "==", auth.currentUser?.uid));
      } else {
        q = collection(db, "books");
      }

      const querySnapshot = await getDocs(q);
      setBooks(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    };

    fetchBooks();
  }, [filter]);

  return (
    <div className="book-grid-section">
      <h2>{title}</h2>
      <div className="book-grid">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <div className="book-cover">
              <img 
                src={book.coverBase64} 
                alt={`${book.title} cover`}
                onError={(e) => {
                  e.target.src = '/assets/default-book.jpg';
                }}
              />
            </div>
            <div className="book-details">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <p className="condition">{book.condition} condition</p>
              {book.description && (
                <p className="description">{book.description}</p>
              )}
              <button className="request-button">Request Swap</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}