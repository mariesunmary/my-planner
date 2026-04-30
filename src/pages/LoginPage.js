import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Auth.module.css";
import common from "../styles/Common.module.css";
import { useAuth } from "../context/AuthContext";

/**
 *
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.authTitle}>Welcome back</h2>
      <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.authInputWrapper}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={styles.authInput}
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className={styles.authInputWrapper}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.authInput}
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {error && <p className={common.errorMessage}>{error}</p>}
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
