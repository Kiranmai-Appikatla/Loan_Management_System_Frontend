import { useContext, useState } from "react";
import { LoanContext } from "../LoanContext.jsx";
import "./Admin.css";
import { useNavigate } from "react-router-dom";

// Helper component for the Edit Modal
const EditUserModal = ({ user, index, onSave, onClose }) => {
  const [newName, setNewName] = useState(user.name);
  const [newRole, setNewRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState("");

  const handleSave = () => {
    onSave(index, newName.trim(), newRole, newPassword.trim());
  };

  const handleResetPassword = () => {
    if (window.confirm(`Are you sure you want to reset the password for ${user.name}? A default temporary password '12345' will be set.`)) {
      onSave(index, user.name, user.role, "12345");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h4>Edit User: {user.name}</h4>
        <div className="input-group-vertical">
          <label>Name:</label>
          <input 
            type="text" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            className="admin-input" 
          />
          
          <label>Role:</label>
          <select 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value)}
            className="admin-select"
          >
            <option value="Borrower">Borrower</option>
            <option value="Lender">Lender</option>
            <option value="Analyst">Analyst</option>
            <option value="Admin">Admin</option>
          </select>

          <label>New Password (Leave blank to keep existing):</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder="Enter new password"
            className="admin-input"
          />
        </div>
        
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="reset-button" onClick={handleResetPassword}>Reset Password</button>
          <button className="add-button" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default function Admin() {
  const navigate = useNavigate();
  const { users = [], setUsers, setLoans, setLoanOffers } = useContext(LoanContext);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Borrower");
  const [password, setPassword] = useState("");
  const [systemStatus, setSystemStatus] = useState("Open");
  const [editingUser, setEditingUser] = useState(null);

  const addUser = () => {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedPassword) {
      alert("Name and password cannot be empty!");
      return;
    }

    const exists = users.some(
      (user) => user.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      alert("User with this name already exists!");
      return;
    }

    setUsers([...users, { name: trimmedName, role, password: trimmedPassword }]);
    setName("");
    setPassword("");
    setRole("Borrower");
    alert(`User "${trimmedName}" (${role}) added successfully!`);
  };

  const removeUser = (index) => {
    const userToRemove = users[index];
    if (userToRemove.role === "Admin") {
      alert("Cannot remove an Admin user.");
      return;
    }

    if (window.confirm(`Are you sure you want to remove user "${userToRemove.name}"?`)) {
      const newUsers = [...users];
      newUsers.splice(index, 1);
      setUsers(newUsers);
    }
  };

  const saveUserChanges = (index, newName, newRole, newPassword) => {
    const newUsers = [...users];
    const oldUser = newUsers[index];

    if (newName !== oldUser.name) {
      const nameConflict = users.some(
        (user, i) => i !== index && user.name.toLowerCase() === newName.toLowerCase()
      );
      if (nameConflict) {
        alert("A user with this new name already exists.");
        return;
      }
    }

    newUsers[index] = {
      ...oldUser,
      name: newName,
      role: newRole,
      password: newPassword.trim() ? newPassword.trim() : oldUser.password,
    };

    setUsers(newUsers);
    setEditingUser(null);
    alert(`User "${newName}" updated successfully!`);
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL loan data? This cannot be undone.")) {
      setLoans([]);
      setLoanOffers([]);
      alert("All loan data cleared!");
    }
  };

 return (
  <div className="admin-container">
    
    {/* ✅ ADMIN DASHBOARD HEADER */}
    <header className="dashboard-header">
      <h1>Welcome, Admin</h1>
      <p>Manage Users, System Status, & Loan Data</p>

      <button className="home-btn" onClick={() => navigate("/")}>
        🏠 Home
      </button>
    </header>

    <div className="admin-content">
      <section className="admin-section">
        <h2 className="section-title">Admin Dashboard</h2>

        {/* System Control Panel */}
        <div className="system-control-panel">
          <h3 className="panel-title">System Control</h3>
          <div className="status-toggle-group">
            <span className="status-label">System Status:</span>
            <span className={`system-status-badge ${systemStatus.toLowerCase()}`}>
              {systemStatus}
            </span>
            <button
              className={`toggle-button ${systemStatus === "Open" ? "maintenance" : "open"}`}
              onClick={() =>
                setSystemStatus(systemStatus === "Open" ? "Maintenance" : "Open")
              }
            >
              Switch to {systemStatus === "Open" ? "Maintenance" : "Open"}
            </button>
          </div>
          <p className="system-hint">
            In <strong>Maintenance</strong> mode, users cannot create new loan offers or send requests.
          </p>
        </div>

        {/* Add User Panel */}
        <div className="add-user-panel">
          <h3 className="panel-title">Add New User</h3>
          <div className="input-group">
            <input
              className="admin-input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              className="admin-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              className="admin-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Borrower">Borrower</option>
              <option value="Lender">Lender</option>
              <option value="Analyst">Analyst</option>
              <option value="Admin">Admin</option>
            </select>
            <button className="add-button" onClick={addUser}>Add User</button>
          </div>
        </div>

        {/* User Management */}
        <div className="users-panel">
          <h3 className="panel-title">User Management</h3>
          <div className="users-list">
            {users.length > 0 ? (
              users.map((user, index) => (
                <div key={user.name} className="user-card">
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="user-actions">
                    <button
                      className="edit-button"
                      onClick={() => setEditingUser({ user, index })}
                    >
                      Edit
                    </button>
                    <button
                      className="remove-button"
                      onClick={() => removeUser(index)}
                      disabled={user.role === "Admin"}
                      title={
                        user.role === "Admin"
                          ? "Cannot remove Admin"
                          : "Remove user"
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="actions-panel">
          <h3 className="panel-title">Data Management</h3>
          <button className="danger-button" onClick={clearAllData}>
            Clear All Loan Data
          </button>
        </div>
      </section>
    </div>

    {/* Edit Modal */}
    {editingUser && (
      <EditUserModal
        user={editingUser.user}
        index={editingUser.index}
        onSave={saveUserChanges}
        onClose={() => setEditingUser(null)}
      />
    )}
  </div>
);

}
