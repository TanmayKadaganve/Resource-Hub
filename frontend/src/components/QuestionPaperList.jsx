
import { useState } from "react";

function QuestionPaperList({
  resources,
  setResources,
  resourceType,
  loading,
  error,
  onViewPDF,
  API,
  onBack,
}) {
  const isPYQ = resourceType === "PYQ";
  const heading = isPYQ ? "Previous Year Papers" : "Model Question Papers";

  const facultyToken = localStorage.getItem("facultyToken");
  const facultyRole = localStorage.getItem("facultyRole");
  const isFaculty = Boolean(facultyToken && facultyRole === "faculty");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (resource) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${resource.originalName}?`
    );

    if (!confirmed) return;

    setDeletingId(resource._id);
    setDeleteError("");

    try {
      const response = await fetch(
        `${API}/resources/${resource._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${facultyToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete resource.");
      }

      setResources((previous) =>
        previous.filter((item) => item._id !== resource._id)
      );
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="qp-list-section">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Back to selection
      </button>

      <div className="section-heading">
        <div>
          <h2>{heading}</h2>
          <p>{resources.length} available</p>
        </div>
      </div>

      {loading && <p>Loading question papers...</p>}

      {!loading && error && (
        <p className="error-message">{error}</p>
      )}

      {deleteError && (
        <p className="error-message">{deleteError}</p>
      )}

      {!loading && !error && resources.length === 0 && (
        <div className="empty-state">
          <h3>No papers available</h3>
        </div>
      )}

      {!loading && !error && resources.length > 0 && (
        <div className="qp-resource-list">
          {resources.map((resource) => (
            <div className="qp-resource-card" key={resource._id}>
              <div className="qp-resource-info">
                <div className="pdf-icon">PDF</div>

                <div>
                  <h3>{resource.originalName}</h3>

                  {(resource.subject || resource.subjectCode) && <p>
                    {resource.subject || ""}{resource.subject && resource.subjectCode ? " · " : ""}{resource.subjectCode || ""}
                  </p>}

                  {isPYQ && resource.questionPaperYear && <p>Year: <strong>{resource.questionPaperYear}</strong></p>}

                  <span>
                    {resource.fileSize
                      ? `${(resource.fileSize / (1024 * 1024)).toFixed(2)} MB`
                      : "PDF"}
                  </span>
                </div>
              </div>

              <div className="qp-resource-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => onViewPDF(resource)}
                >
                  Open PDF
                </button>

                <a
                  className="secondary-button"
                  href={`${API}/resources/${resource._id}/download`}
                >
                  Download
                </a>

                {isFaculty && (
                  <button
                    type="button"
                    className="delete-button"
                    disabled={deletingId === resource._id}
                    onClick={() => handleDelete(resource)}
                  >
                    {deletingId === resource._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default QuestionPaperList;
