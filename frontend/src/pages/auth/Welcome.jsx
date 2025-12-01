import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import "../../static/auth/Welcome_new.css";

function FeatureCard({ icon, title, text, empty }) {
  return (
    <div className={`feature-card ${empty ? "feature-card-empty" : ""}`}>
      <div className="feature-icon">{icon}</div>
      {title && <h3>{title}</h3>}
      {text && <p>{text}</p>}
    </div>
  );
}

export default function Welcome() {
  const [theme, toggleTheme] = useTheme();

  // Data-driven approach for better maintainability
  const mainFeatures = [
    {
      icon: "📚",
      title: "List Your Books",
      text: "Showcase the books you're willing to lend. Upload a cover image and details.",
    },
    {
      icon: "🔍",
      title: "Find Books from Other Readers",
      text: "Browse books listed by other users and explore what's available.",
    },
    {
      icon: "📬",
      title: "Send Borrow Requests",
      text: "Send a borrow request and the lender receives an email with your details.",
    },
    {
      icon: "🤝",
      title: "Connect Through Reading",
      text: "Build a community of readers who share physical books.",
    },
    {
      icon: "🌱",
      title: "Read Sustainably",
      text: "Reduce waste by sharing books instead of storing them.",
    },
  ];

  const steps = [
    { icon: "1.", title: "Sign up for free" },
    { icon: "2.", title: "Add your books" },
    { icon: "3.", title: "Browse others’ books" },
    { icon: "4.", title: "Send or receive borrow requests" },
    { icon: "5.", title: "Exchange books in person" },
  ];

  return (
    <div className="welcome-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src="/Logo.jpg" alt="StorySwap Logo" className="logo-image" />
            <span>StorySwap</span>
          </Link>

          <div className="nav-menu">
            <button
              type="button"
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <Link to="/login" className="btn nav-btn btn-primary">
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1>
            Where stories meet and <span>books swap</span>
          </h1>
          <p className="hero-subtitle">
            Discover new books, connect with readers, and trade your old
            favorites all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2>Powerful Features</h2>

          <div className="features-grid">
            {mainFeatures.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <h2>How It Works</h2>

          <div className="features-grid">
            {steps.map((s, i) => (
              <FeatureCard key={i} icon={s.icon} title={s.title} />
            ))}

            {/* Empty slot for grid alignment */}
            <FeatureCard empty />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Join hundreds of book lovers swapping stories on StorySwap.</p>
          <Link to="/signup" className="btn btn-light btn-lg">
            Join the Community
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} StorySwap. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Smells fixed

// 1. Repetition of feature-card JSX
// Extracted a reusable <FeatureCard />

// 2. Hard-coded content
// Replaced with arrays + .map()

// 3. Huge, unmanageable component
// Reduced visual code length, logically grouped data & JSX.

// 4. Poor separation of content & UI
// Content now stored as arrays instead of deeply nested markup.

// 5. Scalability issue
// Adding/removing features now only requires editing the arrays.