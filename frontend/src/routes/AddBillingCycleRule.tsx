import { useEffect, useState } from 'react';
import { fetchBillingCycleRules, fetchVendors, postData, updateData, deleteData } from '../api/api';
import { Calendar } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddBillingCycleRule() {
    useAuthTokenSync();

    const [rules, setRules] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [form, setForm] = useState({
        rule_id: '',
        start_day: '',
        vendor_name: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editRuleId, setEditRuleId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ open: boolean, rule: any | null }>({ open: false, rule: null });

    useEffect(() => {
        const getBillingRules = async () => {
            try {
                setIsLoading(true);
                const data = await fetchBillingCycleRules();
                setRules(data);
            } catch (error) {
                console.error('Failed to fetch billing rules:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getBillingRules();
    }, []);

    useEffect(() => {
        // Fetch vendors for dropdown
        const fetchVendorOptions = async () => {
            setVendors(await fetchVendors());
        };
        fetchVendorOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (r: any) => {
        setForm({ rule_id: r.rule_id, start_day: r.start_day, vendor_name: r.vendor_name });
        setEditMode(true);
        setEditRuleId(r.rule_id);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditRuleId(null);
        setForm({ rule_id: '', start_day: '', vendor_name: '' });
    };

    const handleDelete = (r: any) => {
        setShowConfirm({ open: true, rule: r });
    };

    const confirmDelete = async () => {
        if (showConfirm.rule) {
            try {
                await deleteData('billing-cycle-rules', showConfirm.rule.rule_id);
                setRules(await fetchBillingCycleRules());
                toast.success('Billing cycle rule deleted successfully');
            } catch {
                toast.error('Failed to delete billing cycle rule');
            }
        }
        setShowConfirm({ open: false, rule: null });
    };

    const cancelDelete = () => {
        setShowConfirm({ open: false, rule: null });
    };

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && editRuleId) {
                await updateData('billing-cycle-rules', editRuleId, form);
            } else {
                await postData('billing-cycle-rules', form);
            }
            setForm({ rule_id: '', start_day: '', vendor_name: '' });
            setEditMode(false);
            setEditRuleId(null);
            setRules(await fetchBillingCycleRules());
        } catch (err) {
            alert(editMode ? 'Error updating billing cycle rule' : 'Error adding billing cycle rule');
        }
    };
    

    return (
        <motion.div
            className="min-h-[calc(100vh-4rem)] bg-gray-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <motion.h1
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        Billing Cycle Rules
                    </motion.h1>
                </div>
                <motion.div
                    className="bg-white shadow-xl rounded-lg overflow-hidden mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-6 w-6 text-pink-500" />
                            <h3 className="text-xl font-semibold text-gray-900">Add Billing Cycle Rule</h3>
                        </div>
                    </div>
                    <form onSubmit={handleSubmitWrapper} className="px-4 sm:px-6 py-5 space-y-6">
                        <div>
                            <label htmlFor="rule_id" className="block text-sm font-medium text-gray-700 mb-1">Billing Rule ID</label>
                            <input
                                name="rule_id"
                                id="rule_id"
                                value={form.rule_id}
                                onChange={handleChange}
                                placeholder="Rule ID"
                                required
                                className="block w-full rounded-md border border-pink-300 bg-gray-50 px-3 py-2 text-gray-900 text-base shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="start_day" className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                            <input
                                name="start_day"
                                id="start_day"
                                value={form.start_day}
                                onChange={handleChange}
                                placeholder="Start day"
                                required
                                className="block w-full rounded-md border border-pink-300 bg-gray-50 px-3 py-2 text-gray-900 text-base shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <select
                                name="vendor_name"
                                id="vendor_name"
                                value={form.vendor_name}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-md border border-pink-400 bg-white px-3 py-2 text-gray-900 text-base shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                style={{ height: '44px' }} // Ensures vertical centering for chevron
                            >
                                <option value="">Select Vendor</option>
                                {vendors.map((v: any) => (
                                    <option key={v.vendor_name} value={v.vendor_name}>
                                        {v.vendor_name}
                                    </option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute top-8 right-3 flex items-center text-gray-400" style={{ pointerEvents: 'none' }}>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-lg font-bold text-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                        >
                            {editMode ? 'Update Billing Cycle Rule' : 'Add Billing Cycle Rule'}
                        </button>
                        {editMode && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-lg bg-gray-300 hover:bg-gray-400 text-gray-800 shadow transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </motion.div>
                <motion.div
                    className="bg-white shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">All Billing Cycle Rules</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                            <thead>
                                <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Rule ID</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Start Day</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Vendor Name</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500 text-lg">Loading rules...</td>
                                    </tr>
                                ) : rules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500 text-lg">No rules found</td>
                                    </tr>
                                ) : rules.map((r) => (
                                    <tr key={r.rule_id} className="border-b last:border-b-0 hover:bg-pink-50 transition">
                                        <td className="py-4 px-6 font-medium">{r.rule_id}</td>
                                        <td className="py-4 px-6">{r.start_day}</td>
                                        <td className="py-4 px-6">{r.vendor_name}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Edit</button>
                                            <button onClick={() => handleDelete(r)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
            {showConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h2>
                        <p className="mb-6 text-gray-700">Are you sure you want to delete billing cycle rule <span className="font-bold">{showConfirm.rule?.rule_id}</span>?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={cancelDelete} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                aria-label="Notification Toast"
            />
        </motion.div>
    );
}
