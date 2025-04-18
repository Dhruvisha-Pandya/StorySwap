import React from "react";
import { useLocation } from "react-router-dom";

const BookCard = ({ book }) => {
  const { id, title, author, condition, price, coverBase64 } = book;
  const location = useLocation();

  return (
    <div className="book-card">
      <img src={coverBase64 || "/static/images/default-book.jpg"} alt={title} />
      <div className="book-card-content">
        <h3>{title}</h3>
        <p>{author}</p>
        <span className="condition">{condition}</span>
        {price && <p className="price">₹{price}/month</p>}
        {location.pathname === "/dashboard" && (
          <button>Request Swap</button>
        )}
      </div>
    </div>
  );
};

export default BookCard;