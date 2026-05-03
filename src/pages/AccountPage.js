import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import common from "../styles/Common.module.css";
import styles from "./AccountPage.module.css";
import api from "../services/api";

/**
 *
 */
function AccountPage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await api.put("/auth/me", profileForm);
      updateUser(res.data);
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.error || "Failed to update profile." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await api.put("/auth/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.error || "Failed to change password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <div className={styles.hero}>
        <div className={styles.avatar}>{initials}</div>
        <h2 className={styles.heroName}>{user?.name || "User"}</h2>
        <p className={styles.heroSub}>Manage your personal information and keep your account secure.</p>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Profile</h3>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Name</label>
            <input
              className={common.input}
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={common.input}
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          {profileMsg && (
            <p className={profileMsg.type === "success" ? styles.success : styles.error}>{profileMsg.text}</p>
          )}
          <button className={common.addButton} onClick={handleProfileSave} disabled={profileLoading}>
            {profileLoading ? "Saving…" : "Save changes"}
          </button>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Change Password</h3>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Current password</label>
            <input
              className={common.input}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>New password</label>
            <input
              className={common.input}
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirm new password</label>
            <input
              className={common.input}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          {passwordMsg && (
            <p className={passwordMsg.type === "success" ? styles.success : styles.error}>{passwordMsg.text}</p>
          )}
          <button className={common.addButton} onClick={handlePasswordSave} disabled={passwordLoading}>
            {passwordLoading ? "Saving…" : "Change password"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default AccountPage;
