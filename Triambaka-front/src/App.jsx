import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import UploadWatermark from "./pages/UploadWatermark"
import ProvenanceTracking from "./pages/ProvenanceTracking"
import Dashboard from "./pages/Dashboard"
import WatermarkEmbed from "./pages/WatermarkTest"
import VerifyWatermark from "./pages/VerifyWatermark"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadWatermark />} />
          <Route path="/verify" element={<VerifyWatermark />} />
          <Route path="/provenance" element={<ProvenanceTracking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test" element={<WatermarkEmbed />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

