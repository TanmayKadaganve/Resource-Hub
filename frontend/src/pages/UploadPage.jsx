
import { useState } from "react";
import { getSubjects } from "../data/curriculum";
import API from "../api";
import "./UploadPage.css";

const resourceTypes = ["Notes", "Model QP", "PYQ", "Lab"];

const initialFormData = {
  scheme: "2025",
  semester: "",
  subject: "",
  module: "",
  questionPaperYear: "",
};

const initialLabData = {
  branch: "",
  semester: "",
  subjectCode: "",
  subject: "",
  googleDriveLink: "",
};

function UploadPage() {
  const facultyBranch = localStorage.getItem("facultyBranch") || "";

  const [resourceType, setResourceType] = useState("Notes");
  const [formData, setFormData] = useState(initialFormData);
  const [labData, setLabData] = useState(initialLabData);

  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const subjects = getSubjects(
    formData.scheme,
    facultyBranch,
    formData.semester
  );

  const selectedSubject = subjects.find(
    (item) => item.name === formData.subject
  );

  const subjectCode = selectedSubject?.code || "";

  const handleCategoryChange = (category) => {
    setResourceType(category);
    setMessage("");
    setPdf(null);

    setFormData(initialFormData);
    setLabData(initialLabData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "scheme" || name === "semester"
        ? {
          subject: "",
          module: "",
          questionPaperYear: "",
        }
        : {}),
    }));

    setMessage("");
  };

  const handleLabChange = (e) => {
    const { name, value } = e.target;

    setLabData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setMessage("");
    setPdf(null);

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessageType("error");
      setMessage("Please select a PDF file only.");
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessageType("error");
      setMessage("PDF size must not exceed 20 MB.");
      e.target.value = "";
      return;
    }

    setPdf(file);
  };

  // Lab resource submission
  const handleLabSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const token = localStorage.getItem("facultyToken");

    if (!token) {
      setMessageType("error");
      setMessage("Please log in as faculty first.");
      return;
    }

    if (!labData.branch || !labData.semester) {
      setMessageType("error");
      setMessage("Please select branch and semester.");
      return;
    }

    if (
      !labData.subjectCode.trim() ||
      !labData.subject.trim() ||
      !labData.googleDriveLink.trim()
    ) {
      setMessageType("error");
      setMessage("Please fill all Lab resource fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/lab-resources`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            branch: labData.branch,
            semester: Number(labData.semester),
            subjectCode: labData.subjectCode.trim(),
            subject: labData.subject.trim(),
            googleDriveLink: labData.googleDriveLink.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Lab resource upload failed.");
      }

      setMessageType("success");
      setMessage(result.message || "Lab resource added successfully.");

      setLabData(initialLabData);
      e.target.reset();
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to add Lab resource.");
    } finally {
      setLoading(false);
    }
  };

  // Normal PDF resource submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const token = localStorage.getItem("facultyToken");

    if (!token) {
      setMessageType("error");
      setMessage("Please log in as faculty first.");
      return;
    }

    if (!facultyBranch) {
      setMessageType("error");
      setMessage("Faculty branch information is missing. Please log in again.");
      return;
    }

    if (!selectedSubject) {
      setMessageType("error");
      setMessage("Please select a valid subject.");
      return;
    }

    if (!subjectCode.trim()) {
      setMessageType("error");
      setMessage("Subject code is missing from curriculum.js.");
      return;
    }

    if (resourceType === "Notes" && !formData.module) {
      setMessageType("error");
      setMessage("Please select a module.");
      return;
    }

    if (resourceType === "PYQ" && !formData.questionPaperYear) {
      setMessageType("error");
      setMessage("Please enter the question paper year.");
      return;
    }

    if (!pdf) {
      setMessageType("error");
      setMessage("Please select a PDF file.");
      return;
    }

    const data = new FormData();

    data.append("scheme", formData.scheme);
    data.append("semester", formData.semester);
    data.append("subject", formData.subject.trim());
    data.append("subjectCode", subjectCode.trim());
    data.append("resourceType", resourceType);
    data.append("pdf", pdf);

    if (resourceType === "Notes") {
      data.append("module", formData.module);
    }

    if (resourceType === "PYQ") {
      data.append("questionPaperYear", formData.questionPaperYear);
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/resources/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessageType("success");
      setMessage(result.message || "Resource uploaded successfully.");

      setFormData(initialFormData);
      setResourceType("Notes");
      setPdf(null);

      e.target.reset();
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to upload resource.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="upload-page">
      <div className="upload-container">

        <div className="upload-heading">
          <span className="upload-eyebrow">FACULTY DASHBOARD</span>
          <h1>Upload Academic Resource</h1>
          <p>Add academic resources for students in your branch.</p>
        </div>

        <form
          className="upload-card"
          onSubmit={
            resourceType === "Lab"
              ? handleLabSubmit
              : handleSubmit
          }
        >

          <section className="upload-section">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Resource Category</h2>
                <p>Select the type of resource you want to add.</p>
              </div>
            </div>

            <div
              className="resource-category-row"
              role="group"
              aria-label="Resource category"
            >
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`resource-category-button ${resourceType === type ? "active" : ""
                    }`}
                  onClick={() => handleCategoryChange(type)}
                  aria-pressed={resourceType === type}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <div className="upload-divider" />

          {resourceType === "Lab" ? (
            <>
              <section className="upload-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <div>
                    <h2>Lab Information</h2>
                    <p>Enter the academic details and Google Drive link.</p>
                  </div>
                </div>

                <div className="upload-grid">

                  <div className="upload-field">
                    <label htmlFor="labBranch">Branch</label>
                    <select
                      id="labBranch"
                      name="branch"
                      value={labData.branch}
                      onChange={handleLabChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      {[
                        "FIRST YEAR",
                        "CSE",
                        "AIML",
                        "ECE",
                        "MECHANICAL",
                        "CIVIL",
                      ].map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    <small>
                      Your login branch is {facultyBranch}.
                      The server will verify your branch.
                    </small>
                  </div>

                  <div className="upload-field">
                    <label htmlFor="labSemester">Semester</label>
                    <select
                      id="labSemester"
                      name="semester"
                      value={labData.semester}
                      onChange={handleLabChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="upload-field">
                    <label htmlFor="labSubjectCode">Subject Code</label>
                    <input
                      id="labSubjectCode"
                      name="subjectCode"
                      type="text"
                      placeholder="Enter subject code"
                      value={labData.subjectCode}
                      onChange={handleLabChange}
                      required
                    />
                  </div>

                  <div className="upload-field">
                    <label htmlFor="labSubject">Subject Name</label>
                    <input
                      id="labSubject"
                      name="subject"
                      type="text"
                      placeholder="Enter lab subject name"
                      value={labData.subject}
                      onChange={handleLabChange}
                      required
                    />
                  </div>

                  <div className="upload-field upload-full-width">
                    <label htmlFor="googleDriveLink">
                      Google Drive PDF Link
                    </label>
                    <input
                      id="googleDriveLink"
                      name="googleDriveLink"
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={labData.googleDriveLink}
                      onChange={handleLabChange}
                      required
                    />
                    <small>
                      Make sure the PDF sharing permission is set to
                      Anyone with the link – Viewer.
                    </small>
                  </div>

                </div>
              </section>

              <div className="upload-divider" />

              <div className="upload-actions">
                <button
                  type="submit"
                  className="upload-submit"
                  disabled={loading}
                >
                  {loading ? "Adding Lab Resource..." : "Add Lab Resource"}
                </button>
              </div>
            </>
          ) : (
            <>
              <section className="upload-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <div>
                    <h2>Academic Information</h2>
                    <p>Select the academic details for this resource.</p>
                  </div>
                </div>

                <div className="upload-grid">

                  <div className="upload-field">
                    <label htmlFor="branch">Branch</label>
                    <input
                      id="branch"
                      type="text"
                      value={facultyBranch}
                      readOnly
                    />
                    <small>Automatically assigned from faculty login.</small>
                  </div>

                  <div className="upload-field">
                    <label htmlFor="scheme">VTU Scheme</label>
                    <select
                      id="scheme"
                      name="scheme"
                      value={formData.scheme}
                      onChange={handleChange}
                      required
                    >
                      <option value="2022">2022 Scheme</option>
                      <option value="2025">2025 Scheme</option>
                    </select>
                  </div>

                  <div className="upload-field">
                    <label htmlFor="semester">Semester</label>
                    <select
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="upload-field">
                    <label htmlFor="subject">Subject Name</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={!formData.semester || subjects.length === 0}
                      required
                    >
                      <option value="">
                        {!formData.semester
                          ? "Select semester first"
                          : subjects.length === 0
                            ? "No subjects available"
                            : "Select Subject"}
                      </option>

                      {subjects.map((subject) => (
                        <option
                          key={`${subject.code}-${subject.name}`}
                          value={subject.name}
                        >
                          {subject.code
                            ? `${subject.code} - ${subject.name}`
                            : subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="upload-field">
                    <label htmlFor="subjectCode">Subject Code</label>
                    <input
                      id="subjectCode"
                      type="text"
                      value={subjectCode}
                      placeholder="Automatically filled"
                      readOnly
                    />
                    <small>Automatically populated from curriculum.</small>
                  </div>

                  {resourceType === "Notes" && (
                    <div className="upload-field">
                      <label htmlFor="module">Module</label>
                      <select
                        id="module"
                        name="module"
                        value={formData.module}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Module</option>
                        {[1, 2, 3, 4, 5].map((mod) => (
                          <option key={mod} value={mod}>
                            Module {mod}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {resourceType === "PYQ" && (
                    <div className="upload-field">
                      <label htmlFor="questionPaperYear">
                        Question Paper Year
                      </label>
                      <input
                        id="questionPaperYear"
                        name="questionPaperYear"
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        placeholder="Enter year (e.g. 2025)"
                        value={formData.questionPaperYear}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                </div>
              </section>

              <div className="upload-divider" />

              <section className="upload-section">
                <div className="section-heading">
                  <span className="section-number">03</span>
                  <div>
                    <h2>Upload PDF</h2>
                    <p>Select the PDF file for the chosen resource.</p>
                  </div>
                </div>

                <div className="upload-field">
                  <label htmlFor="pdf">PDF File</label>

                  <label className="pdf-drop-area" htmlFor="pdf">
                    <span className="pdf-icon">PDF</span>
                    <strong>
                      {pdf ? pdf.name : "Choose a PDF file"}
                    </strong>
                    <span>
                      {pdf
                        ? `${(pdf.size / (1024 * 1024)).toFixed(2)} MB`
                        : "Click here to browse your files"}
                    </span>
                    <small>PDF only · Maximum file size 20 MB</small>
                  </label>

                  <input
                    id="pdf"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    hidden
                  />
                </div>
              </section>

              <div className="upload-actions">
                <button
                  type="submit"
                  className="upload-submit"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Resource"}
                </button>
              </div>
            </>
          )}

          {message && (
            <div
              className={`upload-message ${messageType}`}
              role="alert"
            >
              {message}
            </div>
          )}

        </form>

        <p className="upload-security-note">
          <span>🔒</span>
          Your resource will be available to students in your branch.
        </p>

      </div>
    </main>
  );
}

export default UploadPage;
