import React, { useState, useEffect } from 'react';
import { db } from '../database/pg-instance';
import StatusMessage from './StatusMessage';
import { useDB } from '../context/DBContext';

export function PatientForm({ onAdd }) {
    const { dbReady } = useDB();

    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: '',
        dob: '',
        remarks: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (registrationStatus) {
            const timer = setTimeout(() => {
                setRegistrationStatus(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [registrationStatus]);

    const validateForm = (data) => {
        const errors = {};

        if (!data.name.trim()) {
            errors.name = 'Please add patient name to register.';
        }
        if (!data.address.trim()) {
            errors.address = 'Address is required.';
        }
        if (!data.phone.trim()) {
            errors.phone = 'Phone number is required.';
        }
        if (!data.dob.trim()) {
            errors.dob = 'Date of Birth is required.';
        }

        if (data.phone && !/^\d{10}$/.test(data.phone)) {
            errors.phone = 'Phone number must be exactly 10 digits.';
        }

        if (data.dob) {
            const dobDate = new Date(data.dob);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dobDate.setHours(0, 0, 0, 0);

            const maxAllowedDob = new Date();
            maxAllowedDob.setFullYear(today.getFullYear() - 110);
            maxAllowedDob.setHours(0, 0, 0, 0);

            if (dobDate > today) {
                errors.dob = 'Date of Birth cannot be in the future.';
            } else if (dobDate < maxAllowedDob) {
                errors.dob = 'Patient cannot be more than 110 years old.';
            }
        }
        return errors;
    };

    useEffect(() => {
        const errors = validateForm(form);
        setFormErrors(errors);
    }, [form]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('PatientForm: Submit initiated.');

        if (!dbReady) {
            setRegistrationStatus({ message: 'Database not ready. Please wait.', isError: true });
            console.error('PatientForm: DB not ready on submit.');
            return;
        }

        setIsSubmitting(true);
        setRegistrationStatus(null);

        const allFields = Object.keys(form);
        const newTouched = {};
        allFields.forEach(field => {
            newTouched[field] = true;
        });
        setTouched(newTouched);

        let currentErrors = validateForm(form);

        if (form.phone.trim() && !currentErrors.phone) {
            try {
                console.log(`PatientForm: Checking if phone number ${form.phone.trim()} already exists...`);
                const existingPhoneResult = await db.query('SELECT COUNT(*) FROM patients WHERE phone = $1;', [form.phone.trim()]);
                if (existingPhoneResult.rows[0].count > 0) {
                    currentErrors.phone = 'This phone number already exists in the database.';
                    console.warn('PatientForm: Phone number uniqueness check failed.');
                }
            } catch (dbError) {
                console.error('PatientForm: DB Error checking phone uniqueness:', dbError);
                currentErrors.phone = 'Error checking phone uniqueness.';
            }
        }

        setFormErrors(currentErrors);

        if (Object.keys(currentErrors).length > 0) {
            setIsSubmitting(false);
            console.warn('PatientForm: Form has validation errors. Preventing submission.');
            return;
        }

        setRegistrationStatus({ message: 'Registering patient...', isError: false });
        const { name, address, phone, dob, remarks } = form;

        try {
            console.log('PatientForm: Attempting to insert data into PGlite...');
            await db.query(
                `INSERT INTO patients (name, address, phone, dob, remarks) VALUES ($1, $2, $3, $4, $5)`,
                [name, address, phone, dob, remarks]
            );
            console.log('PatientForm: PGlite insertion successful.');
            setForm({ name: '', address: '', phone: '', dob: '', remarks: '' });
            setTouched({});
            setRegistrationStatus({ message: 'Patient added successfully!', isError: false });
            if (onAdd) onAdd();
        } catch (error) {
            console.error('PatientForm: Failed to add patient', error);
            setRegistrationStatus({ message: `Failed to add patient: ${error.message}`, isError: true });
        } finally {
            setIsSubmitting(false);
            console.log('PatientForm: Submit process finished.');
        }
    };

    const isFormValid = Object.keys(formErrors).length === 0;

    return (
        <section className="section-card">
            <h2 className="section-title">Register New Patient</h2>
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-field">
                    <label htmlFor="name" className="form-label">Full Name:</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`form-input ${(touched.name && formErrors.name) ? 'input-error' : ''}`}
                        autoComplete="off"
                    />
                    {touched.name && formErrors.name && <p className="error-message">{formErrors.name}</p>}
                </div>
                <div className="form-field">
                    <label htmlFor="address" className="form-label">Address:</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        value={form.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`form-input ${(touched.address && formErrors.address) ? 'input-error' : ''}`}
                        autoComplete="off"
                    />
                    {touched.address && formErrors.address && <p className="error-message">{formErrors.address}</p>}
                </div>
                <div className="form-field">
                    <label htmlFor="phone" className="form-label">Phone:</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 9876543210"
                        required
                        className={`form-input ${(touched.phone && formErrors.phone) ? 'input-error' : ''}`}
                        autoComplete="off"
                    />
                    {touched.phone && formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
                </div>
                <div className="form-field">
                    <label htmlFor="dob" className="form-label">Date of Birth:</label>
                    <input
                        id="dob"
                        name="dob"
                        type="date"
                        value={form.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`form-input ${(touched.dob && formErrors.dob) ? 'input-error' : ''}`}
                        autoComplete="off"
                    />
                    {touched.dob && formErrors.dob && <p className="error-message">{formErrors.dob}</p>}
                </div>
                <div className="form-field">
                    <label htmlFor="remarks" className="form-label">Remarks:</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="form-textarea"
                        autoComplete="off"
                    />
                </div>
                <button type="submit"
                    className="btn btn-indigo"
                    disabled={isSubmitting || !dbReady || !isFormValid}>
                    {isSubmitting ? 'Adding...' : 'Add Patient'}
                </button>
            </form>
            <StatusMessage {...registrationStatus} onClear={() => setRegistrationStatus(null)} />
        </section>
    );
}