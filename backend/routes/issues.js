const router = require('express').Router();
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

// Helper function to escape special characters for MongoDB Regex
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// Apply auth middleware to all routes in this file
router.use(auth);

// POST /api/issues - Create a new issue
router.post('/', async (req, res) => {
  try {
    const { title, description, severity, status } = req.body;
    const issue = new Issue({
      title,
      description,
      severity,
      status,
      createdBy: req.user.id // Extracted from the JWT token
    });
    
    const savedIssue = await issue.save();
    res.status(201).json(savedIssue);
  } catch (error) {
    // Catches validation errors (like missing title)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/issues - Get all issues (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, severity, q } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (q) {
      // Escape the search string to prevent regex crashes
      const safeQ = escapeRegex(q);
      filter.$or = [
        { title: { $regex: safeQ, $options: 'i' } },
        { description: { $regex: safeQ, $options: 'i' } }
      ];
    }

    // Populate replaces the createdBy ID with the actual user's email
    const issues = await Issue.find(filter)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
      
    res.json(issues);
  } catch (error) {
    console.error('GET / error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const rows = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = { 'Open': 0, 'In Progress': 0, 'Closed': 0 };
    rows.forEach(r => { stats[r._id] = r.count; });

    res.json(stats);
  } catch (error) {
    console.error('GET /stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/issues/:id - Get a single issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('createdBy', 'email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    // Catches invalid Mongo IDs like "abc"
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format' });
    }
    console.error('GET /:id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/issues/:id - Update an issue
router.put('/:id', async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } 
    );
    if (!updatedIssue) return res.status(404).json({ message: 'Issue not found' });
    res.json(updatedIssue);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid issue ID format' });
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/issues/:id - Delete an issue
router.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid issue ID format' });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;