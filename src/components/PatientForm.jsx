import React, { useState } from 'react';
import { db } from '../database/pg-instance';

export function PatientForm({ onAdd }) {
    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: '',
        dob: '',
        remarks: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, address, phone, dob, remarks } = form;

        try {
            await db.query(
                `INSERT INTO patients (name, address, phone, dob, remarks) VALUES ($1, $2, $3, $4, $5)`,
                [name, address, phone, dob, remarks]
            );
            setForm({ name: '', address: '', phone: '', dob: '', remarks: '' });
            if (onAdd) onAdd();
        } catch (error) {
            console.error('Failed to add patient', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="patient-form">
            <h2>Register New Patient</h2>
            <div>
                <label>Full Name:</label>
                <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Address:</label>
                <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Phone:</label>
                <input
                    name="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., 9876543210"
                />
            </div>
            <div>
                <label>Date of Birth:</label>
                <input
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Remarks:</label>
                <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                />
            </div>
            <button type="submit">Add Patient</button>
        </form>
    );
}
