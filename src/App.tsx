import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { SelectionPage } from './pages/SelectionPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';



export default function App() {
  return (
    <Router>
      <Routes>
        {/* Viewer page is standalone (no navbar) */}
       
        
        {/* Other pages use the common layout */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
        
                <Route path="/upload/:projectId" element={<UploadPage />} />
                <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
                <Route path="/selection/:projectId" element={<SelectionPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
