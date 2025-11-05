import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarketplacePage = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [myOfferSlotId, setMyOfferSlotId] = useState('');

  const fetchSwappableSlots = async () => {
    try {
      const res = await axios.get('/api/swap/swappable-slots');
      setSwappableSlots(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
      const res = await axios.get('/api/events/mine');
      setMySwappableSlots(
        res.data.filter((event) => event.status === 'SWAPPABLE')
      );
    } catch (err) {
      console.error(err.response.data);
    }
  };

  useEffect(() => {
    fetchSwappableSlots();
    fetchMySwappableSlots();
  }, []);

  const handleRequestSwap = (slot) => {
    setSelectedTheirSlot(slot);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTheirSlot(null);
    setMyOfferSlotId('');
  };

  const handleConfirmSwap = async () => {
    if (!myOfferSlotId) {
      alert('Please select one of your slots to offer.');
      return;
    }

    try {
      await axios.post('/api/swap/request', {
        mySlotId: myOfferSlotId,
        theirSlotId: selectedTheirSlot._id,
      });
      alert('Swap request sent!');
      handleModalClose();
      fetchSwappableSlots(); 
      fetchMySwappableSlots();
    } catch (err) {
      console.error(err.response.data);
      alert('Failed to send swap request.');
    }
  };

  const renderModal = () => {
    if (!isModalOpen || !selectedTheirSlot) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Request a Swap</h3>
          <p>
            You are requesting to swap for:{' '}
            <strong>{selectedTheirSlot.title}</strong>
          </p>
          <p>
            Owned by: <strong>{selectedTheirSlot.owner.name}</strong>
          </p>
          <hr />
          <p>Select one of your swappable slots to offer:</p>
          {mySwappableSlots.length > 0 ? (
            <div>
              <select
                value={myOfferSlotId}
                onChange={(e) => setMyOfferSlotId(e.target.value)}
              >
                <option value="" disabled>
                  Choose your slot...
                </option>
                {mySwappableSlots.map((slot) => (
                  <option key={slot._id} value={slot._id}>
                    {slot.title} ({new Date(slot.startTime).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p>You have no swappable slots to offer.</p>
          )}

          <br />
          <button
            onClick={handleConfirmSwap}
            disabled={!myOfferSlotId || mySwappableSlots.length === 0}
          >
            Confirm & Send Request
          </button>
          <button onClick={handleModalClose} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Marketplace</h2>
      <p>Here are all the slots available for swapping.</p>
      <div className="event-list">
        {swappableSlots.length > 0 ? (
          swappableSlots.map((slot) => (
            <div key={slot._id} className="event-item">
              <h4>{slot.title}</h4>
              <p>
                Owner: <strong>{slot.owner.name}</strong>
              </p>
              <p>
                From: {new Date(slot.startTime).toLocaleString()}
                <br />
                To: {new Date(slot.endTime).toLocaleString()}
              </p>
              <button onClick={() => handleRequestSwap(slot)}>
                Request Swap
              </button>
            </div>
          ))
        ) : (
          <p>No swappable slots available right now.</p>
        )}
      </div>

      {renderModal()}
    </div>
  );
};

export default MarketplacePage;