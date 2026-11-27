
import { useState } from "react";

import QuestionPaperNavigation from "../components/QuestionPaperNavigation";
import QuestionPaperList from "../components/QuestionPaperList";
import PDFReader from "../components/PDFReader";
import Navbar from "../Navbar";
import API from "../api";

function ModelPapersPage() {
  const [scheme, setScheme] = useState("2025");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showResources, setShowResources] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);

  const fetchModelPapers = async ({ scheme, branch, semester }) => {
    setLoading(true);
    setError("");
    setResources([]);
    setShowResources(true);

    try {
      const params = new URLSearchParams({
        scheme,
        branch,
        semester,
        resourceType: "Model QP",
      });

      const response = await fetch(
        `${API}/resources?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load model papers.");
      }

      setResources(Array.isArray(data) ? data : data.resources || []);
    } catch (err) {
      setError(err.message || "Unable to load model papers.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedPDF(null);
  };

  const changeAcademicDetails = () => {
    setShowResources(false);
    setResources([]);
    setSemester("");
  };

  return (
    <>
      <Navbar />

      <main className="question-paper-page">
        <div className="question-paper-container">
          <div className="question-paper-header">
            <h1>Model Question Papers</h1>
          </div>

          {selectedPDF ? (
            <PDFReader
              selectedPDF={selectedPDF}
              API={API}
              renderBackButton={(label, onClick) => (
                <button
                  className="back-button"
                  onClick={onClick}
                  type="button"
                >
                  ← Back to Model Papers
                </button>
              )}
              goBackFromReader={goBack}
            />
          ) : showResources ? (
            <QuestionPaperList
              resources={resources}
              setResources={setResources}
              resourceType="Model QP"
              loading={loading}
              error={error}
              API={API}
              onViewPDF={setSelectedPDF}
              onBack={changeAcademicDetails}
            />
          ) : (
            <QuestionPaperNavigation
              scheme={scheme}
              setScheme={setScheme}
              branch={branch}
              setBranch={setBranch}
              semester={semester}
              setSemester={setSemester}
              onSemesterSelect={fetchModelPapers}
            />
          )}
        </div>
      </main>
    </>
  );
}

export default ModelPapersPage;
