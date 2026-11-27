
import { useState } from "react";

function ResourceList({
  branch,
  semester,
  subject,
  module,
  API,
  renderBackButton,
  setModule,
  setResources,
  setError,
  setSelectedPDF,
  search,
  setSearch,
  filteredResources,
  loading,
  error,
}) {
  const facultyToken = localStorage.getItem("facultyToken");
  const facultyRole = localStorage.getItem("facultyRole");

  const isFaculty = Boolean(
    facultyToken && facultyRole === "faculty"
  );

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(resource) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.originalName}"?`
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
        throw new Error(data.message || "Unable to delete resource");
      }

      setResources((previousResources) =>
        previousResources.filter(
          (item) => item._id !== resource._id
        )
      );
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      {renderBackButton("Back to Modules", () => {
        setModule(null);
        setResources([]);
        setError("");
      })}

      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {branch} · SEMESTER {semester}
          </p>

          <h2>Module {module.number} Resources</h2>
          <p>{subject.name}</p>
        </div>
      </div>

      <div className="resource-toolbar">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources..."
            aria-label="Search resources"
          />
        </label>

        <span className="resource-count">
          {filteredResources.length} resources
        </span>
      </div>

      {loading && (
        <p className="status-message">Loading resources...</p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {deleteError && (
        <p className="error-message" role="alert">
          {deleteError}
        </p>
      )}

      {!loading && !error && filteredResources.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">▤</span>

          <h3>No resources available yet</h3>

          <p>Try another module or check back later.</p>
        </div>
      )}

      <div className="resource-list">
        {filteredResources.map((resource) => (
          <article className="resource-row" key={resource._id}>
            <div className="pdf-icon">PDF</div>

            <div className="resource-info">
              <h3>{resource.originalName}</h3>

              <p>
                {resource.resourceType || "Study Material"}

                {resource.fileSize
                  ? ` · ${(resource.fileSize / 1024 / 1024).toFixed(2)} MB`
                  : ""}
              </p>
            </div>

            <div className="resource-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSelectedPDF(resource)}
              >
                Read PDF
              </button>

              <a
                className="primary-button"
                href={`${API}/resources/${resource._id}/download`}
              >
                Download
              </a>

              {isFaculty && (
                <button
                  className="secondary-button"
                  type="button"
                  disabled={deletingId === resource._id}
                  onClick={() => handleDelete(resource)}
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
    </section>
  );
}

export default ResourceList;
