import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import BookDetailModal from "./BookDetailModal";
import "../../static/search/SearchResults.css";
import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";

export default function SearchResults() {
  useAutoUpdateLocation();
const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const query = new URLSearchParams(useLocation().search);
  const searchTerm = query.get("q")?.toLowerCase() || "";
  const genre = query.get("genre") || "";
  const condition = query.get("condition") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const currentUserDoc = await getDoc(
          doc(db, "users", auth.currentUser.uid)
        );
        const currentUser = currentUserDoc.data();
        const myLat = currentUser.location?.latitude;
        const myLng = currentUser.location?.longitude;

        const booksSnap = await getDocs(collection(db, "books"));
        const allBooks = booksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const booksWithOwners = await Promise.all(
          allBooks.map(async (book) => {
            const ownerDoc = await getDoc(doc(db, "users", book.ownerId));
            if (!ownerDoc.exists()) return null;
            const ownerData = ownerDoc.data();
            const dist = calculateDistance(
              myLat,
              myLng,
              ownerData.location?.latitude,
              ownerData.location?.longitude
            );
            return { ...book, owner: ownerData, distance: dist };
          })
        );

        let filtered = booksWithOwners.filter((b) => b);

        filtered = filtered.filter((b) => b.ownerId !== auth.currentUser.uid);

        if (searchTerm)
          filtered = filtered.filter(
            (b) =>
              b.title.toLowerCase().includes(searchTerm) ||
              b.author.toLowerCase().includes(searchTerm) ||
              b.genre.toLowerCase().includes(searchTerm)
          );

        if (genre)
          filtered = filtered.filter(
            (b) => b.genre.toLowerCase() === genre.toLowerCase()
          );

        if (condition)
          filtered = filtered.filter(
            (b) => b.condition.toLowerCase() === condition.toLowerCase()
          );

        filtered = filtered.filter((b) => b.distance <= 10);
        setBooks(filtered);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm, genre, condition]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSendRequest = async (book) => {
    try {
      const borrowerDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const borrower = borrowerDoc.data();

      const response = await fetch(
        `${API_BASE}/api/send-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lenderEmail: book.owner.email,
            lenderName: book.owner.username,
            borrowerName: borrower.username,
            borrowerEmail: borrower.email,
            bookTitle: book.title,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("✅ Request email sent successfully!");
        setSelectedBook(null);
      } else {
        alert("❌ Failed to send request: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending request.");
    }
  };

  if (loading) return <div>Loading search results...</div>;

  return (
    <div className="search-results-page">
      <Navbar />
      <div className="search-results-content">
        <h2 className="results-title">
          Showing results for "{searchTerm || "All Books"}"
        </h2>

      <div className="results-list">
        {books.length === 0 ? (
          <p className="no-results">
            No books found nearby matching your criteria.
          </p>
        ) : (
          books.map((b) => (
            <div
              key={b.id}
              className="result-item"
              onClick={() => setSelectedBook(b)}
            >
              <img src={b.coverBase64} alt={b.title} className="result-cover" />
              <div className="result-info">
                <h3 className="result-title">{b.title}</h3>
                <p>
                  <strong>Author:</strong> {b.author}
                </p>
                <p>
                  <strong>Genre:</strong> {b.genre}
                </p>
                <p>
                  <strong>Owner:</strong> {b.owner.username}
                </p>
                <p>
                  <strong>Distance:</strong> {b.distance.toFixed(2)} km
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSendRequest={handleSendRequest}
        />
      )}
      </div>
      <Footer />
    </div>
  );
}
