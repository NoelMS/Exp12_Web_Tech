import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:5000/api/students';

function App() {
    const [students, setStudents] = useState([]);
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState('');

    async function loadStudents() {
        try {
            const response = await fetch(API);
            if (!response.ok) throw new Error('Unable to load students');
            setStudents(await response.json());
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        loadStudents();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');

        try {
            const response = await fetch(
                editId ? `${API}/${editId}` : API,
                {
                    method: editId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, department })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setName('');
            setDepartment('');
            setEditId(null);
            setMessage(data.message || 'Student added successfully');
            await loadStudents();
        } catch (error) {
            setMessage(error.message || 'Request failed');
        }
    }

    function editStudent(student) {
        setEditId(student._id);
        setName(student.name);
        setDepartment(student.department);
        setMessage('');
    }

    async function deleteStudent(id) {
        if (!window.confirm('Delete this student?')) return;

        try {
            const response = await fetch(`${API}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setMessage(data.message);
            await loadStudents();
        } catch (error) {
            setMessage(error.message);
        }
    }

    return (
        <main className="container">
            <h1>Student Management System</h1>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Student Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

                <input
                    placeholder="Department"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required
                />

                <button type="submit">
                    {editId ? 'Update Student' : 'Add Student'}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setName('');
                            setDepartment('');
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {message && <p role="status">{message}</p>}

            <h2>Student Records</h2>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {students.map(student => (
                        <tr key={student._id}>
                            <td>{student.name}</td>
                            <td>{student.department}</td>
                            <td>
                                <button
                                    onClick={() => editStudent(student)}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteStudent(student._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}

export default App;
