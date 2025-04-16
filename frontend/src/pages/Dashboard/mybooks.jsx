import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import BookUploadForm from './components/BookUploadForm';
import '../../static/home/my-books.css';

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "books"), where("ownerId", "==", auth.currentUser.uid));
        const snapshot = await getDocs(q);
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchBooks();
  }, []);

  const handleAddBook = async (bookData) => {
    try {
      const coverRef = ref(storage, `covers/${Date.now()}_${bookData.cover.name}`);
      await uploadBytes(coverRef, bookData.cover);
      const coverURL = await getDownloadURL(coverRef);

      await addDoc(collection(db, "books"), {
        title: bookData.title,
        author: bookData.author,
        condition: bookData.condition,
        genre: bookData.genre,
        price: bookData.price,
        coverURL,
        ownerId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      
      // Refresh the books list
      const q = query(collection(db, "books"), where("ownerId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setShowForm(false);
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  return (
    <div className="my-books-page">
      <div className="my-books-header">
        <h1>My Books</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="add-book-button"
        >
          + Add Book
        </button>
      </div>

      {showForm && (
        <BookUploadForm 
          onClose={() => setShowForm(false)}
          onAddBook={handleAddBook}
        />
      )}

      <div className="books-grid-container">
        {books.length > 0 ? (
          books.map(book => (
            <div key={book.id} className="book-card">
              <img src={book.coverURL || '/static/images/default-book.jpg'} alt={book.title} />
              <div className="book-details">
                <h3>{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <span className={`book-condition ${book.condition.toLowerCase()}`}>
                  {book.condition}
                </span>
                {book.price && <p className="book-price">₹{book.price}/month</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>You haven't listed any books yet</p>
            <button onClick={() => setShowForm(true)}>
              List Your First Book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}