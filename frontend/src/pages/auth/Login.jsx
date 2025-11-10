import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../../static/auth/Login.css";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load saved preference from localStorage
    return localStorage.getItem("theme") === "dark";
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Apply theme on load and whenever toggled
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLocationStatus("");

    try {
      let email = emailOrUsername;

      // Handle login with username
      if (!emailOrUsername.includes("@")) {
        const usernameDoc = await getDoc(doc(db, "usernames", emailOrUsername));
        if (!usernameDoc.exists()) throw new Error("Invalid credentials");
        const userDoc = await getDoc(doc(db, "users", usernameDoc.data().uid));
        email = userDoc.data().email;
      }

      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get location and update Firestore
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await updateDoc(doc(db, "users", user.uid), {
              location: { latitude, longitude },
            });
            console.log("✅ Location updated:", latitude, longitude);
            setLocationStatus("📍 Location updated successfully!");
            navigate("/dashboard");
          },
          (error) => {
            console.warn("⚠️ Could not fetch location:", error.message);
            setLocationStatus("⚠️ Location access denied, continuing...");
            navigate("/dashboard");
          }
        );
      } else {
        console.warn("⚠️ Geolocation not supported");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email/username or password");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    if (!emailOrUsername) {
      setError("Please enter your email or username");
      return;
    }
    try {
      let email = emailOrUsername;
      if (!emailOrUsername.includes("@")) {
        const usernameDoc = await getDoc(doc(db, "usernames", emailOrUsername));
        if (!usernameDoc.exists()) throw new Error("Username not found");
        email = (await getDoc(doc(db, "users", usernameDoc.data().uid))).data()
          .email;
      }
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset link sent to ${email}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      {/* Theme toggle button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      {/* Left Side - Image Section */}
      <div className="login-image"></div>

      {/* Right Side - Login Form */}
      <div className="login-form">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <div className="login-card">
          <h2>Welcome Back</h2>
          {error && <p className="error">{error}</p>}
          {locationStatus && (
            <p
              className={`location-status ${
                locationStatus.includes("⚠️") ? "error" : "success"
              }`}
            >
              {locationStatus}
            </p>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email or Username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />

            {!isForgotPassword ? (
              <>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit" className="login-btn">
                  Log In
                </button>

                <div className="auth-options">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-btn"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-btn"
                >
                  Send Reset Link
                </button>
                <div className="auth-options">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-btn"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
