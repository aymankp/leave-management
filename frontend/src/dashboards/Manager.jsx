import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Manager.css";
import socket from "../socket";

export default function Manager() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get("/leave/pending");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load pending leaves");
    }
  };
  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  // 🔥 SOCKET LOGIC (FIXED) & idle detectection
 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.id) return;

  socket.connect();

  socket.on("connect", () => {
    socket.emit("user-online", user.id);
  });

  let idleTimeout;

  const goIdle = () => {
    socket.emit("user-idle", user.id);
  };

  const resetTimer = () => {
    clearTimeout(idleTimeout);

    socket.emit("user-online", user.id);

    idleTimeout = setTimeout(goIdle, 300000); // 3 min test
  };

  resetTimer();

  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keydown", resetTimer);
  window.addEventListener("click", resetTimer);

  return () => {
    clearTimeout(idleTimeout);
    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("keydown", resetTimer);
    window.removeEventListener("click", resetTimer);
    socket.disconnect();
  };
}, []);



  const updateStatus = async (leaveId, status) => {
    try {
      setLoading(true);
      await api.put(
        `/leave/${leaveId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchPendingLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to update leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-container">
      <h2>Manager Dashboard</h2>

      {leaves.length === 0 ? (
        <p>No pending leaves 🎉</p>
      ) : (
        <table className="manager-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Action</th>
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
                <td>
                  <button
                    className="approve-btn"
                    disabled={loading}
                    onClick={() => updateStatus(l._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    disabled={loading}
                    onClick={() => updateStatus(l._id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
