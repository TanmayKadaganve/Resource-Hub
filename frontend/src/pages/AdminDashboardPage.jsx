import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API from "../api";
import "./AdminPages.css";

const tabs = ["Overview", "Resources", "Branches", "Faculty", "Lab materials", "Notices", "Academic links", "Activity"];
const branchNames = ["FIRST YEAR", "CSE", "AIML", "ECE", "MECHANICAL", "CIVIL"];
const token = () => localStorage.getItem("adminToken");

async function adminRequest(path, options = {}) {
  const headers = { Authorization: `Bearer ${token()}`, ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...options.headers };
  const response = await fetch(`${API}/admin${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Admin request failed.");
  return data;
}

function AdminDashboardPage() {
  const [tab, setTab] = useState("Overview");
  const [overview, setOverview] = useState(null);
  const [resources, setResources] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultyPasswords, setFacultyPasswords] = useState({});
  const [labs, setLabs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [links, setLinks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [noticeForm, setNoticeForm] = useState({ title: "", body: "", category: "Announcement", published: true });
  const [linkForm, setLinkForm] = useState({ title: "", url: "", category: "Academic Calendar", description: "", branch: "ALL", scheme: "ALL" });
  const [labForm, setLabForm] = useState({ branch: "CSE", semester: "1", subject: "", subjectCode: "", googleDriveLink: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadForm, setUploadForm] = useState({ scheme: "2025", branch: "CSE", semester: "1", subject: "", subjectCode: "", resourceType: "Notes", module: "1", questionPaperYear: "2025", pdf: null });

  const refresh = useCallback(async () => {
    setError("");
    try {
      const data = await adminRequest("/overview"); setOverview(data);
      if (tab === "Resources" || tab === "Branches") {
        const query = new URLSearchParams({ page: String(page), limit: "25", ...(search && { search }), ...(branchFilter && { branch: branchFilter }), ...(typeFilter && { resourceType: typeFilter }) });
        const result = await adminRequest(`/resources?${query}`); setResources(result.resources); setTotalPages(Math.max(1, result.pages));
      }
      if (tab === "Faculty") setFaculties((await adminRequest("/faculties")).faculties);
      if (tab === "Lab materials") setLabs((await adminRequest("/labs")).labs);
      if (tab === "Notices") setNotices((await adminRequest("/notices")).notices);
      if (tab === "Academic links") setLinks((await adminRequest("/academic-links")).links);
      if (tab === "Activity") setActivities((await adminRequest("/activity")).activities);
    } catch (requestError) { setError(requestError.message); }
  }, [tab, page, search, branchFilter, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  if (!token()) return <Navigate to="/admin/login" replace />;

  async function remove(path, label) {
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) return;
    try { await adminRequest(path, { method: "DELETE" }); setMessage(`${label} deleted.`); await refresh(); }
    catch (requestError) { setError(requestError.message); }
  }

  async function uploadResource(event) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const body = new FormData();
      Object.entries(uploadForm).forEach(([key, value]) => { if (value !== null && value !== "") body.append(key, value); });
      const result = await adminRequest("/resources/upload", { method: "POST", body });
      setMessage(result.indexing === "ready" ? "Resource uploaded and notes indexed." : result.indexing === "no-text" ? "Uploaded; PDF has no selectable text, so OCR is needed." : "Resource uploaded.");
      setUploadForm((current) => ({ ...current, subject: "", subjectCode: "", pdf: null }));
      event.target.reset(); await refresh();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function createNotice(event) {
    event.preventDefault(); setError("");
    try { await adminRequest("/notices", { method: "POST", body: JSON.stringify(noticeForm) }); setNoticeForm({ title: "", body: "", category: "Announcement", published: true }); setMessage("Notice published."); await refresh(); }
    catch (requestError) { setError(requestError.message); }
  }

  async function createLink(event) {
    event.preventDefault(); setError("");
    try { await adminRequest("/academic-links", { method: "POST", body: JSON.stringify(linkForm) }); setLinkForm({ title: "", url: "", category: "Academic Calendar", description: "", branch: "ALL", scheme: "ALL" }); setMessage("Academic link added."); await refresh(); }
    catch (requestError) { setError(requestError.message); }
  }

  async function createLab(event) {
    event.preventDefault(); setError("");
    try {
      await adminRequest("/labs", { method: "POST", body: JSON.stringify(labForm) });
      setLabForm({ ...labForm, subject: "", subjectCode: "", googleDriveLink: "" });
      setMessage("Lab material link added."); await refresh();
    } catch (requestError) { setError(requestError.message); }
  }

  async function resetFacultyPassword(event, facultyId) {
    event.preventDefault();
    const password = facultyPasswords[facultyId] || "";
    try {
      const result = await adminRequest(`/faculties/${facultyId}/password`, { method: "PUT", body: JSON.stringify({ password }) });
      setFacultyPasswords((current) => ({ ...current, [facultyId]: "" }));
      setMessage(result.message);
    } catch (requestError) { setError(requestError.message); }
  }

  async function toggleNotice(notice) {
    try {
      await adminRequest(`/notices/${notice._id}`, { method: "PUT", body: JSON.stringify({ published: !notice.published }) });
      setMessage(notice.published ? "Notice unpublished." : "Notice published.");
      await refresh();
    } catch (requestError) { setError(requestError.message); }
  }

  function logout() { localStorage.removeItem("adminToken"); localStorage.removeItem("adminEmail"); window.location.assign("/admin/login"); }

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-side-brand" to="/">RH <span>Resource Hub</span></Link>
        <p className="admin-side-caption">ADMINISTRATION</p>
        <nav>{tabs.map((name) => <button key={name} className={tab === name ? "active" : ""} onClick={() => { setTab(name); setPage(1); setMessage(""); }}>{name}</button>)}</nav>
        <button className="admin-logout" onClick={logout}>↪ Sign out</button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><div><p className="admin-kicker">RESOURCE HUB / ADMIN</p><h1>{tab}</h1></div><div className="admin-user"><span>ADMIN</span>{localStorage.getItem("adminEmail")}</div></header>
        {(message || error) && <div className={error ? "admin-alert" : "admin-success"} role="status">{error || message}<button onClick={() => { setError(""); setMessage(""); }}>×</button></div>}

        {tab === "Overview" && <>
          <div className="admin-stat-grid">{Object.entries({ "All resources": overview?.stats.resources, "Faculty accounts": overview?.stats.faculties, "Branches": overview?.stats.branches, "Lab materials": overview?.stats.labs, "Notices": overview?.stats.notices, "Academic links": overview?.stats.links }).map(([label, value]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{value ?? "—"}</strong></article>)}</div>
          <div className="admin-two-columns"><section className="admin-panel"><h2>Resources by type</h2>{(overview?.byType || []).map((item) => <div className="admin-meter-row" key={item._id}><span>{item._id}</span><strong>{item.count}</strong></div>)}</section><section className="admin-panel"><h2>Branch coverage</h2>{branchNames.map((name) => <div className="admin-meter-row" key={name}><span>{name}</span><strong>{overview?.byBranch?.find((item) => item._id === name)?.count || 0}</strong></div>)}</section></div>
          <section className="admin-panel"><h2>Recent activity</h2><ActivityRows items={overview?.activities || []} /></section>
        </>}

        {(tab === "Resources" || tab === "Branches") && <>
          {tab === "Branches" && <div className="admin-branch-grid">{branchNames.map((name) => <button key={name} className={branchFilter === name ? "selected" : ""} onClick={() => { setBranchFilter(branchFilter === name ? "" : name); setPage(1); }}><strong>{name}</strong><span>{overview?.byBranch?.find((item) => item._id === name)?.count || 0} resources</span></button>)}</div>}
          <section className="admin-panel"><h2>Upload academic resource across branches</h2><form className="admin-form-grid" onSubmit={uploadResource}>
            <Select label="Scheme" value={uploadForm.scheme} onChange={(value) => setUploadForm({ ...uploadForm, scheme: value })} options={["2022", "2025"]} />
            <Select label="Branch" value={uploadForm.branch} onChange={(value) => setUploadForm({ ...uploadForm, branch: value })} options={branchNames} />
            <label>Semester<input type="number" min="1" max="8" value={uploadForm.semester} onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })} required /></label>
            <label>Subject<input value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} required /></label>
            <label>Subject code<input value={uploadForm.subjectCode} onChange={(e) => setUploadForm({ ...uploadForm, subjectCode: e.target.value })} required /></label>
            <Select label="Resource type" value={uploadForm.resourceType} onChange={(value) => setUploadForm({ ...uploadForm, resourceType: value })} options={["Notes", "Model QP", "PYQ", "Syllabus", "Other"]} />
            {uploadForm.resourceType === "Notes" && <label>Module<input type="number" min="1" max="5" value={uploadForm.module} onChange={(e) => setUploadForm({ ...uploadForm, module: e.target.value })} required /></label>}
            {uploadForm.resourceType === "PYQ" && <label>Question paper year<input type="number" min="2000" value={uploadForm.questionPaperYear} onChange={(e) => setUploadForm({ ...uploadForm, questionPaperYear: e.target.value })} required /></label>}
            <label className="admin-file-label">PDF (max 20 MB)<input type="file" accept="application/pdf,.pdf" onChange={(e) => setUploadForm({ ...uploadForm, pdf: e.target.files?.[0] || null })} required /></label>
            <button className="admin-primary" disabled={busy}>{busy ? "Uploading…" : "Upload resource"}</button>
          </form></section>
          <section className="admin-panel"><div className="admin-filter-row"><h2>All branch resources</h2><input placeholder="Search subject, code, filename" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /><select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}><option value="">All types</option>{["Notes", "Model QP", "PYQ", "Syllabus", "Other"].map((x) => <option key={x}>{x}</option>)}</select></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Material</th><th>Course</th><th>Type</th><th>Uploaded</th><th>Action</th></tr></thead><tbody>{resources.map((r) => <tr key={r._id}><td>{r.originalName}<small>{r.subjectCode}</small></td><td>{r.branch}<small>{r.scheme} · Sem {r.semester}</small></td><td>{r.resourceType}{r.module ? ` · M${r.module}` : ""}</td><td>{new Date(r.uploadedAt).toLocaleDateString()}</td><td><button className="admin-danger-link" onClick={() => remove(`/resources/${r._id}`, r.originalName)}>Delete</button></td></tr>)}</tbody></table></div>
            <div className="admin-pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button></div>
          </section>
        </>}

        {tab === "Faculty" && <section className="admin-panel"><h2>Faculty accounts</h2><p className="admin-muted">Passwords remain hashed and are never displayed. Reset sets a new temporary branch password.</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Branch</th><th>Account</th><th>Last updated</th><th>Reset password</th></tr></thead><tbody>{faculties.map((f) => <tr key={f._id}><td>{f.branch}</td><td>Configured</td><td>{new Date(f.updatedAt).toLocaleDateString()}</td><td><form className="admin-reset-form" onSubmit={(event) => resetFacultyPassword(event, f._id)}><input type="password" minLength="12" placeholder="12+ character temporary password" value={facultyPasswords[f._id] || ""} onChange={(e) => setFacultyPasswords({ ...facultyPasswords, [f._id]: e.target.value })} required /><button className="admin-primary">Set password</button></form></td></tr>)}</tbody></table></div></section>}
        {tab === "Lab materials" && <><section className="admin-panel"><h2>Add lab material link</h2><form className="admin-form-grid" onSubmit={createLab}><Select label="Branch" value={labForm.branch} onChange={(value) => setLabForm({ ...labForm, branch: value })} options={branchNames} /><label>Semester<input type="number" min="1" max="8" value={labForm.semester} onChange={(e) => setLabForm({ ...labForm, semester: e.target.value })} required /></label><label>Subject<input value={labForm.subject} onChange={(e) => setLabForm({ ...labForm, subject: e.target.value })} required /></label><label>Subject code<input value={labForm.subjectCode} onChange={(e) => setLabForm({ ...labForm, subjectCode: e.target.value })} required /></label><label className="admin-wide">Google Drive link<input type="url" value={labForm.googleDriveLink} onChange={(e) => setLabForm({ ...labForm, googleDriveLink: e.target.value })} required /></label><button className="admin-primary">Add lab material</button></form></section><section className="admin-panel"><h2>Lab links across branches</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Lab</th><th>Branch / semester</th><th>Link</th><th>Action</th></tr></thead><tbody>{labs.map((l) => <tr key={l._id}><td>{l.subject}<small>{l.subjectCode}</small></td><td>{l.branch} · Sem {l.semester}</td><td><a href={l.googleDriveLink} target="_blank" rel="noreferrer">Open ↗</a></td><td><button className="admin-danger-link" onClick={() => remove(`/labs/${l._id}`, l.subject)}>Delete</button></td></tr>)}</tbody></table></div></section></>}

        {tab === "Notices" && <><section className="admin-panel"><h2>Publish a college notice</h2><form className="admin-form-grid" onSubmit={createNotice}><label>Title<input maxLength="180" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required /></label><Select label="Category" value={noticeForm.category} onChange={(value) => setNoticeForm({ ...noticeForm, category: value })} options={["Announcement", "Examination", "Academic"]} /><label className="admin-wide">Message<textarea maxLength="5000" rows="4" value={noticeForm.body} onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })} required /></label><button className="admin-primary">Publish notice</button></form></section><section className="admin-panel"><h2>Published and draft notices</h2>{notices.map((n) => <article className="admin-content-row" key={n._id}><div><strong>{n.title}</strong><p>{n.category} · {n.published ? "Published" : "Draft"}</p><span>{n.body}</span></div><div className="admin-row-actions"><button className="admin-link-button" onClick={() => toggleNotice(n)}>{n.published ? "Unpublish" : "Publish"}</button><button className="admin-danger-link" onClick={() => remove(`/notices/${n._id}`, n.title)}>Delete</button></div></article>)}</section></>}

        {tab === "Academic links" && <><section className="admin-panel"><h2>Add syllabus, scheme, calendar, or academic link</h2><form className="admin-form-grid" onSubmit={createLink}><label>Title<input value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} required /></label><label>HTTPS URL<input type="url" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} required /></label><Select label="Category" value={linkForm.category} onChange={(value) => setLinkForm({ ...linkForm, category: value })} options={["Syllabus", "Scheme", "Academic Calendar", "Other"]} /><Select label="Branch" value={linkForm.branch} onChange={(value) => setLinkForm({ ...linkForm, branch: value })} options={["ALL", ...branchNames]} /><Select label="Scheme" value={linkForm.scheme} onChange={(value) => setLinkForm({ ...linkForm, scheme: value })} options={["ALL", "2022", "2025"]} /><label>Description<input value={linkForm.description} onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })} /></label><button className="admin-primary">Add academic link</button></form></section><section className="admin-panel"><h2>Managed academic links</h2>{links.map((l) => <article className="admin-content-row" key={l._id}><div><strong>{l.title}</strong><p>{l.category} · {l.branch} · {l.scheme}</p><a href={l.url} target="_blank" rel="noreferrer">{l.url}</a></div><button className="admin-danger-link" onClick={() => remove(`/academic-links/${l._id}`, l.title)}>Delete</button></article>)}</section></>}

        {tab === "Activity" && <section className="admin-panel"><h2>Faculty and admin activity · latest 100</h2><ActivityRows items={activities} /></section>}
      </section>
    </main>
  );
}

function Select({ label, value, onChange, options }) { return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function ActivityRows({ items }) { return items.length ? <div className="admin-activity-list">{items.map((item) => <article key={item._id}><span className={`admin-activity-dot ${item.actorRole}`} /><div><strong>{item.description}</strong><small>{item.actorRole} · {item.actor} · {new Date(item.createdAt).toLocaleString()}</small></div></article>)}</div> : <p className="admin-muted">Activity will appear here as faculty and admins make changes.</p>; }

export default AdminDashboardPage;
