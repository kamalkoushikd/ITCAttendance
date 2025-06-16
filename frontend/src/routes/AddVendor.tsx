import { useEffect, useState } from 'react';
import { fetchVendors, postData } from '../api/api';
import { Building2 } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';

export default function AddVendor() {
    useAuthTokenSync();

    const [vendors, setVendors] = useState<any[]>([]);
    const [form, setForm] = useState({ vendor_name: '' });
    const [isLoading, setIsLoading] = useState(true);

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

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postData('vendors', form);
            setForm({ vendor_name: '' });
            const updatedVendors = await fetchVendors();
            setVendors(updatedVendors);
        } catch (err) {
            alert('Error adding vendor');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Vendor Management</h2>
            <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">All Vendors</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor Name
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td className="px-6 py-4 text-center text-gray-500">Loading vendors...</td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 text-center text-gray-500">No vendors found</td>
                                </tr>
                            ) : vendors.map((v) => (
                                <tr key={v.vendor_name} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.vendor_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-2xl mx-auto">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-green-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Add New Vendor</h3>
                    </div>
                </div>
                <form onSubmit={handleSubmitWrapper} className="px-4 sm:px-6 py-5 space-y-6">
                    <div>
                        <input
                            type="text"
                            name="vendor_name"
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
                            Add Vendor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
