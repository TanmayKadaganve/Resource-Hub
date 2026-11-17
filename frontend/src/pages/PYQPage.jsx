
import { useState } from "react";

import QuestionPaperNavigation from "../components/QuestionPaperNavigation";
import QuestionPaperList from "../components/QuestionPaperList";
import PDFReader from "../components/PDFReader";
import Navbar from "../Navbar";
import API from "../api";

function PYQPage() {
  const [scheme, setScheme] = useState("2025");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showResources, setShowResources] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);

  const fetchPYQs = async ({ scheme, branch, semester }) => {
    setLoading(true);
    setError("");
    setResources([]);
    setShowResources(true);

    try {
      const params = new URLSearchParams({
        scheme,
        branch,
        semester,
        resourceType: "PYQ",
      });

      const response = await fetch(
        `${API}/resources?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load PYQs.");
      }

      setResources(Array.isArray(data) ? data : data.resources || []);
    } catch (err) {
      setError(err.message || "Unable to load PYQs.");
    } finally {
      setLoading(false);
    }
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
            <p className="eyebrow">RESOURCE HUB</p>
            <h1>Previous Year Question Papers</h1>
            <p>
              Access previous year question papers organized by
              scheme, branch and semester.
            </p>
          </div>

          {selectedPDF ? (
            <PDFReader
              selectedPDF={selectedPDF}
              API={API}
              renderBackButton={() => (
                <button
                  className="back-button"
                  onClick={() => setSelectedPDF(null)}
                  type="button"
                >
                  ← Back to PYQs
                </button>
              )}
              goBackFromReader={() => setSelectedPDF(null)}
            />
          ) : showResources ? (
            <QuestionPaperList
              resources={resources}
              setResources={setResources}
              resourceType="PYQ"
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
              onSemesterSelect={fetchPYQs}
            />
          )}
        </div>
      </main>
    </>
  );
}

export default PYQPage;
