import { PatientForm } from './components/PatientForm';
import { SqlConsole } from './components/SqlConsole';
import { PatientList } from './components/PatientList';

function App() {
  return (
    <div className="App">
      <h1>Patient Registration System</h1>
      <PatientForm />
      <PatientList />
      <SqlConsole />
    </div>
  );
}

export default App;
