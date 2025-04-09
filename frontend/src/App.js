import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import Home from './pages/Dashboard/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Home />} /> {/* Authenticated area */}

      </Routes>
    </Router>
  );
}

export default App;