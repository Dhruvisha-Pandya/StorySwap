import { Link } from "react-router-dom";
import '../../static/auth/Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-container">
      <div className="auth-buttons">
        <Link to="/signup" className="auth-button">Sign up</Link>
        <Link to="/login" className="auth-button">Log in</Link>
      </div>
      
      <div className="welcome-content">
        <h1>Hi! We are.</h1>
        <h2>StorySwap</h2>
        <center>Where stories meet</center> 
        <center> and books swap</center>
      </div>
      
      <div className="copyright">
        © {new Date().getFullYear()} StorySwap. All rights reserved.
      </div>
    </div>
  );
}