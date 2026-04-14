import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';

export default function EditProfile() {
    const { user, updateProfile, changePassword } = useAuth();
    
    const [username, setUsername] = useState(user?.username || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '');
    const [removeImageRequested, setRemoveImageRequested] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Status messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setRemoveImageRequested(false); // Image upload cancels removal
        }
    };

    // Remove logic
    const handleRemoveImage = () => {
        setProfileImage(null);
        setPreviewUrl('');
        setRemoveImageRequested(true);
    };

    // Profile Details Update Logic
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoadingProfile(true);
        
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('phone', phone);
            
            if (removeImageRequested) {
                formData.append('removeProfileImage', 'true');
            } else if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const message = await updateProfile(formData);
            setSuccess(message);
            setRemoveImageRequested(false);
            setProfileImage(null);
        } catch (err) {
            setError(err.message);
        }
        setLoadingProfile(false);
    };

    // Password Change Logic
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoadingPassword(true);

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            setLoadingPassword(false);
            return;
        }
        
        try {
            const message = await changePassword(currentPassword, newPassword);
            setSuccess(message);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.message);
        }
        setLoadingPassword(false);
    };

    return (
        <div className="container-fluid fade-in">
            <h3 className="fw-bold mb-4 text-primary">Account Settings</h3>
            
            {success && <div className="alert alert-info alert-dismissible fade show border-0 shadow-sm" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i> {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>}
            {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

            <div className="row g-4">
                {/* Profile Update Card */}
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-primary py-3">
                            <h4 className="card-title mb-0 fw-bold text-white"><i className="bi bi-person-gear me-2"></i>Update Details</h4>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleProfileSubmit}>
                                {/* Profile Image Preview & Upload */}
                                <div className="text-center mb-4">
                                    <div className="position-relative d-inline-block">
                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border border-primary border-3" style={{ width: '120px', height: '120px', overflow: 'hidden' }}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                            ) : (
                                                <div className="w-100 h-100 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-2">
                                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>
                                        {/* Camera Icon Button */}
                                        <label htmlFor="image-upload" 
                                            className="position-absolute bottom-0 end-0 btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm border border-white border-2" 
                                            style={{ width: '38px', height: '38px', cursor: 'pointer', padding: '0', transition: 'all 0.2s' }}
                                        >
                                            <i className="bi bi-camera-fill fs-6"></i>
                                            <input 
                                                type="file" 
                                                id="image-upload" 
                                                className="d-none" 
                                                accept="image/*" 
                                                onChange={handleImageChange}
                                                disabled={loadingProfile}
                                            />
                                        </label>
                                        
                                        {/* Remove Button if image exists or preview exists */}
                                        {(previewUrl || user.profileImage) && !removeImageRequested && (
                                            <button 
                                                type="button"
                                                className="position-absolute bottom-0 start-0 btn btn-danger rounded-circle d-flex align-items-center justify-content-center shadow-sm border border-white border-2" 
                                                style={{ width: '38px', height: '38px', padding: '0', transition: 'all 0.2s' }}
                                                onClick={handleRemoveImage}
                                                title="Remove Photo"
                                            >
                                                <i className="bi bi-trash3-fill fs-6"></i>
                                            </button>
                                        )}
                                    </div>
                                    <p className="small text-muted mt-2">Update or remove your profile photo</p>
                                </div>

                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loadingProfile} />
                                    <label htmlFor="username">Username</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="email" className="form-control bg-light" id="email" value={user?.email || ''} disabled={true} />
                                    <label htmlFor="email">Email Address</label>
                                </div>
                                <div className="form-floating mb-4">
                                    <input type="tel" className="form-control" id="phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loadingProfile} />
                                    <label htmlFor="phone">Phone Number</label>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold" disabled={loadingProfile}>
                                    {loadingProfile ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                    ) : (
                                        <><i className="bi bi-check-circle-fill me-2"></i>Save Changes</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Password Change Card (Only for non-Google users) */}
                {!user?.googleId && (
                    <div className="col-md-6">
                        <div className="card shadow-lg h-100 border-0 rounded-lg">
                            <div className="card-header bg-light">
                                <h4 className="card-title mb-0 fw-bold">Change Password</h4>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-3">
                                        <PasswordInput 
                                            label="Current Password" 
                                            value={currentPassword} 
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            isConfirm={true}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <PasswordInput 
                                            label="New Password (min. 6 chars)" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-warning w-100" disabled={loadingPassword}>
                                        <i className="bi bi-key-fill me-2"></i>
                                        {loadingPassword ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
