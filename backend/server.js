const express = require('express'); // Imports Express.

const cors = require('cors'); // Allows the React frontend to communicate with Express

const studentRoutes = require('./routes/studentRoutes'); // Imports the student routes.

const academicYearRoutes = require('./routes/academicYearRoutes');

const classAssignmentRoutes = require('./routes/classAssignmentRoutes');

const classRoutes = require('./routes/classRoutes');

const authRoutes = require('./routes/authRoutes');

const teacherRoutes = require('./routes/teacherRoutes');

const subjectRoutes = require('./routes/subjectRoutes');

const termRoutes = require('./routes/termRoutes');

const principalRoutes = require('./routes/principalRoutes');

const markRoutes = require('./routes/markRoutes');

const reportRoutes = require('./routes/reportRoutes');

const reportCommentRoutes = require('./routes/reportCommentRoutes');

const userRoutes = require('./routes/userRoutes');

const app = express(); // Creates the Express application.

const PORT = 3000; // Sets the port the backend will run on.

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://aplus-preprod.netlify.app'
    ]
}));

app.use(express.json()); // Allows the backend to receive JSON data.

app.use('/api/students', studentRoutes); // Connects student routes to /api/students.

app.use('/api/academic-years', academicYearRoutes); 

app.use('/api/auth', authRoutes);

app.use('/api/class-assignments', classAssignmentRoutes);

app.use('/api/classes', classRoutes);

app.use('/api/teachers', teacherRoutes);

app.use('/api/subjects', subjectRoutes);

app.use('/api/terms', termRoutes);

app.use('/api/principals', principalRoutes);

app.use('/api/marks', markRoutes);

app.use('/api/reports', reportRoutes);

app.use('/api/report-comments', reportCommentRoutes);

app.use('/api/users', userRoutes);

app.get('/', (req, res) => { // Creates a test route for the main URL.

    res.send('Welcome to A+ Backend API'); // Sends a welcome message.

}); // Closes the main route.

app.listen(PORT, () => { // Starts the backend server.

    console.log(`A+ backend server is running on port ${PORT}`); // Confirms the server is running.

}); // Closes the server startup function.