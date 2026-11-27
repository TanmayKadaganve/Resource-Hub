
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import API from "../api";
import "./LabsPage.css";

const API_URL = `${API}/lab-resources`;

const branches = [
  { name: "FIRST YEAR", label: "First Year", short: "FY" },
  { name: "CSE", label: "Computer Science & Engineering", short: "CSE" },
  { name: "AIML", label: "Artificial Intelligence & Machine Learning", short: "AI" },
  { name: "ECE", label: "Electronics & Communication", short: "ECE" },
  { name: "MECHANICAL", label: "Mechanical Engineering", short: "ME" },
  { name: "CIVIL", label: "Civil Engineering", short: "CE" },
];

function LabsPage() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("facultyToken");
  const role = localStorage.getItem("facultyRole");
  const facultyBranch = localStorage
    .getItem("facultyBranch")
    ?.trim()
    .toUpperCase();

  const isFaculty = role === "faculty" && Boolean(token);

  useEffect(() => {
    if (!selectedBranch) return;

    const fetchLabs = async () => {
      setLoading(true);
      setError("");
      setResources([]);

      try {
        const response = await fetch(
          `${API_URL}?branch=${encodeURIComponent(selectedBranch)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load lab resources.");
        }

        setResources(data.resources || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, [selectedBranch]);

  const handleDelete = async (resourceId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lab resource?"
    );

    if (!confirmDelete) return;

    setDeletingId(resourceId);

    try {
      const response = await fetch(`${API_URL}/${resourceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete resource.");
      }

      setResources((previous) =>
        previous.filter((resource) => resource._id !== resourceId)
      );
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete =
    isFaculty && facultyBranch === selectedBranch;

  return (
    <>
      <Navbar />

      <main className="labs-page">
        <div className="labs-container">
          <div className="labs-heading">
            <span className="labs-eyebrow">ACADEMIC RESOURCES</span>
            <h1>Laboratory Resources</h1>
            <p>
              Access laboratory manuals and resources organized by
              engineering branch.
            </p>
          </div>

          {!selectedBranch ? (
            <section className="labs-branch-section">
              <h2>Select Your Branch</h2>

              <div className="labs-branch-grid">
                {branches.map((branch) => (
                  <button
                    className="labs-branch-card"
                    key={branch.name}
                    onClick={() => setSelectedBranch(branch.name)}
                  >
                    <span className="labs-branch-icon">
                      {branch.short}
                    </span>

                    <span className="labs-branch-name">
                      {branch.label}
                    </span>

                    <span className="labs-branch-action">
                      View Resources →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="labs-resources-section">
              <button
                className="labs-back-button"
                type="button"
                onClick={() => setSelectedBranch(null)}
              >
                ← Back
              </button>

              <div className="labs-list-heading">
                <div>
                  <span className="labs-eyebrow">SELECTED BRANCH</span>
                  <h2>
                    {
                      branches.find(
                        (branch) => branch.name === selectedBranch
                      )?.label
                    }
                  </h2>
                </div>

                <span className="labs-resource-count">
                  {resources.length} Resources
                </span>
              </div>

              {loading && (
                <p className="labs-message">Loading lab resources...</p>
              )}

              {error && (
                <p className="labs-error">{error}</p>
              )}

              {!loading && !error && resources.length === 0 && (
                <div className="labs-empty">
                  <h3>No Lab Resources Available</h3>
                  <p>
                    Lab resources for this branch have not been uploaded yet.
                  </p>
                </div>
              )}

              {!loading && !error && resources.length > 0 && (
                <div className="labs-resource-list">
                  {resources.map((resource) => (
                    <article
                      className="labs-resource-card"
                      key={resource._id}
                    >
                      <div className="labs-resource-info">
                        <span className="labs-subject-code">
                          {resource.subjectCode}
                        </span>

                        <h3>{resource.subject}</h3>

                        <p>Semester {resource.semester}</p>
                      </div>

                      <div className="labs-resource-actions">
                        <a
                          className="labs-view-button"
                          href={resource.googleDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Lab ↗
                        </a>

                        {canDelete && (
                          <button
                            className="labs-delete-button"
                            onClick={() => handleDelete(resource._id)}
                            disabled={deletingId === resource._id}
                          >
                            {deletingId === resource._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default LabsPage;
