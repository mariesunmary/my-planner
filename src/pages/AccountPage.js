import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import common from "../styles/Common.module.css";
import styles from "./AccountPage.module.css";
import api from "../services/api";

/**
 *
 */
function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const { applyTheme } = useTheme();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      updateUser(res.data);
      applyTheme(res.data.theme);
    }).catch(() => {});
  }, []);

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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete("/auth/me");
      logout();
      navigate("/");
    } catch {
      setDeleteLoading(false);
    }
  };

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <div className={styles.hero}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.heroInfo}>
          <h2 className={styles.heroName}>{user?.name || "User"}</h2>
          {memberSince && <p className={styles.heroMember}>Member since {memberSince}</p>}
          <p className={styles.heroSub}>Manage your personal information and keep your account secure.</p>
        </div>
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

        <section className={`${styles.section} ${styles.dangerSection}`}>
          <h3 className={styles.dangerTitle}>Danger Zone</h3>
          <p className={styles.dangerDesc}>
            Once you delete your account, all your data — tasks, habits, expenses, and projects — will be permanently removed.
          </p>

          {!showDeleteConfirm ? (
            <button className={styles.dangerBtn} onClick={() => setShowDeleteConfirm(true)}>
              Delete my account
            </button>
          ) : (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                Are you sure? This action <strong>cannot be undone</strong>.
              </p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmDeleteBtn} onClick={handleDeleteAccount} disabled={deleteLoading}>
                  {deleteLoading ? "Deleting…" : "Yes, delete my account"}
                </button>
                <button className={styles.confirmCancelBtn} onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AccountPage;
