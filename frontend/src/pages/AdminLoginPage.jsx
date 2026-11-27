import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./AdminPages.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Admin login failed.");
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminEmail", data.email);
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <Link to="/" className="admin-back-link">← Resource Hub</Link>
        <div className="admin-mark">RH</div>
        <p className="admin-kicker">CENTRAL ADMINISTRATION</p>
        <h1>Admin Login</h1>
        <p className="admin-muted">Sign in to manage academic resources across all branches.</p>
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        <button className="admin-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard"}</button>
      </form>
    </main>
  );
}
