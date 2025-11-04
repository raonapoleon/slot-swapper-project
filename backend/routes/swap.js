const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const SwapRequest = require('../models/SwapRequest');
const Event = require('../models/Event');

router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      owner: { $ne: req.user.id },
    }).populate('owner', ['name', 'email']);

    res.json(swappableSlots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/my-requests', auth, async (req, res) => {
  try {
    const myRequests = await SwapRequest.find({
      $or: [{ requester: req.user.id }, { responder: req.user.id }],
    })
      .populate('requester', ['name', 'email'])
      .populate('responder', ['name', 'email'])
      .populate('requesterSlot')
      .populate('responderSlot')
      .sort({ createdAt: -1 });

    res.json(myRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/request', auth, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;

  try {
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ msg: 'Slot not found' });
    }

    if (
      mySlot.owner.toString() !== req.user.id ||
      theirSlot.owner.toString() === req.user.id
    ) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      return res
        .status(400)
        .json({ msg: 'One or more slots are not swappable' });
    }

    const newSwapRequest = new SwapRequest({
      requester: req.user.id,
      responder: theirSlot.owner,
      requesterSlot: mySlotId,
      responderSlot: theirSlotId,
    });

    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';

    await newSwapRequest.save();
    await mySlot.save();
    await theirSlot.save();

    res.json(newSwapRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/response/:requestId', auth, async (req, res) => {
  const { acceptance } = req.body;
  const { requestId } = req.params;

  try {
    const swapRequest = await SwapRequest.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ msg: 'Swap request not found' });
    }

    if (swapRequest.responder.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ msg: 'This request has already been handled' });
    }

    const requesterSlot = await Event.findById(swapRequest.requesterSlot);
    const responderSlot = await Event.findById(swapRequest.responderSlot);

    if (!requesterSlot || !responderSlot) {
      return res.status(404).json({ msg: 'One or more slots not found' });
    }

    if (acceptance === true) {
      swapRequest.status = 'ACCEPTED';
      
      const requesterId = requesterSlot.owner;
      const responderId = responderSlot.owner;

      requesterSlot.owner = responderId;
      responderSlot.owner = requesterId;

      requesterSlot.status = 'BUSY';
      responderSlot.status = 'BUSY';

      await requesterSlot.save();
      await responderSlot.save();
      
    } else {
      swapRequest.status = 'REJECTED';
      requesterSlot.status = 'SWAPPABLE';
      responderSlot.status = 'SWAPPABLE';

      await requesterSlot.save();
      await responderSlot.save();
    }

    await swapRequest.save();
    res.json(swapRequest);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;