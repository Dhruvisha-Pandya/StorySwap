import { useState, useEffect, useCallback } from "react";
import { auth } from "../../firebase/firebase";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import BookUploadForm from "./BookUploadForm";
import BookModal from "./BookModal";
import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";
import "../../static/mybooks/my-books.css";

export default function MyBooks() {
  useAutoUpdateLocation();

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  /* ---------------- FETCH BOOKS ---------------- */
  const fetchBooks = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const res = await fetch(`${API_BASE}/api/get-books?ownerId=${user.uid}`);
      const data = await res.json();
      if (data.success) setBooks(data.books || []);
      else console.error("Error fetching books:", data.message);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  /* ---------------- HANDLE API ACTIONS ---------------- */
  const handleAddBook = async (bookData) =>
    apiAction(
      `${API_BASE}/api/add-book`,
      { ...bookData, ownerId: auth.currentUser?.uid },
      "POST",
      "✅ Book added successfully!"
    );

  const handleUpdateBook = async (bookId, updatedData) =>
    apiAction(
      `${API_BASE}/api/update-book/${bookId}`,
      updatedData,
      "PUT",
      "✅ Book updated successfully!",
      () => setSelectedBook(null)
    );

  const handleDeleteBook = async (bookId) =>
    apiAction(
      `${API_BASE}/api/delete-book/${bookId}`,
      null,
      "DELETE",
      "🗑️ Book deleted successfully!",
      () => setSelectedBook(null)
    );

  const apiAction = async (
    url,
    body,
    method = "POST",
    successMsg,
    onSuccess
  ) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (data.success) {
        alert(successMsg);
        fetchBooks();
        onSuccess?.();
      } else alert("❌ " + data.message);
    } catch (err) {
      console.error("API Error:", err);
      alert("⚠️ Something went wrong!");
    }
  };

  /* ---------------- RENDER BOOK CARD ---------------- */
  const renderBookCard = (book) => (
    <div
      key={book.id}
      className="book-card"
      onClick={() => setSelectedBook(book)}
    >
      <img
        src={book.coverBase64 || "/static/images/default-book.jpg"}
        alt={book.title}
      />
      <div className="book-details">
        <div className="book-header">
          <h3>{book.title}</h3>
          <span
            className={`availability-badge ${(book.availability || "Available")
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {book.availability || "Available"}
          </span>
        </div>
        <p className="book-author">
          <span className="detail-icon">✍️</span>
          <strong>Author:</strong> {book.author}
        </p>
        <div className="book-meta">
          <span className="book-meta-item">
            <span className="detail-icon">📚</span>
            {book.genre || "N/A"}
          </span>
          <span className="book-meta-item">
            <span className="detail-icon">📖</span>
            {book.condition || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="my-books-wrapper">
      <Navbar />
      <MyBooksHeader books={books} onAddClick={() => setShowForm(true)} />
      {showForm && (
        <BookUploadForm
          onClose={() => setShowForm(false)}
          onAddBook={handleAddBook}
        />
      )}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdateBook={handleUpdateBook}
          onDeleteBook={handleDeleteBook}
          isOwner={true}
        />
      )}
      <div className="books-grid-container">
        {books.length ? (
          books.map(renderBookCard)
        ) : (
          <div className="empty-state">
            <p>You haven't listed any books yet</p>
            <button onClick={() => setShowForm(true)}>
              List Your First Book
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/* ---------------- HEADER COMPONENT ---------------- */
function MyBooksHeader({ books, onAddClick }) {
  return (
    <div className="my-books-header">
      <div className="header-content">
        <div className="header-title-row">
          <h1>📚 My Books</h1>
          {books.length > 0 && (
            <span className="book-count-badge">
              {books.length} {books.length === 1 ? "book" : "books"}
            </span>
          )}
        </div>
        <p className="header-subtitle">Manage your book collection</p>
      </div>
      <button onClick={onAddClick} className="add-book-button">
        <span className="button-icon">+</span> Add New Book
      </button>
    </div>
  );
}
