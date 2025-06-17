import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './api/auth';
import Navbar from './components/Navbar';
import Home from './routes/Home';
import RequireAdmin from './components/RequireAdmin';
import Login from './routes/Login';
import AddEmployee from './routes/AddEmployee';
import AddVendor from './routes/AddVendor';
import AddApprover from './routes/AddApprover';
import AddLocation from './routes/AddLocation';
import AddBillingCycleRule from './routes/AddBillingCycleRule';
import { motion } from 'framer-motion';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <motion.main
            className="max-w-8xl mx-auto py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <RequireAdmin>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/add-employee" element={<AddEmployee />} />
                      <Route path="/add-vendor" element={<AddVendor />} />
                      <Route path="/add-approver" element={<AddApprover />} />
                      <Route path="/add-location" element={<AddLocation />} />
                      <Route path="/add-billing-cycle-rule" element={<AddBillingCycleRule />} />
                    </Routes>
                  </RequireAdmin>
                }
              />
            </Routes>
          </motion.main>
        </div>
      </Router>
    </AuthProvider>
  );
}
