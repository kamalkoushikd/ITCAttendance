import { useEffect, useState } from 'react';
import { fetchVendors, fetchDesignations, postData, updateData, deleteData } from '../api/api';
import { motion } from 'framer-motion';
import { UserLock } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddDesignation() {
    const [designations, setDesignations] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [form, setForm] = useState({ designation: '', vendor_name: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ open: boolean, designation: any | null }>({ open: false, designation: null });

    useEffect(() => {
        const fetchAll = async () => {
            setVendors(await fetchVendors());
            await refreshDesignations();
        };
        fetchAll();
    }, []);

    const refreshDesignations = async (vendor_name?: string) => {
        setIsLoading(true);
        const data = await fetchDesignations(vendor_name);
        setDesignations(data);
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'vendor_name') refreshDesignations(value);
    };

    const handleEdit = (d: any) => {
        setForm({ designation: d.designation, vendor_name: d.vendor_name });
        setEditMode(true);
        setEditId(d.designation_id);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditId(null);
        setForm({ designation: '', vendor_name: '' });
    };

    const handleDelete = (designation: any) => {
        setShowConfirm({ open: true, designation });
    };

    const confirmDelete = async () => {
        if (showConfirm.designation) {
            try {
                await deleteData('designations', showConfirm.designation.designation_id);
                await refreshDesignations(form.vendor_name);
                toast.success('Designation deleted successfully');
            } catch {
                toast.error('Failed to delete designation');
            }
        }
        setShowConfirm({ open: false, designation: null });
    };

    const cancelDelete = () => {
        setShowConfirm({ open: false, designation: null });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && editId !== null) {
                await updateData('designations', editId, form);
                toast.success('Designation updated successfully');
            } else {
                await postData('designations', form);
                toast.success('Designation added successfully');
            }
            setForm({ designation: '', vendor_name: '' });
            setEditMode(false);
            setEditId(null);
            await refreshDesignations(form.vendor_name);
        } catch (err) {
            toast.error(editMode ? 'Error updating designation' : 'Error adding designation');
        }
    };

    return (
        <motion.div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2 className="text-3xl font-bold text-gray-900 text-center mb-8"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                Designation Management
            </motion.h2>
            <div className="mb-8">
                <motion.div className="bg-white shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                        <UserLock className="h-6 w-6 text-slate-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Add New Designation</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-6">
                        <div className="relative">
                            <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <select
                                name="vendor_name"
                                id="vendor_name"
                                required
                                value={form.vendor_name}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition appearance-none cursor-pointer pr-10 align-middle"
                            >
                                <option value="">Select Vendor</option>
                                {vendors.map((v: any) => (
                                    <option key={v.vendor_name} value={v.vendor_name}>{v.vendor_name}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <div>
                            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                            <input
                                type="text"
                                name="designation"
                                id="designation"
                                placeholder="Designation"
                                required
                                value={form.designation}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-slate-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                            >
                                {editMode ? 'Update Designation' : 'Add Designation'}
                            </button>
                            {editMode && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="w-full mt-2 py-4 px-6 rounded-xl font-bold text-xl bg-gray-300 hover:bg-gray-400 text-gray-800 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
            <motion.div className="bg-white shadow-xl rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">All Designations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                                <th className="py-4 px-6 text-lg font-bold text-gray-700">Designation</th>
                                <th className="py-4 px-6 text-lg font-bold text-gray-700">Vendor</th>
                                <th className="py-4 px-6 text-lg font-bold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-gray-500 text-lg">Loading designations...</td>
                                </tr>
                            ) : designations.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-gray-500 text-lg">No designations found</td>
                                </tr>
                            ) : designations.map((d) => (
                                <tr key={d.designation_id} className="border-b last:border-b-0 hover:bg-slate-50 transition">
                                    <td className="py-4 px-6 font-medium">{d.designation}</td>
                                    <td className="py-4 px-6">{d.vendor_name}</td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Edit</button>
                                        <button onClick={() => handleDelete(d)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
            {showConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h2>
                        <p className="mb-6 text-gray-700">Are you sure you want to delete designation <span className="font-bold">{showConfirm.designation?.designation}</span>?</p>
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
