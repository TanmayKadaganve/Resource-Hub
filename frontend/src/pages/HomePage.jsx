import { useState } from "react";

import curriculum, { branches } from "../data/curriculum";
import Navbar from "../Navbar";


import AcademicNavigation from "../components/AcademicNavigation";

import ResourceList from "../components/ResourceList";
import PDFReader from "../components/PDFReader";
import API from "../api";


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
      setError(error.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  }


  const breadcrumb = [
    "Home",
    scheme + " Scheme",
    branch,
    semester ? `Semester ${semester}` : null,
    subject?.name,
    module ? `Module ${module.number}` : null,
  ].filter(Boolean);

  function renderBackButton(label, action) {
    return (
      <button className="back-button" type="button" onClick={action}>
        ← {label}
      </button>
    );
  }

  return (
    <div className="app-shell">
      <Navbar/>
      <main className="main-content" id="curriculum">
        <section className="hero">
          <p className="eyebrow">BGMIT</p>
          <h1>Find your semester resources.</h1>
          <p>
            Browse notes and academic materials by scheme, branch, semester, and subject.
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
            goBackFromReader={() => setSelectedPDF(null)}
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

    </div>
  );


}

export default HomePage;
