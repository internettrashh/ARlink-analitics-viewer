import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import  AnalyticsWrapper  from 'arlink-analytics/src/AnalyticsWrapper';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Analytics } from '@/components/analytics'; 

function App() {
  return (
    <Router>
       <AnalyticsWrapper processId="KgeRB6uIOmh-zFj2JUIpPvaVcY_CKBvwzpAMPWyi2pI"> 
        <Routes>
          <Route path="/" element={<Analytics />} />
          <Route path="/viewer" element={<AnalyticsDashboard />} />
        </Routes>
       </AnalyticsWrapper> 
    </Router>
  );
}

export default App;
