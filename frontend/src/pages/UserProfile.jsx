import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import "../App.css";
import "./UserProfile.css";
import Loading from "../components/Loading";
import { useNotification } from "../hooks/useNotification";
import NotificationModal from "../components/NotificationModal";
import { getUserFromStorage } from "../utils/localStorage";

const UserProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);

    // Profile form state
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Security form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const { notification, showSuccess, showError, hideNotification } = useNotification();

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            // Add cache-busting query params to ensure fresh data
            const timestamp = Date.now();
            const [profileRes, userRes] = await Promise.all([
                axios.get(`/api/users/profile?_t=${timestamp}`),
                axios.get(`/api/users/me?_t=${timestamp}`)
            ]);

            // profileRes.data is normalized to { profile } by axios interceptor
            // userRes.data is the user object directly (not using sendSuccess)
            const profileData = profileRes.data?.profile || profileRes.data;
            const userData = userRes.data;

            setProfile(profileData);
            setUser(userData);
            setName(profileData.name || "");
            setAvatarUrl(profileData.avatarUrl || "");
        } catch (error) {
            console.error("Error fetching profile:", error);
            showError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await axios.put("/api/users/profile", {
                name,
                avatarUrl
            });
            showSuccess("Profile updated successfully");
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            showError(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError("New passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showError("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            await axios.put("/api/users/password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            showSuccess("Password changed successfully");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Error changing password:", error);
            showError(error.response?.data?.message || "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) return;

        const password = window.prompt("Please enter your password to confirm account deletion:");

        if (!password) return;

        setSaving(true);
        try {
            await axios.delete("/api/users/account", {
                data: { password }
            });
            showSuccess("Account deleted successfully");
            localStorage.clear();
            navigate("/login");
        } catch (error) {
            console.error("Error deleting account:", error);
            showError(error.response?.data?.message || "Failed to delete account");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading fullScreen={true} />;

    const tabs = [
        { id: "profile", label: "Profile", icon: "👤" },
        { id: "security", label: "Security", icon: "🛡️" },
        { id: "account", label: "Account", icon: "📋" }
    ];

    return (
        <motion.div
            className="user-profile-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="profile-header">
                <div className="profile-avatar-section">
                    <div className="avatar-container">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{name}</h1>
                        <p className="profile-email">{user?.email}</p>
                        <div className="profile-badges">
                            <span className="role-badge">{user?.role || "user"}</span>
                            <span className="level-badge">Level {profile?.stats?.level || 1}</span>
                        </div>
                    </div>
                </div>

                {profile?.stats && (
                    <div className="profile-stats">
                        <motion.div
                            className="stat-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="stat-icon">📚</div>
                            <div className="stat-value">{profile.stats.completedQuizzes || 0}</div>
                            <div className="stat-label">Quizzes</div>
                        </motion.div>
                        <motion.div
                            className="stat-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="stat-icon">🏆</div>
                            <div className="stat-value">{profile.stats.badges || 0}</div>
                            <div className="stat-label">Badges</div>
                        </motion.div>
                        <motion.div
                            className="stat-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="stat-icon">⭐</div>
                            <div className="stat-value">{profile.stats.totalXP || 0}</div>
                            <div className="stat-label">XP</div>
                        </motion.div>
                        <motion.div
                            className="stat-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="stat-icon">🔥</div>
                            <div className="stat-value">{profile.stats.loginStreak || 0}</div>
                            <div className="stat-label">Day Streak</div>
                        </motion.div>
                    </div>
                )}
            </div>

            <div className="profile-tabs">
                {tabs.map((tab, index) => (
                    <motion.button
                        key={tab.id}
                        className={`profile-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            <div className="profile-content">
                {activeTab === "profile" && (
                    <motion.div
                        className="profile-tab-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2>Profile Information</h2>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Avatar URL</label>
                            <input
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>
                        <button
                            className="save-btn"
                            onClick={handleSaveProfile}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </motion.div>
                )}

                {activeTab === "security" && (
                    <motion.div
                        className="profile-tab-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2>Change Password</h2>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    currentPassword: e.target.value
                                }))}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    newPassword: e.target.value
                                }))}
                                placeholder="Enter new password (min 6 characters)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    confirmPassword: e.target.value
                                }))}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <button
                            className="save-btn"
                            onClick={handleChangePassword}
                            disabled={saving}
                        >
                            {saving ? "Changing..." : "Change Password"}
                        </button>
                    </motion.div>
                )}

                {activeTab === "account" && (
                    <motion.div
                        className="profile-tab-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2>Account Settings</h2>
<div className="account-section danger-section">
                            <h3>Danger Zone</h3>
                            <p className="section-description">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button
                                className="danger-btn"
                                onClick={handleDeleteAccount}
                                disabled={saving}
                            >
                                {saving ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <NotificationModal
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />
        </motion.div>
    );
};

export default UserProfile;
