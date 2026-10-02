import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, createUser, updateUser, deleteUser } from "../services/api";

const emptyForm = {
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "Teacher",
};

function Users() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const navigate = useNavigate();

    const loadUsers = () => {
        setLoading(true);
        getUsers()
            .then((data) => setUsers(data))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const openCreateModal = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setForm({
            username: user.username,
            password: "",
            full_name: user.full_name,
            email: user.email,
            role: user.role,
        });
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFormError("");

        try {

            if (editingUser) {

                const payload = { ...form };
                if (!payload.password) {
                    delete payload.password;
                }

                await updateUser(editingUser.user_id, payload);

            } else {

                await createUser(form);
            }

            setShowModal(false);
            loadUsers();

        } catch (error) {

            setFormError(error.message);

        } finally {

            setSaving(false);
        }
    };

    const handleDelete = async (user) => {

        const confirmed = window.confirm(`Delete ${user.full_name}? This cannot be undone.`);

        if (!confirmed) {
            return;
        }

        try {
            await deleteUser(user.user_id);
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Users</h1>
                    <p>{users.length} account{users.length !== 1 ? "s" : ""}</p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="page-action-button" onClick={openCreateModal}>
                        Add User
                    </button>
                    <button className="back-button" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>

            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-card">

                {loading ? (
                    <div className="state-message">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="state-message">No users found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.user_id}>
                                    <td>{user.username}</td>
                                    <td>{user.full_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <div className="row-actions">
                                            <button
                                                className="row-action-button"
                                                onClick={() => openEditModal(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="row-action-button danger"
                                                onClick={() => handleDelete(user)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(event) => event.stopPropagation()}>

                        <h2>{editingUser ? "Edit User" : "Add User"}</h2>

                        {formError && <div className="error-message">{formError}</div>}

                        <form onSubmit={handleSave}>

                            <div className="modal-field">
                                <label>Username</label>
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="modal-field">
                                <label>
                                    Password {editingUser && "(leave blank to keep unchanged)"}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required={!editingUser}
                                />
                            </div>

                            <div className="modal-field">
                                <label>Full Name</label>
                                <input
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="modal-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="modal-field">
                                <label>Role</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Principal">Principal</option>
                                    <option value="Student">Student</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="modal-cancel-button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="page-action-button" disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Users;