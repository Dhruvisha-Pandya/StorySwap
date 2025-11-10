import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroCarousel from "./HeroCarousel";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "../../static/home/Home.css";
import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";


export default function Home() {
  useAutoUpdateLocation();

const [searchTerm, setSearchTerm] = useState("");
const [genre, setGenre] = useState("");
const [condition, setCondition] = useState("");
const navigate = useNavigate();

const handleSearch = () => {
const params = new URLSearchParams();
if (searchTerm) params.append("q", searchTerm);
if (genre) params.append("genre", genre);
if (condition) params.append("condition", condition);
navigate(`/search?${params.toString()}`);
};

  return (
    <div className="home-container">
      <Navbar />
      {/* Hero Section with Carousel */}
      <div className="hero-section">
        <HeroCarousel />
      </div>

  {/* Search Section */}
  <section className="search-section">
    <div className="search-container">
      <h2 className="search-title">Find Your Next Read</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, author, or genre..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          <span className="search-icon">🔍</span> Search
        </button>
      </div>
      <div className="search-filters">
        <select
          className="filter-select"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          <option value="fiction">Fiction</option>
          <option value="non-fiction">Non-Fiction</option>
          <option value="fantasy">Fantasy</option>
          <option value="romance">Romance</option>
          <option value="thriller">Thriller</option>
          <option value="science">Science</option>
        </select>
        <select
          className="filter-select"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">Any Condition</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </div>
      </div>
    </section>
    <Footer />
</div>

);
}
