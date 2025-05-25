import { PatientForm } from './components/PatientForm';
import { SqlConsole } from './components/SqlConsole';

function App() {
  return (
    <div className="App">
      <h1>Patient Registration System</h1>
      <PatientForm />
      <SqlConsole />
    </div>
  );
}

export default App;
