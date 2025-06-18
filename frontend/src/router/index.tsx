import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AddEmployee from '../routes/AddEmployee';
import AddVendor from '../routes/AddVendor';
import AddApprover from '../routes/AddApprover';
import AddLocation from '../routes/AddLocation';
import AddBillingCycleRule from '../routes/AddBillingCycleRule';
import Home from '../routes/Home';
import Login from '../routes/Login';
import RequireAuth from '../components/RequireAuth';
import AddDesignation from '../routes/AddDesignation';
import AttendanceHome from '../routes/AttendanceHome';
import AttendanceTransactions from '../routes/AttendanceTransactions';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full py-6 px-4"
        >
            {children}
        </motion.div>
    );
};

export default function AppRouter() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/" element={<RequireAuth adminOnly={true}><PageTransition><Home /></PageTransition></RequireAuth>} />
                <Route path="/add-employee" element={<RequireAuth adminOnly={true}><PageTransition><AddEmployee /></PageTransition></RequireAuth>} />
                <Route path="/add-vendor" element={<RequireAuth adminOnly={true}><PageTransition><AddVendor /></PageTransition></RequireAuth>} />
                <Route path="/add-approver" element={<RequireAuth adminOnly={true}><PageTransition><AddApprover /></PageTransition></RequireAuth>} />
                <Route path="/add-location" element={<RequireAuth adminOnly={true}><PageTransition><AddLocation /></PageTransition></RequireAuth>} />
                <Route path="/add-billing-cycle-rule" element={<RequireAuth adminOnly={true}><PageTransition><AddBillingCycleRule /></PageTransition></RequireAuth>} />
                <Route path="/add-designation" element={<RequireAuth adminOnly={true}><AddDesignation /></RequireAuth>} />
                <Route path="/attendance-home" element={<RequireAuth><PageTransition><AttendanceHome /></PageTransition></RequireAuth>} />
                <Route path="/attendance-transactions" element={<RequireAuth><PageTransition><AttendanceTransactions /></PageTransition></RequireAuth>} />
            </Routes>
        </AnimatePresence>
    );
}
