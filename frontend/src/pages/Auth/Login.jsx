import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../static/auth/Login.css';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let email = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        const usernameDoc = await getDoc(doc(db, 'usernames', emailOrUsername));
        if (!usernameDoc.exists()) throw new Error('Invalid credentials');
        const userDoc = await getDoc(doc(db, 'users', usernameDoc.data().uid));
        email = userDoc.data().email;
      }
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email/username or password');
    }
  };

  const handleForgotPassword = async () => {
    if (!emailOrUsername) {
      setError('Please enter your email/username');
      return;
    }
    try {
      let email = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        const usernameDoc = await getDoc(doc(db, 'usernames', emailOrUsername));
        if (!usernameDoc.exists()) throw new Error('Username not found');
        email = (await getDoc(doc(db, 'users', usernameDoc.data().uid))).data().email;
      }
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset link sent to ${email}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Background Image */}
      <div className="login-image"></div>

      {/* Right Side - Login Form */}
      <div className="login-form">
        <div className="login-card">
          <h2>Welcome Back</h2>
          {error && <p className="error">{error}</p>}

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
                <button type="submit">Log In</button>
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
        </div>
      </div>
    </div>
  );
}