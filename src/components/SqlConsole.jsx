import React, { useState } from 'react';
import { db } from '../database/pg-instance';

export function SqlConsole() {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState('');

  const runQuery = async () => {
    try {
      const result = await db.query(query);
      setOutput(JSON.stringify(result.rows, null, 2));
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
  };

  return (
    <div className="sql-console">
      <h2>SQL Console</h2>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter your SQL query here..."
        rows={6}
      />
      <button onClick={runQuery}>Run Query</button>
      <pre className="output">{output}</pre>
    </div>
  );
}
