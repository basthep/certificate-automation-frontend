import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateAutomation from "./pages/CreateAutomation";
import TemplateUpload from "./pages/TemplateUpload";
import TemplateEditor from "./pages/TemplateEditor";
import DataUpload from "./pages/DataUpload";
import Mapping from "./pages/Mapping";
import Preview from "./pages/Preview";
import GenerateCertificates from "./pages/GenerateCertificates";
import Automations from "./pages/Automations";
import AutomationDetail from "./pages/AutomationDetail";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route element={<ProtectedRoute />}>


        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/automations" element={<Automations />} />

        <Route
          path="/automations/:automationId"
          element={<AutomationDetail />}
        />

        <Route
          path="/automations/create"
          element={<CreateAutomation />}
        />  

        <Route
          path="/automations/:automationId/template"
          element={<TemplateUpload />}
        />

        <Route
          path="/templates/:templateId/editor"
          element={<TemplateEditor />}
        />

        <Route
          path="/automations/:automationId/data"
          element={<DataUpload />}
        />

        <Route
          path="/automations/:automationId/mapping"
          element={<Mapping />}
        />

        <Route
          path="/automations/:automationId/preview"
          element={<Preview />}
        />

        <Route
          path="/automations/:automationId/generate"
          element={<GenerateCertificates />}
        />


      </Route>
    </Routes>
  );
}

export default App;