import { useEffect, useState } from 'react';
import { fetchLocations, postData } from '../api/api';
import { MapPin } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';

export default function AddLocation() {
    useAuthTokenSync();

    const [form, setForm] = useState({ location: '', state: '' });
    const [locations, setLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postData('locations', form);
            setForm({ location: '', state: '' });
            const updatedLocations = await fetchLocations();
            setLocations(updatedLocations);
        } catch (err) {
            alert('Error adding location');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Location Management</h2>
            <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">All Locations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">Loading locations...</td>
                                </tr>
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">No locations found</td>
                                </tr>
                            ) : locations.map((l) => (
                                <tr key={l.location} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{l.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.state}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-2xl mx-auto">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <MapPin className="h-6 w-6 text-red-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Add New Location</h3>
                    </div>
                </div>
                <form onSubmit={handleSubmitWrapper} className="px-4 sm:px-6 py-5 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <input
                                type="text"
                                name="location"
                                placeholder="Location Name"
                                required
                                value={form.location}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-red-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                required
                                value={form.state}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-red-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition placeholder-gray-400"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                        >
                            Add Location
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
