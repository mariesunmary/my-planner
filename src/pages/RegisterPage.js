import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Auth.module.css";
import common from "../styles/Common.module.css";
import { useAuth } from "../context/AuthContext";

/**
 *
 */
function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.authTitle}>Create your account</h2>
      <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.authInputWrapper}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className={styles.authInput}
            value={form.name}
            onChange={handleChange}
          />
        </div>
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
            autoComplete="new-password"
            className={styles.authInput}
            value={form.password}
            onChange={handleChange}
          />
        </div>
        {error && <p className={common.errorMessage}>{error}</p>}
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
