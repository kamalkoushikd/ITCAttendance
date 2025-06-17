import { useEffect, useState } from 'react';
import { fetchLocations, postData, updateData, deleteData } from '../api/api';
import { MapPin } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';

export default function AddLocation() {
    useAuthTokenSync();

    const [form, setForm] = useState({ location: '', state: '' });
    const [locations, setLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editLocation, setEditLocation] = useState<string | null>(null);

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

    const handleDelete = async (loc: any) => {
        if (window.confirm(`Delete location '${loc.location}'?`)) {
            await deleteData('locations', loc.location);
            setLocations(await fetchLocations());
        }
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
        </motion.div>
    );
}
