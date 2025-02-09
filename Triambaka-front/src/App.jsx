import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import UploadWatermark from "./pages/UploadWatermark"
import Verification from "./pages/Verification"
import ProvenanceTracking from "./pages/ProvenanceTracking"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadWatermark />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/provenance" element={<ProvenanceTracking />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

