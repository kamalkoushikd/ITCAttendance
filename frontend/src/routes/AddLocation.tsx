import { useEffect, useState } from 'react';
import { fetchLocations, postData, updateData, deleteData } from '../api/api';
import { MapPin } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddLocation() {
    useAuthTokenSync();

    const [form, setForm] = useState({ location: '', state: '' });
    const [locations, setLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editLocation, setEditLocation] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ open: boolean, location: any | null }>({ open: false, location: null });

    useEffect(() => {
        const getLocations = async () => {
            try {
                setIsLoading(true);
                const data = await fetchLocations();
                setLocations(data);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getLocations();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (loc: any) => {
        setForm({ location: loc.location, state: loc.state });
        setEditMode(true);
        setEditLocation(loc.location);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditLocation(null);
        setForm({ location: '', state: '' });
    };

    const handleDelete = (location: any) => {
        setShowConfirm({ open: true, location });
    };

    const confirmDelete = async () => {
        if (showConfirm.location) {
            try {
                await deleteData('locations', showConfirm.location.location);
                setLocations(await fetchLocations());
                toast.success('Location deleted successfully');
            } catch {
                toast.error('Failed to delete location');
            }
        }
        setShowConfirm({ open: false, location: null });
    };

    const cancelDelete = () => {
        setShowConfirm({ open: false, location: null });
    };

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && editLocation) {
                await updateData('locations', editLocation, form);
            } else {
                await postData('locations', form);
            }
            setForm({ location: '', state: '' });
            setEditMode(false);
            setEditLocation(null);
            setLocations(await fetchLocations());
        } catch (err) {
            alert(editMode ? 'Error updating location' : 'Error adding location');
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
                Location Management
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
                                <MapPin className="h-6 w-6 text-red-500" />
                                <h3 className="text-xl font-semibold text-gray-900">Add New Location</h3>
                            </div>
                        </div>
                        <form onSubmit={handleSubmitWrapper} className="px-4 sm:px-6 py-5 space-y-6">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    placeholder="Location Name"
                                    required
                                    value={form.location}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-red-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    id="state"
                                    placeholder="State"
                                    required
                                    value={form.state}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-red-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                                >
                                    {editMode ? 'Update Location' : 'Add Location'}
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
                        <h3 className="text-xl font-semibold text-gray-900">All Locations</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                            <thead>
                                <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Location</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">State</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-500 text-lg">Loading locations...</td>
                                    </tr>
                                ) : locations.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-500 text-lg">No locations found</td>
                                    </tr>
                                ) : locations.map((l) => (
                                    <tr key={l.location} className="border-b last:border-b-0 hover:bg-red-50 transition">
                                        <td className="py-4 px-6 font-medium">{l.location}</td>
                                        <td className="py-4 px-6">{l.state}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleEdit(l)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Edit</button>
                                            <button onClick={() => handleDelete(l)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
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
                        <p className="mb-6 text-gray-700">Are you sure you want to delete location <span className="font-bold">{showConfirm.location?.location}</span>?</p>
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
