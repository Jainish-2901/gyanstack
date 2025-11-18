import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import DashboardLayout from '../components/DashboardLayout'; // <-- NAYA IMPORT

export default function EditProfile() {
    // AuthContext se naye functions lein
    const { user, updateProfile, changePassword } = useAuth();
    
    // State
    const [username, setUsername] = useState(user?.username || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Status messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Profile Details Update Logic
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoadingProfile(true);
        
        try {
            const message = await updateProfile(username, phone);
            setSuccess(message);
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
            // Fields reset karein
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.message);
        }
        setLoadingPassword(false);
    };


    return (
        <DashboardLayout>
            <div className="container-fluid fade-in">
                <h1 className="display-5 fw-bold mb-4" style={{color: '#0056b3'}}>Account Settings</h1>
                
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row g-4">
                    {/* Profile Update Card */}
                    <div className="col-md-6">
                        <div className="card shadow-lg h-100 border-0 rounded-lg">
                            <div className="card-header bg-light">
                                <h4 className="card-title mb-0 fw-bold">Update Details</h4>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="form-floating mb-3">
                                        <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loadingProfile} />
                                        <label htmlFor="username">Username</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="email" value={user?.email || ''} disabled={true} />
                                        <label htmlFor="email">Email (Cannot change)</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loadingProfile} />
                                        <label htmlFor="phone">Phone Number</label>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loadingProfile}>
                                        <i className="bi bi-save me-2"></i>
                                        {loadingProfile ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Password Change Card */}
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
                </div>
            </div>
        </DashboardLayout>
    );
}