const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


// ============================================================
// GET ALL STUDENTS
// GET /api/students
// Administrators/Teachers/Principals see everyone.
// A Student only sees their own record.
// ============================================================

router.get('/', async (req, res) => {

    try {

        if (req.user.role === 'Student') {

            const result = await pool.query(
                'SELECT * FROM students WHERE user_id = $1',
                [req.user.user_id]
            );

            return res.status(200).json(result.rows);
        }

        const result = await pool.query(
            'SELECT * FROM students ORDER BY student_id'
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error retrieving students:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve students'
        });
    }
});


// ============================================================
// GET ONE STUDENT
// GET /api/students/:id
// A Student can only view their own record, never another's.
// ============================================================

router.get('/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM students WHERE student_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        const student = result.rows[0];

        // Ownership check: a Student may only view their own record.
        if (req.user.role === 'Student' && student.user_id !== req.user.user_id) {

            return res.status(403).json({
                error: 'You do not have permission to view this record'
            });
        }

        res.status(200).json(student);

    } catch (error) {
        console.error('Error retrieving student:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve student'
        });
    }
});


// ============================================================
// CREATE A NEW STUDENT
// POST /api/students
// Administrator only.
// ============================================================

router.post('/', verifyRole('Administrator'), async (req, res) => {

    try {

        const {
            admission_number,
            first_name,
            last_name,
            gender,
            date_of_birth,
            class_id,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO students
            (
                admission_number,
                first_name,
                last_name,
                gender,
                date_of_birth,
                class_id,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Active'))
            RETURNING *`,
            [
                admission_number,
                first_name,
                last_name,
                gender,
                date_of_birth,
                class_id,
                status
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating student:', error.message);

        res.status(500).json({
            error: 'Failed to create student'
        });
    }
});


// ============================================================
// UPDATE A STUDENT
// PUT /api/students/:id
// Administrator or Teacher.
// ============================================================

router.put('/:id', verifyRole('Administrator', 'Teacher'), async (req, res) => {

    try {

        const { id } = req.params;

        const {
            admission_number,
            first_name,
            last_name,
            gender,
            date_of_birth,
            class_id,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE students
            SET
                admission_number = $1,
                first_name = $2,
                last_name = $3,
                gender = $4,
                date_of_birth = $5,
                class_id = $6,
                status = $7
            WHERE student_id = $8
            RETURNING *`,
            [
                admission_number,
                first_name,
                last_name,
                gender,
                date_of_birth,
                class_id,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error updating student:', error.message);

        res.status(500).json({
            error: 'Failed to update student'
        });
    }
});


// ============================================================
// DELETE A STUDENT
// DELETE /api/students/:id
// Administrator only.
// ============================================================

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM students WHERE student_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            student: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting student:', error.message);

        res.status(500).json({
            error: 'Failed to delete student'
        });
    }
});


module.exports = router;