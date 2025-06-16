import { useEffect, useState } from 'react';
import { fetchBillingCycleRules, fetchVendors, postData } from '../api/api';
import { Calendar } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';

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

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postData('billing-cycle-rules', form);
            setForm({ rule_id: '', start_day: '', vendor_name: '' });
            const updatedRules = await fetchBillingCycleRules();
            setRules(updatedRules);
        } catch (err) {
            alert('Error adding billing cycle rule');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 px-2 sm:px-4 md:px-8 py-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">All Billing Cycle Rules</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                    <thead>
                        <tr className="border-b-2 border-gray-200 text-left">
                            <th className="py-4 px-6">Rule ID</th>
                            <th className="py-4 px-6">Start Day</th>
                            <th className="py-4 px-6">Vendor Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500 text-lg">Loading rules...</td>
                            </tr>
                        ) : rules.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500 text-lg">No rules found</td>
                            </tr>
                        ) : rules.map((r) => (
                            <tr key={r.rule_id} className="border-b last:border-b-0 hover:bg-pink-50 transition">
                                <td className="py-4 px-6 font-medium">{r.rule_id}</td>
                                <td className="py-4 px-6">{r.start_day}</td>
                                <td className="py-4 px-6">{r.vendor_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <form
                onSubmit={handleSubmitWrapper}
                className="bg-white p-4 md:p-6 rounded-xl shadow max-w-md mx-auto border border-gray-200 space-y-6 text-base"
            >
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <Calendar className="text-pink-600" size={28} />
                    <h2 className="text-xl md:text-2xl font-bold">Add Billing Cycle Rule</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <input
                            name="rule_id"
                            value={form.rule_id}
                            onChange={handleChange}
                            placeholder="Rule ID"
                            required
                            className="block w-full rounded-md border border-pink-300 bg-gray-50 px-3 py-2 text-gray-900 text-base shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <input
                            name="start_day"
                            value={form.start_day}
                            onChange={handleChange}
                            placeholder="Start day"
                            required
                            className="block w-full rounded-md border border-pink-300 bg-gray-50 px-3 py-2 text-gray-900 text-base shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition placeholder-gray-400"
                        />
                    </div>
                    <div className="relative">
                        <select
                            name="vendor_name"
                            value={form.vendor_name}
                            onChange={handleChange}
                            required
                            className="block w-full rounded-md border border-pink-400 bg-white px-3 py-2 text-gray-900 text-base shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition appearance-none cursor-pointer pr-8"
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map((v: any) => (
                                <option key={v.vendor_name} value={v.vendor_name}>
                                    {v.vendor_name}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-bold text-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                >
                    Add Billing Cycle Rule
                </button>
            </form>
        </div>
    );
}
