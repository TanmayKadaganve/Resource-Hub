import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import guideData from "./data/guideData";
import moreData from "./data/moreData";

import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [isFacultyLoggedIn, setIsFacultyLoggedIn] = useState(
    Boolean(
      localStorage.getItem("facultyToken") &&
      localStorage.getItem("facultyRole") === "faculty",
    ),
  );

  const [facultyBranch, setFacultyBranch] = useState(
    localStorage.getItem("facultyBranch") || "",
  );

  useEffect(() => {
    const updateFacultyStatus = () => {
      const token = localStorage.getItem("facultyToken");
      const branch = localStorage.getItem("facultyBranch");
      const role = localStorage.getItem("facultyRole");

      setIsFacultyLoggedIn(Boolean(token) && role === "faculty");
      setFacultyBranch(branch || "");
    };

    window.addEventListener("faculty-auth-changed", updateFacultyStatus);

    return () => {
      window.removeEventListener("faculty-auth-changed", updateFacultyStatus);
    };
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Syllabus", href: "/syllabus" },
    { label: "Model Papers", href: "/model-papers" },
    { label: "PYQs", href: "/pyqs" },
    { label: "Labs", href: "/labs" },
    { label: "Calculator", href: "/calculator" },
    { label: "Study Assistant", href: "/study-assistant" },
  ];

  const moreLinks = [
    { label: "Academic Calendar", url: moreData.academicCalendar },
    { label: "Notice Board", href: "/notices" },
    { label: "Revaluation Guide", url: guideData.revaluation },
    { label: "SGPA / CGPA Guide", url: guideData.sgpaCgpa },
    { label: "Internship Guide", url: guideData.internship },
  ];

  function closeMenus() {
    setMoreOpen(false);
    setMenuOpen(false);
  }

  const handleLogout = () => {
    localStorage.removeItem("facultyToken");
    localStorage.removeItem("facultyBranch");
    localStorage.removeItem("facultyRole");

    setIsFacultyLoggedIn(false);
    setFacultyBranch("");

    closeMenus();
    navigate("/");
  };

  return (
    <header className="rh-header">
      <nav className="rh-navbar" aria-label="Main navigation">
        {/* Logo */}
        <Link className="rh-brand" to="/" onClick={closeMenus}>
          <span className="rh-brand-icon" aria-hidden="true">
            RH
          </span>

          <span><strong>Resource Hub</strong></span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="rh-menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Navigation links */}
        <div className={`rh-nav-links ${menuOpen ? "is-open" : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              className="rh-nav-link"
              to={link.href}
              aria-current={location.pathname === link.href ? "page" : undefined}
              onClick={closeMenus}
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="rh-more">
            <button
              type="button"
              className="rh-nav-link rh-more-button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => {
                setMoreOpen(!moreOpen);
              }}
            >
              More <span aria-hidden="true">{moreOpen ? "▴" : "▾"}</span>
            </button>

            {moreOpen && (
              <div className="rh-dropdown">
                {moreLinks.map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="rh-dropdown-link"
                      onClick={closeMenus}
                    >
                      {link.label}
                    </Link>
                  ) : link.url ? (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rh-dropdown-link"
                      onClick={closeMenus}
                    >
                      {link.label}
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </div>

          {/* Faculty navigation */}
          {isFacultyLoggedIn ? (
            <>
              <span className="rh-nav-link">{facultyBranch} Faculty</span>

              <Link className="rh-nav-link" to="/upload" onClick={closeMenus}>
                Upload Notes
              </Link>

              <button
                type="button"
                className="rh-nav-link"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              className="rh-nav-link"
              to="/faculty-login"
              onClick={closeMenus}
            >
              Faculty Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
