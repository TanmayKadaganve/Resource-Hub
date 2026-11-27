import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../Navbar";
import Footer from "../components/Footer";
import "./AcademicUpdatesPage.css";

export default function AcademicUpdatesPage() {
  const [notices, setNotices] = useState([]);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch(`${API}/content/notices`).then((r) => r.json()), fetch(`${API}/content/links`).then((r) => r.json())])
      .then(([noticeData, linkData]) => { setNotices(noticeData.notices || []); setLinks(linkData.links || []); })
      .catch(() => setError("Could not load academic updates."));
  }, []);

  return <><Navbar /><main className="updates-page"><header><h1>Notices & Academic Links</h1><p>Announcements, examinations, calendars, and academic documents.</p></header>
    {error && <p role="alert">{error}</p>}
    <section><h2>Latest notices</h2>{notices.length ? notices.map((notice) => <article className="notice-card" key={notice._id}><div><span>{notice.category}</span><time>{new Date(notice.createdAt).toLocaleDateString()}</time></div><h3>{notice.title}</h3><p>{notice.body}</p></article>) : <p className="updates-empty">There are no current notices.</p>}</section>
    <section><h2>Academic information</h2>{links.length ? <div className="academic-link-grid">{links.map((link) => <a className="academic-link-card" href={link.url} target="_blank" rel="noreferrer" key={link._id}><span>{link.category} · {link.branch} · {link.scheme}</span><strong>{link.title} ↗</strong>{link.description && <p>{link.description}</p>}</a>)}</div> : <p className="updates-empty">Academic links will appear here when published.</p>}</section>
  </main><Footer /></>;
}
