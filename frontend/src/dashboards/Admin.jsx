import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId, role) => {
    try {
      setLoading(true);
      await api.put(`/admin/user/${userId}/role`, { role });
      fetchUsers(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // fetch leaves
  const fetchLeaves = async () => {
    try {
      const res = await api.get("/admin/leaves");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load leaves");
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchLeaves();
  }, []);

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      <h3>Add Employee</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const name = e.target.name.value;
          const email = e.target.email.value;

          const res = await api.post("/admin/add-employee", { name, email });

          alert(
            `Employee added\nEmail: ${res.data.employee.email}\nTemp Password: ${res.data.employee.tempPassword}`,
          );

          e.target.reset();
        }}
      >
        <input name="name" placeholder="Employee Name" required />
        <input name="email" placeholder="Employee Email" required />
        <button>Add</button>
      </form>
      <hr />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
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
                  <span>—</span>
                ) : (
                  <select
                    value={u.role}
                    disabled={loading}
                    onChange={(e) => changeRole(u._id, e.target.value)}
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
      <hr />

      <h3>All Leaves (System Overview)</h3>

      {leaves.length === 0 ? (
        <p>No leaves found</p>
      ) : (
        <table className="admin-table">
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
                <td className={`status-${l.status}`}>{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
