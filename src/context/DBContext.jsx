import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { db as pgliteDbInstance } from '../database/pg-instance';

const DBContext = createContext(null);

export const useDB = () => useContext(DBContext);

export const DBProvider = ({ children }) => {
    const [dbReady, setDbReady] = useState(false);
    const [dbStatus, setDbStatus] = useState('Initializing DB...');
    const [dbStatusColorClass, setDbStatusColorClass] = useState('db-status-yellow');

    const dbInitializationPromiseRef = useRef(null);

    useEffect(() => {
        console.groupCollapsed('DBContext: Initialization Cycle');
        console.log('DBContext: useEffect triggered.');

        if (!dbInitializationPromiseRef.current) {
            setDbStatus('Initializing DB...');
            setDbStatusColorClass('db-status-yellow animate-pulse');
            console.log('DBContext: Starting PGliteWorker initialization...');

            dbInitializationPromiseRef.current = (async () => {
                try {
                    console.log('DBContext: Performing initial dummy query to ensure worker readiness...');
                    await pgliteDbInstance.query('SELECT 1;');
                    console.log('DBContext: PGliteWorker responded. Database connection established.');

                    console.log('DBContext: Checking/creating patients table schema...');
                    await pgliteDbInstance.query(`
                        CREATE TABLE IF NOT EXISTS patients (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL,
                            address TEXT,
                            phone TEXT UNIQUE NOT NULL,
                            dob TEXT NOT NULL,
                            remarks TEXT
                        );
                    `);
                    console.log('DBContext: Patients table schema verified successfully.');

                    setDbReady(true);
                    setDbStatus('DB Ready');
                    setDbStatusColorClass('db-status-green');
                    console.log('DBContext: DB is fully ready and schema is set.');

                } catch (error) {
                    console.error('DBContext: Critical error during DB initialization or schema creation:', error);
                    setDbStatus(`DB Error: ${error.message}`);
                    setDbStatusColorClass('db-status-red');
                    setDbReady(false);
                } finally {
                    console.log('DBContext: PGliteWorker initialization sequence finished.');
                    console.groupEnd();
                }
            })();
        } else {
            console.log('DBContext: DB initialization already in progress or completed. Reusing existing promise.');
            console.groupEnd();
        }
    }, []);

    const contextValue = useMemo(() => {
        return { db: pgliteDbInstance, dbReady, dbStatus, dbStatusColorClass };
    }, [dbReady, dbStatus, dbStatusColorClass]);

    return (
        <DBContext.Provider value={contextValue}>
            {children}
        </DBContext.Provider>
    );
};