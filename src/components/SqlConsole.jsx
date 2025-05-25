import React, { useState, useEffect } from 'react';
import { db } from '../database/pg-instance';
import StatusMessage from './StatusMessage';
import { useDB } from '../context/DBContext';

export function SqlConsole({ dbReady }) {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const { broadcastChannel } = useDB();

  const isDMLQuery = (sql) => {
    const trimmedSql = sql.trim().toUpperCase();
    return trimmedSql.startsWith('INSERT') ||
      trimmedSql.startsWith('UPDATE') ||
      trimmedSql.startsWith('DELETE') ||
      trimmedSql.startsWith('TRUNCATE');
  };

  const runQuery = async () => {
    console.log('SqlConsole: runQuery initiated.');
    if (!dbReady) {
      setStatusMessage({ message: 'Database not ready. Please wait.', isError: true });
      console.error('SqlConsole: DB not ready for query execution.');
      return;
    }
    if (!query.trim()) {
      setStatusMessage({ message: 'SQL query cannot be empty.', isError: true });
      return;
    }

    setLoading(true);
    setOutput('');
    setStatusMessage(null);

    try {
      console.log('SqlConsole: Sending query to PGlite...');
      const result = await db.query(query);
      console.log('SqlConsole: PGlite query successful. Result:', result);

      if (result.rows && result.rows.length > 0) {
        setOutput(JSON.stringify(result.rows, null, 2));
        setStatusMessage({ message: `Query executed successfully. ${result.rows.length} rows returned.`, isError: false });
      } else if (result.command) {
        setOutput(`Command executed: ${result.command}. Rows affected: ${result.rowCount || 0}`);
        setStatusMessage({ message: `Command executed: ${result.command}. ${result.rowCount || 0} rows affected.`, isError: false });
      } else {
        setOutput('Query executed, but no rows returned or no specific command reported.');
        setStatusMessage({ message: 'Query executed, no rows returned.', isError: false });
      }

      if (isDMLQuery(query) && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'data_updated', sourceTab: 'sql_console' });
        console.log('SqlConsole: Sent data_updated broadcast for DML.');
      }

    } catch (e) {
      console.error('SqlConsole: Error executing SQL query:', e);
      setOutput(`Error: ${e.message}`);
      setStatusMessage({ message: `Error: ${e.message}`, isError: true });
    } finally {
      setLoading(false);
      console.log('SqlConsole: runQuery finished.');
    }
  };

  useEffect(() => {
    if (dbReady) {
      console.log('SqlConsole: DB is ready.');
    }
  }, [dbReady]);

  return (
    <section className="section-card">
      <h2 className="section-title">SQL Console</h2>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter your SQL query here (e.g., SELECT * FROM patients;)..."
        rows={6}
        className="form-textarea"
      />
      <br />
      <button onClick={runQuery}
        className="btn btn-green"
        disabled={loading || !dbReady}>
        {loading ? 'Running...' : 'Run Query'}
      </button>
      <StatusMessage {...statusMessage} onClear={() => setStatusMessage(null)} />
      <h3 className="section-title" style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Output:</h3>
      {loading && <div className="loader"></div>} {/* Loader */}
      <pre className="sql-results-container output">{output}</pre>
    </section>
  );
}