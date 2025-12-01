import React from "react";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "../../static/search/BookDetailModal.css";
import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";

const AVAILABLE = "Available";

export default function BookDetailModal({ book, onClose, onSendRequest }) {
  useAutoUpdateLocation();

  if (!book) return null;

  // Main send request handler (logic unchanged)
  const handleSendRequest = async () => {
    try {
      const borrower = auth.currentUser;

      if (!borrower) {
        alert("Please log in to send a request.");
        return;
      }

      // Check availability
      if (book.availability !== AVAILABLE) {
        alert("This book is not available for borrowing.");
        return;
      }

      // Prevent duplicate requests
      const requestQuery = query(
        collection(db, "borrowRequests"),
        where("borrowerId", "==", borrower.uid),
        where("bookId", "==", book.id)
      );

      const existing = await getDocs(requestQuery);
      if (!existing.empty) {
        alert("You've already sent a request for this book.");
        return;
      }

      // Save request
      await addDoc(collection(db, "borrowRequests"), {
        bookId: book.id,
        bookImage: book.coverBase64 || "",
        bookTitle: book.title,
        borrowerId: borrower.uid,
        lenderId: book.ownerId,
        timestamp: serverTimestamp(),
      });

      // Trigger email sending via backend
      await onSendRequest(book);

      alert("✅ Request sent successfully!");
      onClose();
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send request. Try again later.");
    }
  };

  // Availability formatting (unchanged logic)
  const isAvailable = book.availability === AVAILABLE;
  const availabilityClass = isAvailable ? "available" : "not-available";
  const availabilityText = book.availability || "Unknown";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="modal-image-wrapper">
            <img
              src={book.coverBase64 || ""}
              alt={book.title || "Book Cover"}
              className="modal-cover"
            />
          </div>

          <div className="modal-info">
            <h2>{book.title}</h2>

            <p>
              <strong>Author:</strong> {book.author}
            </p>
            <p>
              <strong>Genre:</strong> {book.genre}
            </p>
            <p>
              <strong>Condition:</strong> {book.condition}
            </p>

            <p>
              <strong>Availability:</strong>{" "}
              <span className={availabilityClass}>{availabilityText}</span>
            </p>

            <p>
              <strong>Owner:</strong> {book.owner?.username}
            </p>

            <p>
              <strong>Distance:</strong>{" "}
              {book.distance === Infinity
                ? "Unknown"
                : `${book.distance?.toFixed(2)} km`}
            </p>

            <p className="modal-description">
              <strong>Description:</strong>{" "}
              {book.description || "No description available."}
            </p>

            <div className="modal-actions">
              <button
                className="request-btn-small"
                onClick={handleSendRequest}
                disabled={!isAvailable}
              >
                {isAvailable ? "Send Request" : "Not Available"}
              </button>

              <button className="close-btn-small" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
