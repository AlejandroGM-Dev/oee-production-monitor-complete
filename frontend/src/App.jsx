import { Route, Routes } from "react-router-dom";

import {
  DashboardPage,
  MachineDetailPage,
  NotFoundPage,
} from "./pages";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">IndustriaTech OEE</p>
          <h1>OEE Production Monitor</h1>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/machines/:id" element={<MachineDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;