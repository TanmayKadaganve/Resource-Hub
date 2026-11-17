
import { useState } from "react";
import API from "../api";
import "./FacultyLogin.css";

const branches = [
  "FIRST YEAR",
  "CSE",
  "AIML",
  "ECE",
  "MECHANICAL",
  "CIVIL",
];

function FacultyLogin() {
  const [branch, setBranch] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/faculty/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            branch,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the authentication token
      localStorage.setItem("facultyToken", data.token);
      localStorage.setItem("facultyBranch", data.branch);
      localStorage.setItem("facultyRole", data.role);

      // Redirect after successful login
      window.location.href = "/";
    } catch (error) {
      setError(
        error.message || "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-login-page">
      <div className="faculty-login-card">
        <div className="faculty-login-header">
          <h1>Faculty Login</h1>

          <p>
            Sign in to manage academic resources
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="faculty-form-group">
            <label htmlFor="branch">
              Select Branch
            </label>

            <select
              id="branch"
              value={branch}
              onChange={(e) =>
                setBranch(e.target.value)
              }
              required
            >
              <option value="">Select Branch</option>
              
              {branches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="faculty-form-group">
            <label htmlFor="password">
              Branch Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter branch password"
              required
            />
          </div>

          {error && (
            <p className="faculty-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FacultyLogin;
