import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Employee.css";
import socket from "../socket";

export default function Employee() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managerOnline, setManagerOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isIdle, setIsIdle] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const managerId = user?.manager;

  const fetchMyLeaves = async () => {
    const res = await api.get("/leave/my");
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  // SOCKET + INITIAL STATUS
  useEffect(() => {
    if (!managerId) return;

    // connect socket (shared instance)
    socket.connect();

    // fetch initial status (important on refresh)
    const fetchInitialStatus = async () => {
      const res = await api.get(`/status/${managerId}`);
      setManagerOnline(res.data.online);
      setLastSeen(res.data.lastSeen);
    };

    fetchInitialStatus();

    // socketListner
    socket.on("status-update", (data) => {
      if (String(data.userId) === String(managerId)) {
        if (data.idle) {
          setIsIdle(true);
          setManagerOnline(false);
          return;
        }
        setIsIdle(false);
        if (data.online) {
          setManagerOnline(true);
          setLastSeen(null);
        }
        if (!data.online && data.lastSeen) {
          setManagerOnline(false);
          setLastSeen(data.lastSeen);
        }
      }
    });

    return () => {
      socket.off("status-update");
      //DO NOT socket.disconnect() here (shared socket)
    };
  }, [managerId]);

  const applyLeave = async (e) => {
    e.preventDefault();

    if (!fromDate || !toDate || !reason) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    await api.post("/leave/apply", { fromDate, toDate, reason });
    setLoading(false);

    setFromDate("");
    setToDate("");
    setReason("");
    fetchMyLeaves();
  };

  return (
    <div className="employee-container">
      <h2>Employee Dashboard</h2>

      <p>
        Manager Status:{" "}
        {managerOnline ? (
          <span style={{ color: "green" }}>🟢 Online</span>
        ) : isIdle ? (
          <span style={{ color: "orange" }}>🟡 Idle</span>
        ) : lastSeen ? (
          <span style={{ color: "gray" }}>
            Last seen at {new Date(lastSeen).toLocaleString()}
          </span>
        ) : (
          <span style={{ color: "gray" }}>Offline</span>
        )}
      </p>

      <form className="leave-form" onSubmit={applyLeave}>
        <h3>Apply Leave</h3>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Applying..." : "Apply Leave"}
        </button>
      </form>

      <h3>My Leaves</h3>

      {leaves.length === 0 ? (
        <p>No leaves found</p>
      ) : (
        <table className="leave-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.fromDate.slice(0, 10)}</td>
                <td>{leave.toDate.slice(0, 10)}</td>
                <td>{leave.reason}</td>
                <td className={`status-${leave.status}`}>{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
