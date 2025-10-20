import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './AdminDashboard.css';

function AdminDashboard() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
        } catch (error) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
        }

        fetch('http://localhost:5000/api/admin/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 401) { 
                localStorage.removeItem('token');
                navigate('/login'); 
            }
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setReports(data);
            }
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Error fetching admin reports:', error);
            setIsLoading(false);
        });
    }, [navigate]);
    
    // NEW: Logout Function
    const handleLogout = () => {
        // Step 1: Remove the token from local storage
        localStorage.removeItem('token');
        // Step 2: Redirect to the login page
        navigate('/login');
    };

    const handleResolveReport = (reportId) => {
        // ... (this function is unchanged)
        const token = localStorage.getItem('token');
        if (user && user.role === 'admin') {
            fetch(`http://localhost:5000/api/admin/reports/${reportId}/resolve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                setReports(prevReports => 
                    prevReports.map(report => 
                        report._id === reportId ? { ...report, status: 'resolved' } : report
                    )
                );
            })
            .catch(error => console.error('Error resolving report:', error));
        }
    };

    return (
        <div className="admin-page-container">
            <header className="admin-header">
                <h1>{user && user.role === 'admin' ? 'Admin' : 'User'} Dashboard</h1>
                <div className="header-nav"> {/* NEW: Wrapper for buttons */}
                    <Link to="/" className="back-button">&larr; Back to Map</Link>
                    {/* NEW: Logout Button */}
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <div className="admin-content">
              {/* ... (rest of the JSX is unchanged) ... */}
              <div className="reports-panel">
                <h2>Citizen Reports ({reports.length})</h2>
                {isLoading ? <p>Loading reports...</p> : (
                  <div className="reports-list">
                    {reports.map(report => (
                      <div
                        key={report._id}
                        className={`report-card status-${report.status} ${user && user.role === 'admin' && report.status === 'pending' ? 'clickable' : ''}`}
                        onClick={() => handleResolveReport(report._id)}
                      >
                        <h3>{report.issue_type}</h3>
                        <p className="report-location">Lat: {report.location.coordinates[1].toFixed(4)}, Lon: {report.location.coordinates[0].toFixed(4)}</p>
                        <p className="report-description">{report.description}</p>
                        <span className="report-status">{report.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="actions-panel">
                {user && user.role !== 'admin' && (
                  <div className="quick-action-card">
                    <h2>Emergency Contact</h2>
                    <p>For critical disaster response, use the link below.</p>
                    <a href="https://resqforce-final.onrender.com" target="_blank" rel="noopener noreferrer" className="emergency-button">
                      Report Emergency (ResQForce) 🚨
                    </a>
                  </div>
                )}
                <div className="data-summary-card">
                  <h2>System Summary</h2>
                  <p>Total AQI Sensors: 4</p>
                  <p>Total Citizen Reports: {reports.length}</p>
                </div>
              </div>
            </div>
        </div>
    );
}

export default AdminDashboard;