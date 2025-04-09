// import { useState } from 'react';
// import { auth } from '../../firebase/firebase';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { db } from '../../firebase/firebase';
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { useNavigate } from 'react-router-dom';
// import '../../static/auth/Signup.css';  // Update path

// export default function Signup() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [username, setUsername] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     // Validation checks
//     if (password !== confirmPassword) {
//       setError("Passwords don't match");
//       return;
//     }
//     if (password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }

//     try {
//       // Check if username exists
//       const usernameDoc = await getDoc(doc(db, 'usernames', username));
//       if (usernameDoc.exists()) {
//         throw new Error("Username already taken");
//       }

//       // Create user in Firebase Auth (password automatically encrypted)
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
//       // Save user data to Firestore
//       await setDoc(doc(db, 'users', userCredential.user.uid), {
//         username,
//         email,
//         createdAt: new Date(),
//         location: null,
//       });

//       // Reserve username
//       await setDoc(doc(db, 'usernames', username), {
//         uid: userCredential.user.uid
//       });

//       navigate('/');
//     } catch (err) {
//       switch (err.code) {
//         case "auth/email-already-in-use":
//           setError("Email already registered");
//           break;
//         case "auth/weak-password":
//           setError("Password must be at least 6 characters");
//           break;
//         default:
//           setError(err.message || "Signup failed");
//       }
//     }
//   };

//   return (
//     <div className="signup-page">
//       <div className="intro-section">
//         <h1>Welcome to StorySwap</h1>
//         <p>Connect with fellow book lovers in your neighborhood.</p>
//       </div>

//       <div className="form-section">
//         <div className="signup-card">
//           <h2>Join the Community</h2>
//           {error && <div className="error-message">{error}</div>}
          
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <input
//                 type="password"
//                 placeholder="Password (min 6 characters)"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <input
//                 type="password"
//                 placeholder="Confirm Password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <button type="submit" className="signup-button">
//               Sign Up
//             </button>
//           </form>

//           <p className="login-link">
//             Already a member? <a href="/login">Log in</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../static/auth/Signup.css';
import { auth, db, GeoPoint, serverTimestamp } from '../../firebase/firebase';



export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
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
      // Check if username exists
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        throw new Error("Username already taken");
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user data to Firestore with location
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        location: new GeoPoint(location.lat, location.lng),
        createdAt: serverTimestamp()  // Changed from new Date()

      });

      // Reserve username
      await setDoc(doc(db, 'usernames', username), {
        uid: userCredential.user.uid
      });

      console.log("User document written with ID: ", userCredential.user.uid);
      const docSnap = await getDoc(doc(db, "users", userCredential.user.uid));
      console.log("Document exists?", docSnap.exists());
      navigate('/dashboard')
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

  return (
    <div className="signup-page">
      <div className="intro-section">
        <h1>Welcome to StorySwap</h1>
        <p>Connect with fellow book lovers in your neighborhood.</p>
      </div>

      <div className="form-section">
        <div className="signup-card">
          <h2>Join the Community</h2>
          
          {/* Location Status Indicator */}
          <div className={`location-status ${location ? 'success' : 'error'}`}>
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
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
              className="signup-button"
              disabled={!location}
            >
              Sign Up
            </button>
          </form>

          <p className="login-link">
            Already a member? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}