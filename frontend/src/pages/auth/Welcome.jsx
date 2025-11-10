import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme"; 
import '../../static/auth/Welcome_new.css';

export default function Welcome() {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="welcome-page">
      {/* 1. Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          
          {/* --- THIS IS THE CHANGE --- */}
        <Link to="/" className="navbar-logo">
  <img src="/Logo.jpg" alt="StorySwap Logo" className="logo-image" />
  <span>StorySwap</span>
</Link>
          {/* --- END OF CHANGE --- */}

          <div className="nav-menu">
            <button
              type="button"
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              onClick={toggleTheme} 
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            
            <Link to="/login" className="btn nav-btn btn-primary">Log In</Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1>Where stories meet and <span>books swap</span></h1>
          <p className="hero-subtitle">
            Discover new books, connect with readers, and trade your old favorites all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
            <a href="#features" className="btn btn-secondary btn-lg">Learn More</a>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2>Powerful Features</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>List Your Books</h3>
              <p>Showcase the books you’re willing to lend. Upload a cover image and basic details so others can view them.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Find Books from Other Readers</h3>
              <p>Browse the collection of books listed by other users. You can search by title or simply explore what’s available.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📬</div>
              <h3>Send Borrow Requests</h3>
              <p>When you find a book you’d like to borrow, click Send Request. The lender will receive an email with your details.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Connect Through Reading</h3>
              <p>StorySwap helps build a small network of readers who share and exchange physical books within their communities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Read Sustainably</h3>
              <p>Encourage book sharing and reduce waste by passing on stories instead of storing them away.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section (UPDATED) */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <h2>How It Works</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">1.</div>
              <h3>Sign up for free</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">2.</div>
              <h3>Add your books</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">3.</div>
              <h3>Browse others’ books</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">4.</div>
              <h3>Send or receive borrow requests</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">5.</div>
              <h3>Exchange books in person</h3>
            </div>
             {/* This empty card helps align the grid since we have 5 items */}
             <div className="feature-card feature-card-empty"></div>
          </div>
        </div>
      </section>


      {/* 5. Call-to-Action (CTA) Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Join hundreds of other book lovers already swapping stories on StorySwap.</p>
          <Link to="/signup" className="btn btn-light btn-lg">Join the Community</Link>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} StorySwap. All rights reserved.</p>
      </footer>
    </div>
  );
}