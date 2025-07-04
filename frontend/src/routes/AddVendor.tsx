import { useEffect, useState } from 'react';
import { fetchVendors, postData, updateData, deleteData } from '../api/api';
import { Building2 } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddVendor() {
    useAuthTokenSync();

    const [vendors, setVendors] = useState<any[]>([]);
    const [form, setForm] = useState({ vendor_name: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editVendorName, setEditVendorName] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ open: boolean, vendor: any | null }>({ open: false, vendor: null });

    useEffect(() => {
        const getVendors = async () => {
            try {
                setIsLoading(true);
                const data = await fetchVendors();
                setVendors(data);
            } catch (error) {
                console.error('Failed to fetch vendors:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getVendors();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ vendor_name: e.target.value });
    };

    const handleEdit = (vendor: any) => {
        setForm({ vendor_name: vendor.vendor_name });
        setEditMode(true);
        setEditVendorName(vendor.vendor_name);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditVendorName(null);
        setForm({ vendor_name: '' });
    };

    const handleDelete = (vendor: any) => {
        setShowConfirm({ open: true, vendor });
    };

    const confirmDelete = async () => {
        if (showConfirm.vendor) {
            try {
                await deleteData('vendors', showConfirm.vendor.vendor_name);
                setVendors(await fetchVendors());
                toast.success('Vendor deleted successfully');
            } catch {
                toast.error('Failed to delete vendor');
            }
        }
        setShowConfirm({ open: false, vendor: null });
    };

    const cancelDelete = () => {
        setShowConfirm({ open: false, vendor: null });
    };

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && editVendorName) {
                await updateData('vendors', editVendorName, form);
            } else {
                await postData('vendors', form);
            }
            setForm({ vendor_name: '' });
            setEditMode(false);
            setEditVendorName(null);
            setVendors(await fetchVendors());
        } catch (err) {
            alert(editMode ? 'Error updating vendor' : 'Error adding vendor');
        }
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2
                className="text-3xl font-bold text-gray-900 text-center mb-8"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                Vendor Management
            </motion.h2>
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <motion.div
                        className="bg-white shadow-xl rounded-lg overflow-hidden"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <Building2 className="h-6 w-6 text-green-500" />
                                <h3 className="text-xl font-semibold text-gray-900">Add New Vendor</h3>
                            </div>
                        </div>
                        <form onSubmit={handleSubmitWrapper} className="px-4 sm:px-6 py-5 space-y-6">
                            <div>
                                <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                                <input
                                    type="text"
                                    name="vendor_name"
                                    id="vendor_name"
                                    placeholder="Vendor Name"
                                    required
                                    value={form.vendor_name}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-green-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-green-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                                >
                                    {editMode ? 'Update Vendor' : 'Add Vendor'}
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
                <motion.div
                    className="bg-white shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">All Vendors</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                            <thead>
                                <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Vendor Name</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={2} className="py-8 text-center text-gray-500 text-lg">Loading vendors...</td>
                                    </tr>
                                ) : vendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="py-8 text-center text-gray-500 text-lg">No vendors found</td>
                                    </tr>
                                ) : vendors.map((v) => (
                                    <tr key={v.vendor_name} className="border-b last:border-b-0 hover:bg-green-50 transition">
                                        <td className="py-4 px-6 font-medium">{v.vendor_name}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Edit</button>
                                            <button onClick={() => handleDelete(v)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
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
                        <p className="mb-6 text-gray-700">Are you sure you want to delete vendor <span className="font-bold">{showConfirm.vendor?.vendor_name}</span>?</p>
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
