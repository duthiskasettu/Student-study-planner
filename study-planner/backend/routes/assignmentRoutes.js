const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Assuming you have a db.js for database connection

// GET all assignments
router.get('/', async (req, res) => {
    try {
        // Order by deadline and status for better display
        const [assignments] = await db.query('SELECT * FROM assignments ORDER BY deadline ASC, status ASC');
        res.json(assignments);
    } catch (err) {
        console.error('Database Error - GET /api/assignments:', err.message);
        res.status(500).json({ message: 'Failed to retrieve tasks from the database.' });
    }
});

// POST a new assignment
router.post('/', async (req, res) => {
    const { title, subject, assignmentName, deadline, priority } = req.body;
    // Basic validation
    if (!subject || !assignmentName || !deadline) {
        return res.status(400).json({ message: 'Subject, Task Name, and Deadline are required.' });
    }

    const status = 'Pending'; // Default status

        try {
        const [result] = await db.query(
            'INSERT INTO assignments (title, subject, assignmentName, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title || '', subject, assignmentName, deadline, priority || 'Medium', status]
        );
        // Fetch the newly created assignment to return its full details
        const [newAssignment] = await db.query('SELECT * FROM assignments WHERE id = ?', [result.insertId]);
        res.status(201).json(newAssignment[0]);
    } catch (err) {
        console.error('Database Error - POST /api/assignments:', err.message);
        res.status(500).json({ message: 'Failed to add task to the database.' });
    }
});

// PUT (update) an assignment
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value provided.' });
    }

    try {
        // Check if assignment exists first
        const [existingAssignment] = await db.query('SELECT * FROM assignments WHERE id = ?', [id]);
        if (existingAssignment.length === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Only update if status is provided
        if (status) {
             const [result] = await db.query('UPDATE assignments SET status = ? WHERE id = ?', [status, id]);
             if (result.affectedRows === 0) {
                 // This case should ideally not happen if we checked existence above, but good for safety.
                 return res.status(404).json({ message: 'Task not found or no changes made.' });
             }
        } else {
             return res.status(400).json({ message: 'No update fields provided.' });
        }

        // Fetch the updated assignment to return its full details
        const [updatedAssignment] = await db.query('SELECT * FROM assignments WHERE id = ?', [id]);
        res.json(updatedAssignment[0]);
    } catch (err) {
        console.error(`Database Error - PUT /api/assignments/${id}:`, err.message);
        res.status(500).json({ message: 'Failed to update task in the database.' });
    }
});

// DELETE an assignment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM assignments WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.status(204).send(); // No content to send back, standard for successful DELETE
    } catch (err) {
        console.error(`Database Error - DELETE /api/assignments/${id}:`, err.message);
        res.status(500).json({ message: 'Failed to delete task from the database.' });
    }
});

module.exports = router;