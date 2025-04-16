// Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../static/home/Navbar.css';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const categories = [
    "Fiction", "Non-Fiction", "Fantasy", 
    "Sci-Fi", "Mystery", "Biography"
  ];

  return (
    <nav className="storyswap-nav">
      <Link to="/" className="logo">StorySwap</Link>
      
      {/* Browse Dropdown */}
      <div className="nav-item dropdown">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="dropdown-toggle"
        >
          Browse ▾
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            {categories.map((cat) => (
              <Link key={cat} to={`/category/${cat.toLowerCase()}`}>
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search books..." />
      </div>

      {/* Right-side Icons */}
      <div className="nav-right">
        <Link to="/my-books" className="nav-icon">
          <span>📚</span> My Books
        </Link>
        <Link to="/chat" className="nav-icon">
          <span>💬</span>
        </Link>
        <Link to="/profile" className="nav-icon">
          <span>👤</span>
        </Link>
      </div>
    </nav>
  );
}