import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const RequestsPage = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const { user, fetchPendingRequestsCount } = useContext(AuthContext); // Get the function here

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/swap/my-requests');
      const allRequests = res.data;

      setIncomingRequests(
        allRequests.filter(
          (req) =>
            req.responder._id === user._id && req.status === 'PENDING'
        )
      );
      setOutgoingRequests(
        allRequests.filter((req) => req.requester._id === user._id)
      );
      // After fetching requests, also update the global count
      fetchPendingRequestsCount(); 
    } catch (err) {
      console.error(err.response.data);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleResponse = async (requestId, acceptance) => {
    try {
      await axios.post(`/api/swap/response/${requestId}`, { acceptance });
      fetchRequests(); // Refresh the lists and global count after responding
    } catch (err) {
      console.error(err.response.data);
      alert('Failed to respond to request.');
    }
  };

  return (
    <div>
      <h2>Your Swap Requests</h2>

      <h3>Incoming Requests</h3>
      <div className="requests-list">
        {incomingRequests.length > 0 ? (
          incomingRequests.map((req) => (
            <div key={req._id} className="event-item">
              <h4>
                Request from: {req.requester.name}
              </h4>
              <p>
                <strong>They Offer:</strong> {req.requesterSlot.title} (
                {new Date(req.requesterSlot.startTime).toLocaleString()})
              </p>
              <p>
                <strong>For Your:</strong> {req.responderSlot.title} (
                {new Date(req.responderSlot.startTime).toLocaleString()})
              </p>
              <button onClick={() => handleResponse(req._id, true)}>
                Accept
              </button>
              <button
                onClick={() => handleResponse(req._id, false)}
                style={{ marginLeft: '10px' }}
              >
                Reject
              </button>
            </div>
          ))
        ) : (
          <p>You have no pending incoming requests.</p>
        )}
      </div>

      <hr style={{ margin: '20px 0' }} />

      <h3>Outgoing Requests</h3>
      <div className="requests-list">
        {outgoingRequests.length > 0 ? (
          outgoingRequests.map((req) => (
            <div key={req._id} className="event-item">
              <h4>
                Request to: {req.responder.name}
              </h4>
              <p>
                <strong>Your Offer:</strong> {req.requesterSlot.title} (
                {new Date(req.requesterSlot.startTime).toLocaleString()})
              </p>
              <p>
                <strong>Their Slot:</strong> {req.responderSlot.title} (
                {new Date(req.responderSlot.startTime).toLocaleString()})
              </p>
              <p>
                Status: <strong>{req.status}</strong>
              </p>
            </div>
          ))
        ) : (
          <p>You have not sent any requests.</p>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;