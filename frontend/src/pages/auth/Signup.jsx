import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../../static/auth/Signup.css";
import { auth, db, GeoPoint, serverTimestamp } from "../../firebase/firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setLocationError("Please enable location to find nearby books");
          console.warn("Location access denied:", err);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, []);

  // Password strength logic
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { label: "Weak", color: "#e74c3c", width: "33%" };
      case 2:
        return { label: "Moderate", color: "#f1c40f", width: "66%" };
      case 3:
      case 4:
        return { label: "Strong", color: "#27ae60", width: "100%" };
      default:
        return { label: "", color: "transparent", width: "0" };
    }
  };

  // Email validation logic
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const blacklist = [
      "example.com",
      "test.com",
      "dummy.com",
      "mailinator.com",
      "fake.com",
    ];

    if (!emailRegex.test(email)) return false;

    const domain = email.split("@")[1]?.toLowerCase();
    if (blacklist.includes(domain)) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!location) {
      setError("Location access is required");
      return;
    }

    try {
      // Ensure username uniqueness
      const usernameDoc = await getDoc(doc(db, "usernames", username));
      if (usernameDoc.exists()) {
        throw new Error("Username already taken");
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username,
        email,
        location: new GeoPoint(location.lat, location.lng),
        createdAt: serverTimestamp(),
      });

      // Map username → uid
      await setDoc(doc(db, "usernames", username), {
        uid: userCredential.user.uid,
      });

      console.log("✅ User created:", userCredential.user.uid);
      navigate("/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email already registered");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters");
          break;
        default:
          setError(err.message || "Signup failed");
      }
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="signup-page">
      <div className="intro-section">
        <h1>Welcome to StorySwap</h1>
        <p>
          Join our community of readers and share the joy of books near you.
        </p>
      </div>

      <div className="form-section">
        <div className="signup-card">
          <h2>Create Your Account</h2>

          <div className={`location-status ${location ? "success" : "error"}`}>
            {location ? (
              <>📍 Location ready</>
            ) : (
              <>⚠️ {locationError || "Detecting location..."}</>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>

            <div className="form-group password-group">
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className="password-strength">
                  <div
                    className="strength-bar"
                    style={{
                      backgroundColor: strength.color,
                      width: strength.width,
                    }}
                  ></div>
                  <span style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`signup-button ${!location ? "disabled" : ""}`}
              disabled={!location}
            >
              Sign Up
            </button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
