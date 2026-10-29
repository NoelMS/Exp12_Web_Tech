require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

let students;

app.get('/api/students', async (req, res) => {
    try {
        const records = await students.find({}).toArray();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch students' });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { name, department } = req.body;

        if (typeof name !== 'string' || !name.trim() ||
            typeof department !== 'string' || !department.trim()) {
            return res.status(400).json({
                error: 'Name and department are required'
            });
        }

        const student = {
            name: name.trim(),
            department: department.trim()
        };

        const result = await students.insertOne(student);

        res.status(201).json({
            _id: result.insertedId,
            ...student
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to add student' });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        if (typeof name !== 'string' || !name.trim() ||
            typeof department !== 'string' || !department.trim()) {
            return res.status(400).json({
                error: 'Name and department are required'
            });
        }

        const result = await students.updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                name: name.trim(),
                department: department.trim()
            }}
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to update student' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        const result = await students.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete student' });
    }
});

async function startServer() {
    try {
        await client.connect();

        const db = client.db('CollegeDB');
        students = db.collection('Students');

        app.listen(process.env.PORT || 5000, () => {
            console.log('Backend running on port 5000');
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

startServer();
