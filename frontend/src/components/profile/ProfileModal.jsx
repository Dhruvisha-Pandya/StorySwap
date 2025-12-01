import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  sendEmailVerification,
  updateEmail,
} from "firebase/auth";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../static/profile/ProfileModal.css";

const ProfileModal = ({ onClose, setProfilePic: updateNavbarProfilePic }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [preferredGenre, setPreferredGenre] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);

  // -----------------------------
  // Fetch current user data
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);
      setEmail(currentUser.email);
      setEmailVerified(currentUser.emailVerified);

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || "");
          setProfilePic(data.profilePic || "");
          setPreferredGenre(data.preferredGenre || "");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    });

    return unsubscribe;
  }, []);

  // -----------------------------
  // Update profile pic helper
  // -----------------------------
  const updateProfilePic = async (newPic) => {
    setProfilePic(newPic);
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { profilePic: newPic });
      if (updateNavbarProfilePic) updateNavbarProfilePic(newPic);
    } catch (err) {
      console.error("Error updating profile pic:", err);
      alert("Failed to update profile picture.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateProfilePic(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePic = () => updateProfilePic("");

  // -----------------------------
  // Save profile changes
  // -----------------------------
  const handleSave = async () => {
    if (!user) return;

    try {
      if (email !== user.email) await updateEmail(user, email);

      await updateDoc(doc(db, "users", user.uid), {
        username,
        preferredGenre,
        email,
      });

      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile. Try again.");
    }
  };

  const handleVerifyEmail = async () => {
    if (!user || user.emailVerified) return;
    try {
      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error("Error sending verification email:", err);
      alert("Failed to send verification email. Try again later.");
    }
  };

  const handleViewRequests = () => navigate("/requested-books");

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {!emailVerified && (
          <div className="email-reminder">
            Please verify your email to send book requests.
            <button className="verify-btn" onClick={handleVerifyEmail}>
              Verify Email
            </button>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="pic-section">
          <div className="pic-wrapper">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-pic" />
            ) : (
              <FaUserCircle className="placeholder-icon" />
            )}
            <label className="upload-btn">
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>
          {profilePic && (
            <button className="remove-btn" onClick={handleRemovePic}>
              Remove Photo
            </button>
          )}
        </div>

        {/* Profile Form */}
        <div className="form">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
          />

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />

          <label>Preferred Genre</label>
          <select
            value={preferredGenre}
            onChange={(e) => setPreferredGenre(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Fiction">Fiction</option>
            <option value="Nonfiction">Nonfiction</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Mystery">Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Biography">Biography</option>
          </select>

          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>

        {/* Extra Links */}
        <div className="extras">
          <button className="link-btn" onClick={() => navigate("/my-books")}>
            📚 View My Books
          </button>
          <button className="link-btn" onClick={handleViewRequests}>
            📋 View Requested Books
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
