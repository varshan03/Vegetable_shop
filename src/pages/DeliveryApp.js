// frontend/src/pages/DeliveryApp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from '../server';

export default function DeliveryApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      nav("/login");
      return;
    }
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${config.baseURL}/api/delivery/tasks/${user.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
    setLoading(false);
  }

  async function updateTask(taskId, newStatus) {
    try {
      await fetch(`${config.baseURL}/api/delivery/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  function nextStatus(current) {
    if (current === "assigned") return "picked_up";
    if (current === "picked_up") return "on_the_way";
    if (current === "on_the_way") return "delivered";
    return null;
  }

  return (
    <div className="container">
      <header className="topbar">
        <h2>Delivery Dashboard</h2>
        <button
          onClick={() => {
            localStorage.removeItem("user");
            nav("/login");
          }}
        >
          Logout
        </button>
      </header>

      {loading && <p>Loading...</p>}

      <div className="grid">
        {tasks.map((t) => (
          <div key={t.id} className="product-card">
            <h4>Order #{t.order_id}</h4>
            <p>Customer: {t.customer_name || "N/A"}</p>
            <p>Total: ₹{t.total_price}</p>
            <p>Status: <strong>{t.status}</strong></p>
            {nextStatus(t.status) && (
              <button onClick={() => updateTask(t.id, nextStatus(t.status))}>
                Mark as {nextStatus(t.status)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
