import api from "../api/axios";
import "./Manager.css";
import socket from "../socket";
import { useEffect, useState, useCallback } from "react";

export default function Manager() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState({});

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get("/leave/pending");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load pending leaves");
    }
  };

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
      fetchLeaves();

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const fetchRecommendation = async (leaveId) => {
    try {
      console.log("Fetching AI for:", leaveId);
     const res = await api.get(
  `/leave/${leaveId}/recommendation`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);


      setRecommendations((prev) => ({
        ...prev,
        [leaveId]: res.data.recommendation,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  const fetchLeaves = useCallback(async () => {
    const res = await api.get("/leave/pending");
    setLeaves(res.data);

    res.data.forEach((leave) => {
      fetchRecommendation(leave._id);
    });
  }, []);
  useEffect(() => {
  fetchLeaves();
}, [fetchLeaves]);

  return (
    <div className="manager-container">
      <h2>Manager Dashboard</h2>

      {leaves.length === 0 ? (
        <p>No pending leaves...</p>
      ) : (
        <table className="manager-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Type</th>
              <th>AI Suggestion</th>
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
                <td>{l.leaveType}</td>

                {/* ✅ AI suggestion column */}
                <td>
                  {recommendations[l._id] ? (
                    <span className="ai-text">🤖 {recommendations[l._id]}</span>
                  ) : (
                    "Loading..."
                  )}
                </td>

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
