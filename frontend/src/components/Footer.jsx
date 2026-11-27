
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-brand">
        <strong>Resource Hub</strong>
        <p>
          Academic notes and resources for BGMIT students.
        </p>
      </div>

      <div className="footer-links">
        <a href="mailto:resourcehub@bgmit.edu.in">
          Contact
        </a>

        <Link to="/faculty-login">
          Faculty Login
        </Link>

        <Link to="/admin/login">
          Admin Login
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
