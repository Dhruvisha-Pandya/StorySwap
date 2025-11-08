import { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import BookUploadForm from "./BookUploadForm";
import BookModal from "./BookModal";
import "../../static/mybooks/my-books.css";
import Navbar from "../navbar/Navbar";
import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";

export default function MyBooks() {
  useAutoUpdateLocation();

  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  // const [editingBook, setEditingBook] = useState(null); // not required with modal edit, kept if reusing form

  // Fetch user books from Flask backend
  const fetchBooks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const res = await fetch(
        `http://127.0.0.1:5000/api/get-books?ownerId=${user.uid}`
      );
      const data = await res.json();

      if (data.success) {
        setBooks(data.books || []);
      } else {
        console.error("Error fetching books:", data.message);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    // If auth state may not be ready immediately, you might want to listen for onAuthStateChanged
    fetchBooks();
  }, []);

  // Add new book
  const handleAddBook = async (bookData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to add books!");
        return;
      }

      const payload = { ...bookData, ownerId: user.uid };

      const res = await fetch("http://127.0.0.1:5000/api/add-book", {
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

  // Update book (called by modal)
  const handleUpdateBook = async (bookId, updatedData) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/update-book/${bookId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

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

  // Delete book (called by modal)
  const handleDeleteBook = async (bookId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/delete-book/${bookId}`,
        {
          method: "DELETE",
        }
      );
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
    <div>
      <Navbar />
      <div className="my-books-header">
        <h1>My Books</h1>
        <button onClick={() => setShowForm(true)} className="add-book-button">
          + Add Book
        </button>
      </div>

      {/* Upload Form (add new) */}
      {showForm && (
        <BookUploadForm
          onClose={() => setShowForm(false)}
          onAddBook={handleAddBook}
        />
      )}

      {/* Book Modal (view / edit / delete) */}
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
                <h3>{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <p className="book-description">
                  {book.description || "No description provided"}
                </p>
                <span
                  className={`book-condition ${book.condition?.toLowerCase()}`}
                >
                  {book.condition}
                </span>
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
