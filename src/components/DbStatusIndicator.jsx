import React from 'react';
import { useDB } from '../context/DBContext';

const DbStatusIndicator = () => {
    const { dbStatus, dbStatusColorClass } = useDB();
    return (
        <div className={`db-status ${dbStatusColorClass}`}>
            DB Status: {dbStatus}
        </div>
    );
};

export default DbStatusIndicator;