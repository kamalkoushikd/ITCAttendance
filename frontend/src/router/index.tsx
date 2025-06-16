import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AddEmployee from '../routes/AddEmployee';
import AddVendor from '../routes/AddVendor';
import AddApprover from '../routes/AddApprover';
import AddLocation from '../routes/AddLocation';
import AddBillingCycleRule from '../routes/AddBillingCycleRule';
import Home from '../routes/Home';
import Login from '../routes/Login';

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
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/add-employee" element={<PageTransition><AddEmployee /></PageTransition>} />
                <Route path="/add-vendor" element={<PageTransition><AddVendor /></PageTransition>} />
                <Route path="/add-approver" element={<PageTransition><AddApprover /></PageTransition>} />
                <Route path="/add-location" element={<PageTransition><AddLocation /></PageTransition>} />
                <Route path="/add-billing-cycle-rule" element={<PageTransition><AddBillingCycleRule /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
}
