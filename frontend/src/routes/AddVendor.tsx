import { useEffect, useState } from 'react';
import { fetchVendors, postData, updateData, deleteData } from '../api/api';
import { Building2 } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';

export default function AddVendor() {
    useAuthTokenSync();

    const [vendors, setVendors] = useState<any[]>([]);
    const [form, setForm] = useState({ vendor_name: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editVendorName, setEditVendorName] = useState<string | null>(null);

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

    const handleDelete = async (vendor: any) => {
        if (window.confirm(`Delete vendor '${vendor.vendor_name}'?`)) {
            await deleteData('vendors', vendor.vendor_name);
            setVendors(await fetchVendors());
        }
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
                                    className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
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
        </motion.div>
    );
}
