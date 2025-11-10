import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import Welcome from "./pages/auth/Welcome";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import MyBooks from "./components/mybooks/MyBooks";
import SearchResults from "./pages/search/SearchResults";
import RequestedBooks from "./components/profile/RequestedBooks";
import { useTheme } from "./hooks/useTheme";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize theme globally to ensure persistence
  const [theme] = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Home /> : <Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes - only accessible when logged in */}
        <Route
          path="/dashboard"
          element={user ? <Home /> : <Navigate to="/" />}
        />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route
          path="/my-books"
          element={user ? <MyBooks /> : <Navigate to="/" />}
        />
        <Route
          path="/requested-books"
          element={user ? <RequestedBooks /> : <Navigate to="/" />}
        />

        <Route
          path="/search"
          element={user ? <SearchResults /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
