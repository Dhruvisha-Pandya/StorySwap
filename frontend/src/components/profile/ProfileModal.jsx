import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  sendEmailVerification,
  updateEmail,
} from "firebase/auth";
import "../../static/profile/ProfileModal.css";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileModal = ({ onClose, setProfilePic: updateNavbarProfilePic }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [preferredGenre, setPreferredGenre] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email);
        setEmailVerified(user.emailVerified);

        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || "");
          setProfilePic(data.profilePic || "");
          setPreferredGenre(data.preferredGenre || "");
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newProfilePic = reader.result;
      setProfilePic(newProfilePic);
      await updateDoc(doc(db, "users", user.uid), {
        profilePic: newProfilePic,
      });
      // Update navbar profile pic if callback provided
      if (updateNavbarProfilePic) {
        updateNavbarProfilePic(newProfilePic);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePic = async () => {
    setProfilePic("");
    await updateDoc(doc(db, "users", user.uid), { profilePic: "" });
    // Update navbar profile pic if callback provided
    if (updateNavbarProfilePic) {
      updateNavbarProfilePic("");
    }
  };

  const handleSave = async () => {
    try {
      if (user && email !== user.email) {
        await updateEmail(user, email);
      }

      await updateDoc(doc(db, "users", user.uid), {
        username,
        preferredGenre,
        email,
      });

      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Try again.");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        alert("Verification email sent! Please check your inbox.");
      }
    } catch (err) {
      console.error("Error sending verification email:", err);
      alert("Failed to send verification email. Try again later.");
    }
  };

  const handleViewRequests = () => {
    navigate("/requested-books");
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        {/* Close button (X) */}
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

        <div className="extras">
          <button
            className="link-btn"
            onClick={() => (window.location.href = "/my-books")}
          >
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
