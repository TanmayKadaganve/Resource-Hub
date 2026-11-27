import { useState } from "react";
import Navbar from "../Navbar";
import syllabusData from "../data/syllabusData";

function SyllabusPage() {
  const [selectedScheme, setSelectedScheme] = useState("");
  const [expandedBranch, setExpandedBranch] = useState("");

  const branches = selectedScheme ? syllabusData[selectedScheme] || [] : [];

  const handleSchemeChange = (scheme) => {
    setSelectedScheme(scheme);
    setExpandedBranch("");
  };

  const toggleSemesterSyllabus = (branch) => {
    setExpandedBranch((previous) => (previous === branch ? "" : branch));
  };

  return (
    <>
      <Navbar />

      <main className="syllabus-page">
        <div className="syllabus-container">
          {/* Page Heading */}
          <div className="syllabus-header">
            <h1>Engineering Syllabus</h1>
            <p>
              Find syllabus documents by scheme and branch.
            </p>
          </div>

          {/* Scheme Selection */}
          <section className="scheme-selection">
            <h2>Select VTU Scheme</h2>
            <p>Choose a scheme.</p>

            <div className="scheme-grid">
              {["2022", "2025"].map((scheme) => (
                <button
                  key={scheme}
                  type="button"
                  className={`scheme-card ${
                    selectedScheme === scheme ? "active" : ""
                  }`}
                  onClick={() => handleSchemeChange(scheme)}
                  aria-pressed={selectedScheme === scheme}
                >
                  <span>{scheme}</span>
                  <small>VTU SCHEME</small>
                </button>
              ))}
            </div>
          </section>

          {/* Branch Cards */}
          {selectedScheme && (
            <section className="syllabus-branches">
              <div className="syllabus-section-heading">
                <div>
                  <p className="eyebrow">{selectedScheme} SCHEME</p>
                  <h2>Available Branches</h2>
                </div>
                <span>{branches.length} Branches</span>
              </div>

              <div className="syllabus-card-grid">
                {branches.map((item) => {
                  const branchKey = `${selectedScheme}-${item.branch}`;

                  return (
                    <article className="syllabus-card" key={item.branch}>
                      <div className="syllabus-card-content">
                        <h3>{item.branch}</h3>
                      </div>

                      <div className="syllabus-card-actions">
                        {/* Main Syllabus */}
                        {item.mainSyllabus ? (
                          <a
                            className="syllabus-main-button"
                            href={item.mainSyllabus}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            ↓ View Main Syllabus
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="syllabus-main-button"
                            disabled
                          >
                            Main Syllabus Not Available
                          </button>
                        )}

                        {/* Semester-wise Syllabus Dropdown Button */}
                        <button
                          type="button"
                          className="syllabus-dropdown-button"
                          onClick={() => toggleSemesterSyllabus(branchKey)}
                          aria-expanded={expandedBranch === branchKey}
                        >
                          View Semester-wise Syllabus
                          <span>
                            {expandedBranch === branchKey ? "▴" : "▾"}
                          </span>
                        </button>

                        {/* Floating Semester Options */}
                        {expandedBranch === branchKey && (
                          <div className="semester-dropdown-menu">
                            {item.semesterSyllabus?.length > 0 ? (
                              item.semesterSyllabus.map((semester) => (
                                <a
                                  key={semester.semester}
                                  href={semester.url || undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`semester-dropdown-item ${
                                    !semester.url ? "disabled" : ""
                                  }`}
                                  onClick={(event) => {
                                    if (!semester.url) {
                                      event.preventDefault();
                                    }
                                  }}
                                  aria-disabled={!semester.url}
                                >
                                  <span>Semester {semester.semester}</span>
                                  <span className="semester-download-icon">
                                    ↓
                                  </span>
                                </a>
                              ))
                            ) : (
                              <p className="syllabus-empty-message">
                                No documents available.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default SyllabusPage;
