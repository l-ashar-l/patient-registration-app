import React, { useEffect, useState } from 'react';
import { db } from '../database/pg-instance';

export function PatientList({ refresh }) {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        async function loadPatients() {
            try {
                const result = await db.query(
                    'SELECT id, name, address, phone, dob, remarks FROM patients;'
                );
                setPatients(result.rows || []);
            } catch (error) {
                console.error('Failed to load patients', error);
            }
        }
        loadPatients();
    }, [refresh]);

    return (
        <div className="patient-list">
            <h2>Patient List</h2>
            {patients.length === 0 ? (
                <p>No patients found.</p>
            ) : (
                <ul>
                    {patients.map((p) => (
                        <li key={p.id}>
                            <strong>{p.name}</strong> — {p.phone} — {p.dob} <br />
                            {p.address && <span>🏠 {p.address}</span>}<br />
                            {p.remarks && <span>📝 {p.remarks}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
