import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import guideData from "./data/guideData";

import moreData from "./data/moreData";

import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const [moreOpen, setMoreOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
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
    // { label: "Notices", href: "/notices" },
  ];

  const guideLinks = [
    {
      label: "Revaluation Guide",
      url: guideData.revaluation,
    },
    {
      label: "SGPA/CGPA Guide",
      url: guideData.sgpaCgpa,
    },
    {
      label: "Internship Guide",
      url: guideData.internship,
    },
  ];

  const moreLinks = [
    { label: "Academic Calendar", url: moreData.academicCalendar },
    { label: "Activity", url: moreData.activity },
    { label: "Notice Board", href: "/notices" },
  ];

  function closeMenus() {
    setMoreOpen(false);
    setGuideOpen(false);
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

          <span>
            <strong>Resource Hub</strong>
            <small>BGMIT Academic Portal</small>
          </span>
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
              onClick={closeMenus}
            >
              {link.label}
            </Link>
          ))}

          {/* Guide dropdown */}
          {/* Guide dropdown */}
          <div className="rh-more">
            <button
              type="button"
              className="rh-nav-link rh-more-button"
              aria-expanded={guideOpen}
              aria-haspopup="true"
              onClick={() => {
                setGuideOpen(!guideOpen);
                setMoreOpen(false);
              }}
            >
              Guide <span aria-hidden="true">{guideOpen ? "▴" : "▾"}</span>
            </button>

            {guideOpen && (
              <div className="rh-dropdown">
                {guideLinks.map((link) =>
                  link.url ? (
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
                  ) : (
                    <span
                      key={link.label}
                      className="rh-dropdown-link"
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                    >
                      {link.label} (Coming Soon)
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          {/* More dropdown */}
          <div className="rh-more">
            <button
              type="button"
              className="rh-nav-link rh-more-button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => {
                setMoreOpen(!moreOpen);
                setGuideOpen(false);
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
                  ) : (
                    <span
                      key={link.label}
                      className="rh-dropdown-link"
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                    >
                      {link.label} (Coming Soon)
                    </span>
                  ),
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
