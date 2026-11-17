import { useEffect, useState } from "react";

import curriculum, { branches } from "../data/curriculum";
import Navbar from "../Navbar";


import AcademicNavigation from "../components/AcademicNavigation";

import PDFReader from "../components/PDFReader";

import ResourceList from "../components/ResourceList";
import API from "../api";

// import Footer from "../components/Footer";

import "../App.css";

function HomePage() {
    
     const [scheme, setScheme] = useState("2025");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState(null);
  const [subject, setSubject] = useState(null);
  const [module, setModule] = useState(null);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const semesters = branch
    ? Object.keys(curriculum[scheme]?.[branch] || {}).sort(
        (a, b) => Number(a) - Number(b)
      )
    : [];

  const subjects =
    branch && semester
      ? curriculum[scheme]?.[branch]?.[semester] || []
      : [];

  const filteredResources = resources.filter((resource) =>
    resource.originalName.toLowerCase().includes(search.toLowerCase())
  );

  function resetToBranches(nextScheme = scheme) {
    setScheme(nextScheme);
    setBranch("");
    setSemester(null);
    setSubject(null);
    setModule(null);
    setResources([]);
    setSelectedPDF(null);
    setSearch("");
    setError("");
  }

  function openBranch(name) {
    setBranch(name);
    setSemester(null);
    setSubject(null);
    setModule(null);
    setResources([]);
    setSelectedPDF(null);
    setError("");
  }

  function goToSubjects(nextSemester) {
    setSemester(nextSemester);
    setSubject(null);
    setModule(null);
    setResources([]);
    setSelectedPDF(null);
  }

  function goToModules(nextSubject) {
    setSubject(nextSubject);
    setModule(null);
    setResources([]);
    setSelectedPDF(null);
  }

  
async function openModule(nextModule) {
  setModule(nextModule);
  setSelectedPDF(null);
  setSearch("");
  setError("");
  setLoading(true);
  setResources([]);

  try {
    const params = new URLSearchParams({
      subjectCode: subject.code,
      resourceType: "Notes",
      module: String(nextModule.number),
    });

    const response = await fetch(`${API}/resources?${params}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load resources.");
    }

    setResources(data.resources || []);
  } catch (error) {
    console.error("Resource fetching error:", error);

    setError(
      error.message || "Unable to load resources."
    );
  } finally {
    setLoading(false);
  }
}


  // Refresh the current module's resources when the user returns
  // from the PDF reader.
  useEffect(() => {
    if (!selectedPDF && module && subject && semester && branch) {
      // Resources remain in state when the reader is closed.
    }
  }, [selectedPDF, module, subject, semester, branch]);

  const breadcrumb = [
    "Home",
    scheme + " Scheme",
    branch,
    semester ? `Semester ${semester}` : null,
    subject?.name,
    module ? `Module ${module.number}` : null,
  ].filter(Boolean);

  function goBackFromReader() {
    setSelectedPDF(null);
  }

  function renderBackButton(label, action) {
    return (
      <button className="back-button" onClick={action}>
        ← {label}
      </button>
    );
  }

  return (
    <div className="app-shell">
      <Navbar/>
      {/* <header className="navbar">
        <button
          className="brand"
          onClick={() => resetToBranches()}
          aria-label="Resource Hub home"
        >
          <span className="brand-icon">RH</span>
          <span>
            Resource <strong>Hub</strong>
            <small>Academic Resource Portal</small>
          </span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          <button onClick={() => resetToBranches()}>Home</button>
          <a href="#curriculum">Browse Resources</a>
          <a href="#footer">Contact</a>
        </nav>
      </header> */}

      <main className="main-content" id="curriculum">
        <section className="hero">
          <p className="eyebrow">BGMIT · ACADEMIC RESOURCE PORTAL</p>
          <h1>All Your Semester Notes in One Place.</h1>
          <p>
            Find syllabus-related notes and study materials organized by
            scheme, branch, semester, subject, and module.
          </p>

          <div className="scheme-switch" aria-label="Select curriculum scheme">
            {["2022", "2025"].map((value) => (
              <button
                key={value}
                className={scheme === value ? "active" : ""}
                onClick={() => resetToBranches(value)}
                aria-pressed={scheme === value}
              >
                {value} Scheme
              </button>
            ))}
          </div>
        </section>

        <div className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item}-${index}`}>
              {index > 0 && <span className="crumb-divider">/</span>}
              {item}
            </span>
          ))}
        </div>

        {selectedPDF ? (
  <PDFReader
    selectedPDF={selectedPDF}
    API={API}
    renderBackButton={renderBackButton}
    goBackFromReader={goBackFromReader}
  />
) : !module ? (
  <AcademicNavigation
    scheme={scheme}
    branch={branch}
    semester={semester}
    subject={subject}
    module={module}
    branches={branches}
    curriculum={curriculum}
    semesters={semesters}
    subjects={subjects}
    openBranch={openBranch}
    goToSubjects={goToSubjects}
    goToModules={goToModules}
    openModule={openModule}
    resetToBranches={resetToBranches}
    renderBackButton={renderBackButton}
    setSemester={setSemester}
    setModule={setModule}
  />
  
) : (
  <ResourceList
    branch={branch}
    semester={semester}
    subject={subject}
    module={module}
    API={API}
    renderBackButton={renderBackButton}
    setModule={setModule}
    setResources={setResources}
    setError={setError}
    search={search}
    setSearch={setSearch}
    filteredResources={filteredResources}
    loading={loading}
    error={error}
    setSelectedPDF={setSelectedPDF}
  />
)}

      </main>

      {/* <Footer /> */}
      
    </div>
  );


}

export default HomePage;
