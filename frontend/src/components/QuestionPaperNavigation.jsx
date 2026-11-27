
import { branches } from "../data/curriculum";
import curriculum from "../data/curriculum";

function QuestionPaperNavigation({
  scheme,
  setScheme,
  branch,
  setBranch,
  semester,
  setSemester,
  onSemesterSelect,
}) {
  // Get semesters available for the selected scheme and branch
  const availableSemesters =
    branch && curriculum[scheme]?.[branch]
      ? Object.keys(curriculum[scheme][branch]).sort(
          (a, b) => Number(a) - Number(b)
        )
      : [];

  const handleSchemeChange = (selectedScheme) => {
    setScheme(selectedScheme);
    setBranch("");
    setSemester("");
  };

  const handleBranchChange = (selectedBranch) => {
    setBranch(selectedBranch);
    setSemester("");
  };

  const handleSemesterChange = (selectedSemester) => {
    setSemester(selectedSemester);

    onSemesterSelect({
      scheme,
      branch: branch.toUpperCase(),
      semester: selectedSemester,
    });
  };

  return (
    <section className="qp-navigation">
      <div className="qp-navigation-heading">
        <h2>Quick Select</h2>
        <p>Choose scheme, branch, and semester.</p>
      </div>

      {/* Step 1: Scheme */}
      <div className="qp-navigation-step">
        <h3>1. Select Scheme</h3>

        <div className="qp-option-grid">
          {["2022", "2025"].map((item) => (
            <button
              key={item}
              type="button"
              className={`qp-option-card ${
                scheme === item ? "active" : ""
              }`}
              onClick={() => handleSchemeChange(item)}
            >
              <span>VTU Scheme</span>
              <strong>{item}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Branch */}
      {scheme && (
        <div className="qp-navigation-step">
          <h3>2. Select Branch</h3>

          <div className="qp-option-grid">
            {branches
              .filter((item) => curriculum[scheme]?.[item])
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`qp-option-card ${
                    branch === item ? "active" : ""
                  }`}
                  onClick={() => handleBranchChange(item)}
                >
                  <strong>{item}</strong>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Step 3: Semester */}
      {branch && (
        <div className="qp-navigation-step">
          <h3>3. Select Semester</h3>

          {availableSemesters.length > 0 ? (
            <div className="qp-option-grid semester-grid">
              {availableSemesters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`qp-option-card ${
                    semester === item ? "active" : ""
                  }`}
                  onClick={() => handleSemesterChange(item)}
                >
                  <strong>Semester {item}</strong>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default QuestionPaperNavigation;
