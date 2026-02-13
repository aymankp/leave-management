import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./Admin.css";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      alert("Failed to load users");
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/admin/leaves");
      setLeaves(res.data);
    } catch {
      alert("Failed to load leaves");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLeaves();
  }, []);

  const changeRole = async (userId, role) => {
    try {
      setLoading(true);
      await api.put(`/admin/user/${userId}/role`, { role });
      fetchUsers();
    } catch {
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Add Employee Card */}
      <div className="card">
        <h2>Add Employee</h2>
        <form
          className="add-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const name = e.target.name.value;
            const email = e.target.email.value;
            const team = e.target.team.value;

            const res = await api.post("/admin/add-employee", {
              name,
              email,
              team,
            });

            alert(
              `Employee Added\nEmail: ${res.data.employee.email}\nTemp Password: ${res.data.employee.tempPassword}`
            );

            e.target.reset();
            fetchUsers();
          }}
        >
          <input name="name" placeholder="Employee Name" required />
          <input name="email" placeholder="Employee Email" required />
          <input name="team" placeholder="Team (backend/frontend)" required />
          <button>Add Employee</button>
        </form>
      </div>

      {/* Users Card */}
      <div className="card">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.role === "admin" ? (
                    "-"
                  ) : (
                    <select
                      value={u.role}
                      disabled={loading}
                      onChange={(e) =>
                        changeRole(u._id, e.target.value)
                      }
                    >
                      <option value="employee">employee</option>
                      <option value="manager">manager</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leaves Card */}
      <div className="card">
        <h2>All Leaves</h2>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l._id}>
                <td>{l.employee?.name}</td>
                <td>{l.employee?.email}</td>
                <td>{l.fromDate.slice(0, 10)}</td>
                <td>{l.toDate.slice(0, 10)}</td>
                <td>{l.reason}</td>
                <td className={`status ${l.status}`}>
                  {l.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
