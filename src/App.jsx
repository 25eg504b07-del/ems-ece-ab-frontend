import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:8080/api/employees';

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: '',
    department: '',
    salary: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  async function loadEmployees() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error();
      setEmployees(await response.json());
    } catch {
      setMessage('Cannot connect to backend. Check that Spring Boot is running.');
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const employee = {
      name: form.name.trim(),
      department: form.department.trim(),
      salary: Number(form.salary)
    };

    try {
        const response = await fetch(
          editingId === null ? API : `${API}/${editingId}`,
          {
            method: editingId === null ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to save employee');
        }

      if (!response.ok) throw new Error();

      setForm({ name: '', department: '', salary: '' });
      setEditingId(null);
      setMessage('Employee saved successfully!');
      await loadEmployees();
    } catch {
      setMessage('Could not save employee. Check the backend.');
    }
  }

  function editEmployee(employee) {
    setForm({
      name: employee.name,
      department: employee.department || '',
      salary: String(employee.salary ?? '')
    });
    setEditingId(employee.employeeId);
    setMessage('');
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setMessage('Employee deleted successfully.');
      await loadEmployees();
    } catch {
      setMessage('Could not delete employee.');
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: '', department: '', salary: '' });
    setMessage('');
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">EMPLOYEE PORTAL</p>
        <h1>Employee Management System</h1>
        <p>Manage employee details in one place.</p>
      </header>

      <section className="panel">
        <h2>{editingId === null ? 'Add New Employee' : 'Edit Employee'}</h2>

        <form onSubmit={handleSubmit} className="employee-form">
          <label>
            Employee Name
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Enter full name" maxLength="100" required />
          </label>

          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange}
              placeholder="e.g. IT, HR" maxLength="50" />
          </label>

          <label>
            Salary
            <input name="salary" type="number" value={form.salary}
              onChange={handleChange} placeholder="Enter salary"
              min="0" step="0.01" required />
          </label>

          <div className="form-actions">
            <button type="submit">
              {editingId === null ? 'Add Employee' : 'Save Changes'}
            </button>
            {editingId !== null && (
              <button type="button" className="secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p role="status" className="message">{message}</p>}
      </section>

      <section className="panel">
        <div className="list-heading">
          <div>
            <h2>Employee Directory</h2>
            <p>{employees.length} employee(s) registered</p>
          </div>
          <button className="secondary" onClick={loadEmployees}>Refresh</button>
        </div>

        {employees.length === 0 ? (
          <p className="empty">No employees found. Add your first employee above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Department</th><th>Salary</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.employeeId}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.name}</td>
                    <td>{employee.department || '—'}</td>
                    <td>{Number(employee.salary).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</td>
                    <td className="actions">
                      <button className="secondary" onClick={() => editEmployee(employee)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => deleteEmployee(employee.employeeId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>React + Spring Boot + MySQL</footer>
    </main>
  );
}

export default App;