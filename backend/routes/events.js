const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Event = require('../models/Event');
const User = require('../models/User');

router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('startTime', 'Start time is required').isISO8601(),
      check('endTime', 'End time is required').isISO8601(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, startTime, endTime } = req.body;

    try {
      const newEvent = new Event({
        title,
        startTime,
        endTime,
        owner: req.user.id,
      });

      const event = await newEvent.save();
      res.json(event);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.get('/mine', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({
      startTime: 1,
    });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, startTime, endTime, status } = req.body;

  const eventFields = {};
  if (title) eventFields.title = title;
  if (startTime) eventFields.startTime = startTime;
  if (endTime) eventFields.endTime = endTime;
  if (status) eventFields.status = status;

  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    );

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Event.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;