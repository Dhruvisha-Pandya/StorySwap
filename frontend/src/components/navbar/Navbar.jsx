import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../static/navbar/Navbar.css";
import ProfileModal from "../profile/ProfileModal";
import { useTheme } from "../../hooks/useTheme";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [theme, toggleTheme] = useTheme();

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user's profile pic
  useEffect(() => {
    const fetchProfilePic = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        if (userDoc.exists() && data.profilePic) setProfilePic(data.profilePic);
      } catch (err) {
        console.error("Error fetching profile pic:", err);
      }
    };
    fetchProfilePic();
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    alert("Your account has been deleted.");
    // TODO: delete user from Firebase Auth and Firestore
    navigate("/signup");
  };

  // JSX Components
  const renderDropdownMenu = () => (
    <div className="dropdown-menu">
      <button
        onClick={() => {
          setShowProfileModal(true);
          setIsDropdownOpen(false);
        }}
      >
        Profile / Settings
      </button>
      <button onClick={handleLogout}>Logout</button>
      <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>
        Delete Account
      </button>
    </div>
  );

  const renderDeleteModal = () => (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="danger-text">⚠️ Delete Account</h3>
        <p>
          This action cannot be undone. Are you sure you want to permanently
          delete your account?
        </p>
        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button className="confirm-delete" onClick={confirmDelete}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <nav className="storyswap-nav">
      <Link to="/" className="logo">
        <img src="/Logo.png" alt="StorySwap Logo" className="logo-image" />
        <span>StorySwap</span>
      </Link>

      <div className="nav-right">
        <button
          type="button"
          className="theme-toggle-btn"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <Link to="/my-books" className="nav-icon">
          <span className="icon">📚</span>
          <span className="text">My Books</span>
        </Link>

        <div className="profile-dropdown" ref={dropdownRef}>
          <button
            className="profile-icon-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Profile menu"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="nav-profile-pic" />
            ) : (
              <span className="profile-icon-placeholder">👤</span>
            )}
          </button>

          {isDropdownOpen && renderDropdownMenu()}
        </div>
      </div>

      {showDeleteModal && renderDeleteModal()}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          setProfilePic={setProfilePic}
        />
      )}
    </nav>
  );
}
