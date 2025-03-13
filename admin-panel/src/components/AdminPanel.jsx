import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [trades, setTrades] = useState([]);
  const [token,setToken]=useState(localStorage.getItem('token'));;
  const navigate=useNavigate();
  const logout=()=>{
    localStorage.removeItem('token');
    setToken(null);
  }
  useEffect(() => {
    if (!token) {
      console.error("No token found, redirecting to login...");
      navigate('/login');
      return;
    }

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket");

      // Authenticate and subscribe
      ws.send(JSON.stringify({ token, type: "subscribe_events" }));
      ws.send(JSON.stringify({ token, type: "subscribe_trades" }));
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === "events_data" || data.type === "events_update") {
        setEvents(data.data);
      } else if (data.type === "trades_data" || data.type === "trades_update") {
        setTrades(data.data);
      } else if (data.error) {
        console.error("WebSocket Error:", data.error);
        navigate('/login');
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => ws.close();
  }, [token]);

  return (
    <div>
      <h2>Admin Panel <button onClick={logout}>Logout</button> </h2>
      <h3>Live Events</h3>
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            {event.title} - Status: {event.status}
          </li>
        ))}
      </ul>

      <h3>Live Trades</h3>
      <ul>
        {trades.map((trade) => (
          <li key={trade._id}>
            User: {trade.user.username} | Event: {trade.event.title} | Bet: {trade.option} | Amount: {trade.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
