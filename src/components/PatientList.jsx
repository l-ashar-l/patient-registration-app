import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../database/pg-instance';
import StatusMessage from './StatusMessage';
import { useDB } from '../context/DBContext';

export function PatientList({ refresh, dbReady }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null);
    const { broadcastChannel } = useDB();

    const calculateAge = (dobString) => {
        if (!dobString) return 'N/A';

        const birthDate = new Date(dobString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const loadPatients = useCallback(async () => {
        console.log('PatientList: loadPatients called.');
        setLoading(true);
        setError(null);

        if (!dbReady) {
            setError('Database not ready. Please wait.');
            setLoading(false);
            console.error('PatientList: DB not ready for loading patients.');
            return;
        }

        try {
            console.log('PatientList: Querying PGlite for patients...');
            const result = await db.query(
                'SELECT id, name, address, phone, dob, remarks FROM patients ORDER BY id DESC;'
            );
            console.log(`PatientList: Fetched ${result.rows.length} patients.`, result.rows);
            setPatients(result.rows || []);
        } catch (error) {
            console.error('PatientList: Failed to load patients', error);
            setError(`Failed to load patients: ${error.message}`);
            setPatients([]);
        } finally {
            setLoading(false);
            console.log('PatientList: loadPatients finished.');
        }
    }, [dbReady]);

    const handleDeleteAll = async () => {
        console.log('PatientList: handleDeleteAll initiated.');
        if (!dbReady) {
            setDeleteStatus({ message: 'Database not ready. Please wait.', isError: true });
            console.error('PatientList: DB not ready for delete operation.');
            return;
        }

        if (!window.confirm("Are you sure you want to delete ALL patient data? This action cannot be undone.")) {
            console.log('PatientList: Delete operation cancelled by user.');
            return;
        }

        setLoading(true);
        setDeleteStatus(null);

        try {
            console.log('PatientList: Deleting all data from PGlite DB...');
            await db.query('DELETE FROM patients;');
            console.log('PatientList: All data deleted from PGlite DB successfully.');
            setPatients([]);
            setDeleteStatus({ message: 'All patient data deleted successfully!', isError: false });

            if (broadcastChannel) {
                broadcastChannel.postMessage({ type: 'data_updated', sourceTab: 'deleteAll' });
                console.log('PatientList: Sent data_updated broadcast for deleteAll.');
            }
        } catch (error) {
            console.error('PatientList: Error deleting all data:', error);
            setDeleteStatus({ message: `Error deleting data: ${error.message}`, isError: true });
        } finally {
            setLoading(false);
            console.log('PatientList: handleDeleteAll finished.');
        }
    };

    useEffect(() => {
        console.log('PatientList: useEffect triggered (refresh or dbReady change).');
        if (dbReady) {
            loadPatients();
        }
    }, [refresh, dbReady, loadPatients]);

    useEffect(() => {
        let isMounted = true;
        console.log('PatientList: BroadcastChannel useEffect triggered.');

        const handleBroadcast = (event) => {
            if (isMounted && event.data && event.data.type === 'data_updated') {
                console.log('PatientList: Received data_updated broadcast. Re-fetching data.');
                loadPatients();
            }
        };

        if (broadcastChannel) {
            console.log('PatientList: Attaching BroadcastChannel listener.');
            broadcastChannel.addEventListener('message', handleBroadcast);
        } else {
            console.log('PatientList: BroadcastChannel not available yet.');
        }

        return () => {
            isMounted = false;
            console.log('PatientList: Cleanup for BroadcastChannel useEffect triggered.');
            if (broadcastChannel) {
                broadcastChannel.removeEventListener('message', handleBroadcast);
            }
        };
    }, [broadcastChannel, loadPatients]);

    return (
        <section className="section-card">
            <h2 className="section-title">Patient List</h2>
            <div className="table-controls">
                <span className="patient-count">Total Patients: {patients.length}</span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={loadPatients}
                        className="btn btn-blue"
                        disabled={loading || !dbReady}>
                        {loading ? 'Refreshing...' : 'Refresh List'}
                    </button>
                    <button onClick={handleDeleteAll}
                        className="btn btn-red"
                        disabled={loading || !dbReady}>
                        Delete All Data
                    </button>
                </div>
            </div>
            {loading && <div className="loader"></div>}
            {error && <StatusMessage message={error} isError={true} onClear={() => setError(null)} />}
            {deleteStatus && <StatusMessage {...deleteStatus} onClear={() => setDeleteStatus(null)} />}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>DOB</th>
                            <th>Age</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length === 0 && !loading && !error ? (
                            <tr><td colSpan="7" className="table-empty-message">No patients found.</td></tr>
                        ) : (
                            patients.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.name}</td>
                                    <td>{p.address}</td>
                                    <td>{p.phone}</td>
                                    <td>{p.dob}</td>
                                    <td>{calculateAge(p.dob)}</td>
                                    <td>{p.remarks}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}