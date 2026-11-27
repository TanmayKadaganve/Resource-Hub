import { useMemo, useState } from "react";
import Navbar from "../Navbar";
import curriculum, { branches, getSubjects } from "../data/curriculum";
import "./CalculatorPage.css";

const rules = {
  2022: {
    status: "Verified from VTU 2022 regulations",
    totalMinimum: 40,
    grades: [
      { min: 90, grade: "O", points: 10 },
      { min: 80, grade: "A+", points: 9 },
      { min: 70, grade: "A", points: 8 },
      { min: 60, grade: "B+", points: 7 },
      { min: 55, grade: "B", points: 6 },
      { min: 50, grade: "C", points: 5 },
      { min: 40, grade: "P", points: 4 },
      { min: 0, grade: "F", points: 0 },
    ],
  },
  2025: {
    status: "Provisional: based on the VTU 2025 draft regulations",
    totalMinimum: 40,
    grades: [
      { min: 90, grade: "O", points: 10 },
      { min: 80, grade: "A+", points: 9 },
      { min: 70, grade: "A", points: 8 },
      { min: 60, grade: "B+", points: 7 },
      { min: 55, grade: "B", points: 6 },
      { min: 50, grade: "C", points: 5 },
      { min: 40, grade: "P", points: 4 },
      { min: 0, grade: "F", points: 0 },
    ],
  },
};

function evaluateCourse(subject, marks, scheme) {
  const total = Number(marks.total);
  const policy = rules[scheme];
  const gradeRule = policy.grades.find((entry) => total >= entry.min);
  const passed = total >= policy.totalMinimum;

  return {
    ...subject,
    marks: total,
    total,
    grade: passed ? gradeRule.grade : "F",
    points: passed ? gradeRule.points : 0,
    passed,
  };
}

function subjectKey(subject, index) {
  return `${subject.code || subject.name}-${index}`;
}

function CalculatorPage() {
  const [mode, setMode] = useState("sgpa");
  const [scheme, setScheme] = useState("2022");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [student, setStudent] = useState({ name: "", usn: "", examPeriod: "" });
  const [marks, setMarks] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [cgpaScheme, setCgpaScheme] = useState("2022");
  const [cgpaBranch, setCgpaBranch] = useState("");
  const [cgpaRows, setCgpaRows] = useState(
    Array.from({ length: 8 }, (_, index) => ({ semester: index + 1, sgpa: "" })),
  );
  const [cgpaResult, setCgpaResult] = useState(null);

  const availableSemesters = branch
    ? Object.keys(curriculum[scheme]?.[branch] || {}).sort((a, b) => Number(a) - Number(b))
    : [];
  const subjects = useMemo(
    () => (branch && semester ? getSubjects(scheme, branch, semester) : []),
    [scheme, branch, semester],
  );
  const includedSubjects = subjects.filter((subject) => Number(subject.credits) > 0);
  const creditSetupComplete = subjects.length > 0 && subjects.every((subject) =>
    subject.credits !== null && subject.credits !== undefined && subject.credits !== "" &&
    Number.isFinite(Number(subject.credits)) && Number(subject.credits) >= 0
  ) && includedSubjects.length > 0;
  const policy = rules[scheme];

  const completedCourses = useMemo(
    () => subjects.map((subject, index) => evaluateCourse(subject, marks[subjectKey(subject, index)] || {}, scheme)),
    [subjects, marks, scheme],
  );

  function resetSelection(nextScheme = scheme, nextBranch = branch) {
    setScheme(nextScheme);
    setBranch(nextBranch);
    setSemester("");
    setMarks({});
    setResult(null);
    setMessage("");
  }

  function updateMarks(subject, index, field, value) {
    const key = subjectKey(subject, index);
    setMarks((previous) => ({
      ...previous,
      [key]: { ...previous[key], [field]: value },
    }));
    setResult(null);
    setMessage("");
  }

  function calculateSGPA(event) {
    event.preventDefault();
    setMessage("");
    if (!student.name.trim() || !student.usn.trim() || !student.examPeriod.trim()) {
      setMessage("Enter the student name, USN, and exam period.");
      return;
    }
    if (!creditSetupComplete) {
      setMessage("Add a valid credit value to every subject in curriculum.js before calculating.");
      return;
    }
    const missing = subjects.find((subject, index) => {
      const row = marks[subjectKey(subject, index)];
      return !row || row.total === undefined || row.total === "";
    });
    if (missing) {
      setMessage(`Enter total marks for ${missing.name}.`);
      return;
    }
    const invalid = subjects.find((subject, index) => {
      const row = marks[subjectKey(subject, index)];
      return Number(row.total) < 0 || Number(row.total) > 100;
    });
    if (invalid) {
      setMessage("Total marks must be between 0 and 100.");
      return;
    }
    const courses = completedCourses;
    const totalCredits = courses.reduce((sum, course) => sum + Number(course.credits), 0);
    const creditPoints = courses.reduce((sum, course) => sum + Number(course.credits) * course.points, 0);
    setResult({ courses, totalCredits, creditPoints, sgpa: creditPoints / totalCredits });
  }

  function calculateCGPA(event) {
    event.preventDefault();
    setCgpaResult(null);
    const filled = cgpaRows.filter((row) => row.sgpa !== "");
    if (!cgpaBranch || !filled.length) {
      setMessage("Select your scheme and branch, then enter at least one semester SGPA.");
      return;
    }
    if (filled.some((row) => Number(row.sgpa) < 0 || Number(row.sgpa) > 10)) {
      setMessage("SGPA must be between 0 and 10.");
      return;
    }
    const semesterCredits = (semester) => getSubjects(cgpaScheme, cgpaBranch, semester).reduce((sum, subject) => sum + Number(subject.credits || 0), 0);
    if (filled.some((row) => !getSubjects(cgpaScheme, cgpaBranch, row.semester).length || getSubjects(cgpaScheme, cgpaBranch, row.semester).some((subject) => subject.credits === null || subject.credits === undefined || subject.credits === ""))) {
      setMessage("Some subjects in a completed semester are missing credits in curriculum.js.");
      return;
    }
    const credits = filled.reduce((sum, row) => sum + semesterCredits(row.semester), 0);
    const creditPoints = filled.reduce((sum, row) => sum + Number(row.sgpa) * semesterCredits(row.semester), 0);
    const cgpa = creditPoints / credits;
    setMessage("");
    setCgpaResult({ cgpa, percentage: cgpa * 10, credits, creditPoints });
  }

  return (
    <>
      <Navbar />
      <main className="calc-page">
        <div className="calc-wrap">
          <header className="calc-header">
            <span className="calc-kicker">ACADEMIC TOOLS</span>
            <h1>SGPA &amp; CGPA Calculator</h1>
            <p>Calculate a credit-weighted estimate from your semester results.</p>
          </header>

          <div className="calc-tabs" role="tablist" aria-label="Calculator type">
            <button type="button" role="tab" aria-selected={mode === "sgpa"} className={mode === "sgpa" ? "active" : ""} onClick={() => { setMode("sgpa"); setMessage(""); }}>SGPA Calculator</button>
            <button type="button" role="tab" aria-selected={mode === "cgpa"} className={mode === "cgpa" ? "active" : ""} onClick={() => { setMode("cgpa"); setMessage(""); }}>CGPA Calculator</button>
          </div>

          {mode === "sgpa" ? (
            <form className="calc-card" onSubmit={calculateSGPA}>
              <section className="calc-section">
                <div className="calc-section-title"><span>01</span><div><h2>Academic details</h2><p>Select a scheme, branch, and semester to load its subjects.</p></div></div>
                <div className="calc-grid">
                  <label>Scheme<select value={scheme} onChange={(event) => resetSelection(event.target.value, "")}><option value="2022">VTU 2022</option><option value="2025">VTU 2025</option></select></label>
                  <label>Branch<select value={branch} onChange={(event) => resetSelection(scheme, event.target.value)}><option value="">Select branch</option>{branches.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  <label>Semester<select value={semester} onChange={(event) => { setSemester(event.target.value); setMarks({}); setResult(null); setMessage(""); }} disabled={!branch}><option value="">Select semester</option>{availableSemesters.map((item) => <option key={item} value={item}>Semester {item}</option>)}</select></label>
                </div>
                {scheme === "2025" && <p className="calc-notice provisional">The accessible VTU 2025 regulation document is marked draft. This result is provisional until the final rules are confirmed.</p>}
                <p className="calc-notice">Enter each subject’s combined CIE + SEE total, out of 100.</p>
              </section>

              {subjects.length > 0 && <>
                <section className="calc-section">
                  <div className="calc-section-title"><span>02</span><div><h2>Student information</h2><p>This information appears on the result summary.</p></div></div>
                  <div className="calc-grid">
                    <label>Student name<input value={student.name} onChange={(event) => setStudent({ ...student, name: event.target.value })} autoComplete="name" required /></label>
                    <label>USN<input value={student.usn} onChange={(event) => setStudent({ ...student, usn: event.target.value.toUpperCase() })} required /></label>
                    <label>Exam period<input value={student.examPeriod} onChange={(event) => setStudent({ ...student, examPeriod: event.target.value })} placeholder="e.g. June/July 2026" required /></label>
                  </div>
                </section>
                <section className="calc-section">
                  <div className="calc-section-title"><span>03</span><div><h2>Subject marks</h2><p>Enter the combined total for each subject, out of 100.</p></div></div>
                  {!creditSetupComplete && <p className="calc-notice warning">Credits are not set for all subjects yet. Add the third argument to each <code>makeSubject(name, code, credits)</code> entry in <code>curriculum.js</code>. Calculation stays disabled until then.</p>}
                  <div className="course-list">
                    {subjects.map((subject, index) => {
                      const key = subjectKey(subject, index);
                      const row = marks[key] || {};
                      return <article className="course-card" key={key}>
                        <div className="course-info"><span className="course-code">{subject.code || "COURSE"}</span><h3>{subject.name}</h3><span className="course-credit">{subject.credits === null || subject.credits === undefined || subject.credits === "" ? "Credits pending" : Number(subject.credits) === 0 ? "Non-credit course" : `${subject.credits} credits`}</span></div>
                        <label>Total marks (0–100)<input type="number" min="0" max="100" step="0.5" value={row.total ?? ""} onChange={(event) => updateMarks(subject, index, "total", event.target.value)} inputMode="decimal" /></label>
                      </article>;
                    })}
                  </div>
                </section>
                {message && <p className="calc-error" role="alert">{message}</p>}
                <div className="calc-actions"><button type="submit" className="calc-submit" disabled={!creditSetupComplete}>Calculate SGPA</button><span>{policy.status}</span></div>
                {result && <section className="grade-report" aria-live="polite">
                  <div className="sgpa-report-heading"><span>VTU SGPA Report</span><span>{student.examPeriod}</span></div>
                  <h2 className="sgpa-report-score">{result.sgpa.toFixed(2)}</h2>
                  <p className="sgpa-report-caption">Final SGPA</p>
                  <div className="report-meta"><div><strong>Branch:</strong><span>{branch}</span></div><div><strong>Semester:</strong><span>{semester}{Number(semester) === 1 ? "st" : Number(semester) === 2 ? "nd" : Number(semester) === 3 ? "rd" : "th"} Semester</span></div><div><strong>Student:</strong><span>{student.name} ({student.usn})</span></div><div><strong>Examination:</strong><span>{student.examPeriod}</span></div></div>
                  <div className="report-table-wrap"><table className="report-table"><thead><tr><th>Subject Code</th><th>Marks</th><th>Grade</th><th>Credits</th><th>Grade × Credit</th></tr></thead><tbody>{result.courses.map((course, index) => <tr key={`${course.code || course.name}-${index}`}><td>{course.code || course.name}</td><td>{course.total}</td><td>{course.grade}</td><td>{course.credits}</td><td>{Number(course.credits) * course.points}</td></tr>)}<tr className="report-total"><td>Total</td><td>{result.courses.reduce((sum, course) => sum + course.total, 0)}</td><td></td><td>{result.totalCredits}</td><td>{result.creditPoints}</td></tr></tbody></table></div>
                  <div className="sgpa-formula"><strong>SGPA Formula</strong><p>SGPA = Σ(Course Credits × Grade Points) ÷ Σ(Course Credits) = {result.creditPoints} ÷ {result.totalCredits} = {result.sgpa.toFixed(2)}</p></div>
                  <div className="report-download"><button type="button" className="calc-submit" onClick={() => window.print()}>Download / Print Grade Card</button><span>In the print dialog, choose “Save as PDF” to download.</span></div>
                  <p className="report-disclaimer">Disclaimer: This is an unofficial, computer-generated estimate for reference only. It is not an official VTU marks card.</p>
                  <div className="report-signatures"><span>Student Signature</span><span>Principal</span></div>
                  <p className="calc-disclaimer">Repeat/backlog rules are not represented in this semester estimate. Confirm results against the official VTU grade card.</p>
                </section>}
              </>}
            </form>
          ) : (
            <form className="calc-card" onSubmit={calculateCGPA}>
              <section className="calc-section">
                <div className="calc-section-title"><span>01</span><div><h2>Semester results</h2><p>Enter the SGPA and the credits applicable to CGPA for each completed semester.</p></div></div>
                <p className="calc-notice">Semester credits are loaded from the selected branch in curriculum.js. CGPA = Σ(SGPA × semester credits) ÷ Σ(semester credits).</p>
                <div className="calc-grid cgpa-selectors"><label>Scheme<select value={cgpaScheme} onChange={(event) => { setCgpaScheme(event.target.value); setCgpaBranch(""); setCgpaResult(null); }}><option value="2022">VTU 2022</option><option value="2025">VTU 2025</option></select></label><label>Branch<select value={cgpaBranch} onChange={(event) => { setCgpaBranch(event.target.value); setCgpaResult(null); }}><option value="">Select branch</option>{branches.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
                <div className="cgpa-grid"><div className="cgpa-head"><span>Semester</span><span>SGPA / 10</span></div>{cgpaRows.map((row, index) => <div className="cgpa-row" key={row.semester}><strong>Semester {row.semester}</strong><input aria-label={`Semester ${row.semester} SGPA`} type="number" min="0" max="10" step="0.01" placeholder="—" value={row.sgpa} onChange={(event) => { const next = [...cgpaRows]; next[index] = { ...row, sgpa: event.target.value }; setCgpaRows(next); setCgpaResult(null); }} /></div>)}</div>
                {message && <p className="calc-error" role="alert">{message}</p>}
                <div className="calc-actions"><button type="submit" className="calc-submit">Calculate CGPA</button></div>
                {cgpaResult && <section className="calc-result" aria-live="polite"><div className="result-top"><div><span>CGPA RESULT</span><h2>{cgpaResult.cgpa.toFixed(2)}</h2></div><div><span>ESTIMATED PERCENTAGE</span><strong>{cgpaResult.percentage.toFixed(2)}%</strong></div></div><div className="result-metrics"><div><span>Credit points</span><strong>{cgpaResult.creditPoints.toFixed(2)}</strong></div><div><span>Credits counted</span><strong>{cgpaResult.credits.toFixed(2)}</strong></div></div><p className="calc-disclaimer">Percentage shown as CGPA × 10 per the accessible VTU 2022 and 2025 draft regulations. This is an estimate; verify scheme applicability and official transcript treatment.</p></section>}
              </section>
            </form>
          )}
          <aside className="calc-explainer"><h2>How the calculation works</h2><p><strong>Grade point:</strong> marks are checked against the selected scheme's grade scale. Under 2022, separate CIE, SEE, and total pass minima also apply.</p><p><strong>Credit points:</strong> subject credits × grade points. A failed course receives zero grade points in this estimate.</p><p><strong>SGPA:</strong> add the course credit points and divide by the credits for the registered semester courses.</p><p><strong>CGPA:</strong> the semester results are combined using their CGPA-weighted credits, so a semester with more counted credits has more influence.</p><p className="calc-note-small">Non-credit courses should be recorded with 0 credits in the curriculum and are excluded from credit-weighted averages. This tool does not claim to reproduce official treatment of absences, withheld marks, backlogs, or repeated attempts.</p></aside>
        </div>
      </main>
    </>
  );
}

export default CalculatorPage;
