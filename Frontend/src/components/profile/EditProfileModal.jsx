import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import "./EditProfileModal.css";

function EditProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files are allowed (jpeg, jpg, png, gif, webp)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = [];
    if (!formData.username || formData.username.trim().length < 3) {
      errors.push("Username must be at least 3 characters");
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email");
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setLoading(true);
    try {
      console.log("Sending profile update:", {
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      // Upload profile picture if selected
      if (profilePicture) {
        const formDataUpload = new FormData();
        formDataUpload.append("profilePicture", profilePicture);
        
        console.log("Uploading profile picture...");
        const uploadResponse = await api.post("/api/user/profile-picture", formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        console.log("Upload response:", uploadResponse.data);
        toast.success(uploadResponse.data.message);
        
        // Update user with new profile picture
        onUpdate(uploadResponse.data.user);
      }

      // Update profile information
      console.log("Updating profile information...");
      const response = await api.put("/api/user/profile", {
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      console.log("Profile update response:", response.data);
      toast.success(response.data.message);
      onUpdate(response.data.user);
      onClose();
    } catch (err) {
      console.error("Profile update error:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });
    setProfilePicture(null);
    setPreviewUrl(user?.profilePicture || null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={handleCancel} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile preview" />
              ) : (
                <div className="profile-picture-placeholder">
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : "👤"}
                </div>
              )}
            </div>
            <div className="profile-picture-actions">
              <input
                type="file"
                id="profilePictureInput"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="profilePictureInput"
                className="change-photo-btn"
              >
                Change Photo
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="username">Name</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-save"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
