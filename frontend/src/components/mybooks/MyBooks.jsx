import { useState, useEffect, useCallback } from "react";
import { auth } from "../../firebase/firebase";
import BookUploadForm from "./BookUploadForm";
import BookModal from "./BookModal";
import "../../static/mybooks/my-books.css";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";

export default function MyBooks() {
  useAutoUpdateLocation();

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  //  Wrapped in useCallback to stabilize reference
  const fetchBooks = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const res = await fetch(`${API_BASE}/api/get-books?ownerId=${user.uid}`);
      const data = await res.json();

      if (data.success) {
        setBooks(data.books || []);
      } else {
        console.error("Error fetching books:", data.message);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAddBook = async (bookData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to add books!");
        return;
      }

      const payload = { ...bookData, ownerId: user.uid };
      const res = await fetch(`${API_BASE}/api/add-book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Book added successfully!");
        setShowForm(false);
        fetchBooks();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("⚠️ Failed to add book");
    }
  };

  const handleUpdateBook = async (bookId, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/api/update-book/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Book updated successfully!");
        fetchBooks();
        setSelectedBook(null);
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Error updating book:", error);
      alert("⚠️ Failed to update book");
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const res = await fetch(`${API_BASE}/api/delete-book/${bookId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("🗑️ Book deleted successfully!");
        fetchBooks();
        setSelectedBook(null);
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("⚠️ Failed to delete book");
    }
  };

  return (
    <div className="my-books-wrapper">
      <Navbar />
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
        <button onClick={() => setShowForm(true)} className="add-book-button">
          <span className="button-icon">+</span> Add New Book
        </button>
      </div>

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
        {books.length > 0 ? (
          books.map((book) => (
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
                    className={`availability-badge ${(
                      book.availability || "Available"
                    )
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
      <Footer />
    </div>
  );
}
