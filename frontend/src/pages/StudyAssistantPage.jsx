import { useMemo, useState } from "react";
import { getSubjects, branches } from "../data/curriculum";
import API_BASE_URL from "../api";
import "./StudyAssistantPage.css";

const initialCourse = { scheme: "2022", branch: "CSE", semester: "5", subjectCode: "" };

function StudyAssistantPage() {
  const [course, setCourse] = useState(initialCourse);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subjects = useMemo(
    () => getSubjects(course.scheme, course.branch, course.semester),
    [course.scheme, course.branch, course.semester]
  );

  function updateCourse(field, value) {
    setCourse((current) => ({ ...current, [field]: value, ...(field !== "subjectCode" ? { subjectCode: "" } : {}) }));
    setMessages([]);
    setError("");
  }

  async function askQuestion(event) {
    event.preventDefault();
    if (!course.subjectCode) {
      setError("Choose a subject before asking a question.");
      return;
    }
    const asked = question.trim();
    if (asked.length < 4) {
      setError("Enter a question with at least 4 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestion("");
    setMessages((current) => [...current, { role: "student", text: asked }]);
    try {
      const response = await fetch(`${API_BASE_URL}/study-assistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, semester: Number(course.semester), question: asked }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not get an answer.");
      setMessages((current) => [...current, { role: "assistant", text: result.answer, citations: result.citations || [] }]);
    } catch (requestError) {
      setError(requestError.message || "Could not connect to the Study Assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="study-page">
      <header className="study-header">
        <a href="/" className="study-brand">Resource Hub</a>
        <span>AI Study Assistant</span>
      </header>

      <section className="study-shell">
        <div className="study-intro">
          <p className="study-eyebrow">LEARN FROM YOUR COLLEGE NOTES</p>
          <h1>Study Assistant</h1>
          <p>Ask about a topic and get an explanation grounded in the selected subject’s uploaded notes, with PDF page references.</p>
        </div>

        <section className="study-course" aria-label="Choose your course">
          <label>Scheme
            <select value={course.scheme} onChange={(event) => updateCourse("scheme", event.target.value)}>
              <option value="2022">2022 Scheme</option>
              <option value="2025">2025 Scheme</option>
            </select>
          </label>
          <label>Branch
            <select value={course.branch} onChange={(event) => updateCourse("branch", event.target.value)}>
              {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          </label>
          <label>Semester
            <select value={course.semester} onChange={(event) => updateCourse("semester", event.target.value)}>
              {Array.from({ length: 8 }, (_, index) => String(index + 1)).map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
            </select>
          </label>
          <label>Subject
            <select value={course.subjectCode} onChange={(event) => updateCourse("subjectCode", event.target.value)}>
              <option value="">Choose a subject</option>
              {subjects.map((subject, index) => <option key={`${subject.code}-${index}`} value={subject.code} disabled={!subject.code}>{subject.code ? `${subject.code} — ${subject.name}` : subject.name}</option>)}
            </select>
          </label>
        </section>

        {course.branch === "First Year" && <p className="study-note">First year is common to all branches. The backend will use the “First Year” course selection.</p>}

        <section className="study-chat" aria-label="Study Assistant conversation">
          <div className="study-chat-top"><span className="study-status-dot" /> AI-generated answers from selected notes</div>
          <div className="study-messages" aria-live="polite">
            {messages.length === 0 && !loading && (
              <div className="study-empty">
                <span className="study-empty-icon">✦</span>
                <h2>What are you studying?</h2>
                <p>Select a subject, then try “Explain this concept in simple steps.”</p>
              </div>
            )}
            {messages.map((message, index) => (
              <article className={`study-message study-message-${message.role}`} key={`${message.role}-${index}`}>
                <div className="study-message-label">{message.role === "student" ? "You" : "AI Study Assistant"}</div>
                <p className="study-message-text">{message.text}</p>
                {message.citations?.length > 0 && (
                  <div className="study-citations">
                    <strong>Sources from your notes</strong>
                    {message.citations.map((citation) => (
                      <a key={`${citation.resourceId}-${citation.page}-${citation.label}`} href={`${API_BASE_URL}/resources/${citation.resourceId}/view#page=${citation.page}`} target="_blank" rel="noreferrer">
                        <span>{citation.label}</span> {citation.resourceName} · page {citation.page} ↗
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {loading && <div className="study-thinking" role="status"><span /> Finding relevant passages and preparing an answer…</div>}
          </div>

          <form className="study-prompt" onSubmit={askQuestion}>
            {error && <p className="study-error" role="alert">{error}</p>}
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about your selected subject…" maxLength={1200} rows={3} disabled={loading} />
            <div className="study-prompt-footer">
              <span>Answers use retrieved note passages and may need verification in the PDF.</span>
              <button type="submit" disabled={loading || question.trim().length < 4 || !course.subjectCode}>Ask Assistant <span>↑</span></button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default StudyAssistantPage;
