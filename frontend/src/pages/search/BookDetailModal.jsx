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

export default function BookDetailModal({ book, onClose, onSendRequest }) {
  useAutoUpdateLocation();

  if (!book) return null;

  // Enhanced send request handler
  const handleSendRequest = async () => {
    try {
      const borrower = auth.currentUser;
      if (!borrower) {
        alert("Please log in to send a request.");
        return;
      }

      // ✅ Check if book is available before sending request
      if (book.availability !== "Available") {
        alert("This book is not available for borrowing.");
        return;
      }

      // ✅ Prevent duplicate requests for same book
      const q = query(
        collection(db, "borrowRequests"),
        where("borrowerId", "==", borrower.uid),
        where("bookId", "==", book.id)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        alert("You've already sent a request for this book.");
        return;
      }

      // ✅ Save only minimal required data in Firestore
      await addDoc(collection(db, "borrowRequests"), {
        bookId: book.id,
        bookImage: book.coverBase64 || "",
        bookTitle: book.title,
        borrowerId: borrower.uid,
        lenderId: book.ownerId,
        timestamp: serverTimestamp(),
      });

      // ✅ Continue sending the email (Flask API) - this handles the email part
      await onSendRequest(book);

      alert("✅ Request sent successfully!");
      onClose();
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send request. Try again later.");
    }
  };

  // Determine availability status and styling
  const isAvailable = book.availability === "Available";
  const availabilityClass = isAvailable ? "available" : "not-available";
  const availabilityText = book.availability || "Unknown";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="modal-image-wrapper">
            <img
              src={book.coverBase64}
              alt={book.title}
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
                : `${book.distance.toFixed(2)} km`}
            </p>
            <p className="modal-description">
              <strong>Description:</strong>{" "}
              {book.description || "No description available."}
            </p>

            {/* Small buttons side-by-side */}
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
