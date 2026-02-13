import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Employee.css";
import socket from "../socket";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
  const [balance, setBalance] = useState(null);
  const [leaveType, setLeaveType] = useState("");
  const INITIAL_CASUAL = 10;
  const INITIAL_SICK = 5;

  const fetchMyLeaves = async () => {
    const res = await api.get("/leave/my");
    setLeaves(res.data);
  };
  const fetchBalance = async () => {
    const res = await api.get("/auth/me");
    setBalance(res.data.leaveBalance);
  };

  // calculation for pie chart
  const usedCasual = balance ? INITIAL_CASUAL - balance.casual : 0;

  const usedSick = balance ? INITIAL_SICK - balance.sick : 0;

  const chartData = {
    labels: ["Casual", "Sick"],
    datasets: [
      {
        label: "Used Leaves",
        data: [usedCasual, usedSick],
        backgroundColor: ["#4e73df", "#e74a3b"],
      },
    ],
  };

  useEffect(() => {
    fetchMyLeaves();
    fetchBalance();
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

    if (!fromDate || !toDate || !reason || !leaveType) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    await api.post("/leave/apply", {
      fromDate,
      toDate,
      reason,
      leaveType,
    });

    setLoading(false);
    setFromDate("");
    setToDate("");
    setReason("");
    setLeaveType("");
    fetchMyLeaves();
    fetchBalance();
  };

  return (
    <div className="employee-wrapper">
      <div className="employee-header">
        <h1>Employee Dashboard</h1>
      </div>

      {/* Top Section */}
      <div className="top-section">
        {balance && (
          <div className="balance-card">
            <h3>Leave Balance</h3>
            <p>Casual: {balance.casual}</p>
            <p>Sick: {balance.sick}</p>
          </div>
        )}

        {/* Leave Balance Card */}
        {balance && (
          <div className="card balance-card">
            <h3>Leave Balance</h3>

            <div className="balance-grid">
              <div className="balance-item">
                <p className="balance-number">{balance.casual}</p>
                <span>Casual Leaves Left</span>
              </div>

              <div className="balance-item">
                <p className="balance-number">{balance.sick}</p>
                <span>Sick Leaves Left</span>
              </div>

              <div className="balance-item total">
                <p className="balance-number">
                  {balance.casual + balance.sick}
                </p>
                <span>Total Leaves Left</span>
              </div>
            </div>
          </div>
        )}
        {/* chart */}
        {balance && (
          <div className="card">
            <h3>Leave Usage</h3>
            <Bar data={chartData} />
          </div>
        )}

        {/* Manager Status Card */}
        <div className="card status-card">
          <h3>Manager Status</h3>
          {managerOnline ? (
            <p className="status online">🟢 Online</p>
          ) : isIdle ? (
            <p className="status idle">🟡 Idle</p>
          ) : lastSeen ? (
            <p className="status offline">
              Last seen at {new Date(lastSeen).toLocaleString()}
            </p>
          ) : (
            <p className="status offline">Offline</p>
          )}
        </div>
      </div>

      {/* Apply Leave */}
      <div className="card">
        <h3>Apply Leave</h3>
        <form className="leave-form" onSubmit={applyLeave}>
          <div className="form-group">
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div className="form-group">
              <label>Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
              </select>
            </div>

            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="form-group full">
            <label>Reason</label>
            <input
              type="text"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button disabled={loading}>
            {loading ? "Applying..." : "Apply Leave"}
          </button>
        </form>
      </div>

      {/* My Leaves */}
      <div className="card">
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
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.fromDate.slice(0, 10)}</td>
                  <td>{leave.toDate.slice(0, 10)}</td>
                  <td>{leave.reason}</td>
                  <td className={`type ${leave.leaveType}`}>
                    {leave.leaveType}
                  </td>
                  <td className={`status ${leave.status}`}>{leave.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
