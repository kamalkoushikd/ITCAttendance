import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api/api';
import AttendanceNavbar from '../components/AttendanceNavbar';
import RequireAuth from '../components/RequireAuth';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AttendanceTransactions() {
    return (
        <RequireAuth>
            <AttendanceTransactionsContent />
        </RequireAuth>
    );
}

function AttendanceTransactionsContent() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        emp_id: '',
        approver_emp_id: '',
        month: '',
        year: '',
        vendor_name: '',
        designation: '',
        resigned: '',
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
            );
            const response = await api.get('/api/monthly-attendance', { params });
            setRecords(response.data);
        } catch (err) {
            toast.error('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchRecords();
    };

    return (
        <motion.div className="max-w-7xl mx-auto py-8 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <AttendanceNavbar />
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Attendance Transactions</h2>
            <form className="mb-6 flex flex-wrap gap-4 items-center" onSubmit={handleFilterSubmit}>
                <input type="text" placeholder="Employee ID" value={filters.emp_id} onChange={e => handleFilterChange('emp_id', e.target.value)} className="border rounded px-2 py-1" />
                <input type="text" placeholder="Approver ID" value={filters.approver_emp_id} onChange={e => handleFilterChange('approver_emp_id', e.target.value)} className="border rounded px-2 py-1" />
                <select value={filters.month} onChange={e => handleFilterChange('month', e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Month</option>
                    {months.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>
                <input type="number" placeholder="Year" value={filters.year} onChange={e => handleFilterChange('year', e.target.value)} className="border rounded px-2 py-1 w-24" />
                <input type="text" placeholder="Vendor" value={filters.vendor_name} onChange={e => handleFilterChange('vendor_name', e.target.value)} className="border rounded px-2 py-1" />
                <input type="text" placeholder="Designation" value={filters.designation} onChange={e => handleFilterChange('designation', e.target.value)} className="border rounded px-2 py-1" />
                <select value={filters.resigned} onChange={e => handleFilterChange('resigned', e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Resigned?</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700">Filter</button>
            </form>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                    <thead>
                        <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                            <th className="py-4 px-6 font-bold text-gray-700">Employee ID</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Employee Name</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Approver ID</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Month</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Year</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Vendor</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Designation</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Payable Days</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Leaves Taken</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Loss of Pay</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Resigned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={11} className="text-center py-8">Loading...</td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={11} className="text-center py-8">No records found.</td></tr>
                        ) : records.map((rec) => (
                            <tr key={rec.id || `${rec.emp_id}-${rec.month}-${rec.year}`} className="border-b last:border-b-0">
                                <td className="py-4 px-6">{rec.emp_id}</td>
                                <td className="py-4 px-6">{rec.name || '-'}</td>
                                <td className="py-4 px-6">{rec.approver_emp_id || '-'}</td>
                                <td className="py-4 px-6">{months[rec.month - 1]}</td>
                                <td className="py-4 px-6">{rec.year}</td>
                                <td className="py-4 px-6">{rec.vendor_name || '-'}</td>
                                <td className="py-4 px-6">{rec.designation || '-'}</td>
                                <td className="py-4 px-6">{rec.working_days ?? rec.payable_days ?? '-'}</td>
                                <td className="py-4 px-6">{rec.leaves_taken}</td>
                                <td className="py-4 px-6">{rec.loss_of_pay ?? '-'}</td>
                                <td className="py-4 px-6">{rec.resigned ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Notification Toast" />
        </motion.div>
    );
}
