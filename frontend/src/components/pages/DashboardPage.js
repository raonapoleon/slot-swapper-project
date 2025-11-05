import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

  const { title, startTime, endTime } = formData;

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events/mine');
      setEvents(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events', formData);
      fetchEvents();
      setFormData({ title: '', startTime: '', endTime: '' });
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const onToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
      await axios.put(`/api/events/${id}`, { status: newStatus });
      fetchEvents();
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${id}`);
        fetchEvents();
      } catch (err) {
        console.error(err.response.data);
      }
    }
  };

  return (
    <div>
      <h2>Your Dashboard</h2>

      <h3>Create New Event</h3>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="text"
            placeholder="Event Title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={startTime}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={endTime}
            onChange={onChange}
            required
          />
        </div>
        <input type="submit" value="Create Event" />
      </form>

      <h3>Your Events</h3>
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="event-item">
              <h4>{event.title}</h4>
              <p>
                From: {new Date(event.startTime).toLocaleString()}
                <br />
                To: {new Date(event.endTime).toLocaleString()}
              </p>
              <p>
                Status: <strong>{event.status}</strong>
              </p>
              <button
                onClick={() => onToggleStatus(event._id, event.status)}
                disabled={event.status === 'SWAP_PENDING'}
              >
                {event.status === 'BUSY' ? 'Make Swappable' : 'Make Busy'}
              </button>
              <button
                onClick={() => onDelete(event._id)}
                disabled={event.status === 'SWAP_PENDING'}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>You have no events. Create one above!</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;