import React, { useState, useRef } from 'react';
import './Profile.css';

function Profile({ userProfile, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    currency: userProfile?.currency || 'USD',
    avatar: userProfile?.avatar || ''
  });
  const fileInputRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 Profile</h1>
        <button 
          className="edit-profile-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-container">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <span>{formData.name?.charAt(0) || '👤'}</span>
              </div>
            )}
            {isEditing && (
              <button 
                className="change-avatar-btn"
                onClick={() => fileInputRef.current.click()}
              >
                📷 Change Photo
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
              </div>
              <button type="submit" className="save-profile-btn">
                💾 Save Changes
              </button>
            </form>
          ) : (
            <div className="profile-display">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">{userProfile?.name || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{userProfile?.email || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Currency</span>
                <span className="info-value">{userProfile?.currency || 'USD'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : 'Today'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;