import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import "../../static/profile/RequestedBooks.css";

const RequestedBooks = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchUserRequests(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserRequests = async (userId) => {
    try {
      // Fetch borrow requests from Firestore
      const q = query(
        collection(db, "borrowRequests"),
        where("borrowerId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Enrich requests with book and lender details
      const enrichedRequests = await Promise.all(
        requestsData.map(async (req) => {
          try {
            // Fetch book details
            const bookDoc = await getDoc(doc(db, "books", req.bookId));
            const bookData = bookDoc.exists() ? bookDoc.data() : {};

            // Fetch lender details
            const lenderDoc = await getDoc(doc(db, "users", req.lenderId));
            const lenderData = lenderDoc.exists() ? lenderDoc.data() : {};

            return {
              ...req,
              author: bookData.author || "Unknown",
              genre: bookData.genre || "Unknown",
              lenderName: lenderData.username || "Unknown",
              requestDate: req.timestamp?.toDate
                ? req.timestamp.toDate().toLocaleDateString()
                : "Unknown",
            };
          } catch (error) {
            console.error("Error enriching request:", error);
            return {
              ...req,
              author: "Unknown",
              genre: "Unknown",
              lenderName: "Unknown",
              requestDate: "Unknown",
            };
          }
        })
      );

      setRequests(enrichedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="requested-books-container">
        <div className="loading">Loading your requested books...</div>
      </div>
    );
  }

  return (
    <div className="requested-books-container">
      <Navbar />
      <h2 className="requested-books-title">📚 Your Requested Books</h2>

      {requests.length > 0 ? (
        <div className="requested-list">
          {requests.map((req, index) => (
            <div className="requested-item" key={req.id || index}>
              {req.bookImage && (
                <img
                  src={req.bookImage}
                  alt={req.bookTitle}
                  className="requested-cover"
                />
              )}
              <div className="requested-info">
                <h3 className="requested-title">{req.bookTitle}</h3>
                <p>
                  <strong>Author:</strong> {req.author}
                </p>
                <p>
                  <strong>Genre:</strong> {req.genre}
                </p>
                <p>
                  <strong>Lender:</strong> {req.lenderName}
                </p>
                <p>
                  <strong>Requested On:</strong> {req.requestDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-requests-section">
          <p className="no-requests">You haven't requested any books yet.</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Profile
          </button>
        </div>
      )}

      {requests.length > 0 && (
        <div className="requested-footer">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Profile
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default RequestedBooks;
