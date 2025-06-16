import { useEffect, useState } from 'react';
import { fetchApprovers } from '../api/api';
import { UserCheck } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { postData } from '../api/api';


export default function AddApprover() {
    useAuthTokenSync();

    const [approvers, setApprovers] = useState<any[]>([]);
    const [form, setForm] = useState({
        emp_id: '',
        name: '',
        email: '',
        password: '',
        manager_emp_id: '',
        manager_name: '',
        manager_email: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getApprovers = async () => {
            try {
                setIsLoading(true);
                const data = await fetchApprovers();
                setApprovers(data);
            } catch (error) {
                console.error('Failed to fetch approvers:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getApprovers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postData('approvers', form);
            setForm({
                emp_id: '',
                name: '',
                email: '',
                password: '',
                manager_emp_id: '',
                manager_name: '',
                manager_email: ''
            });
            const updatedApprovers = await fetchApprovers();
            setApprovers(updatedApprovers);
        } catch (err) {
            alert('Error adding approver');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Approver Management</h2>
            <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">All Approvers</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Emp ID', 'Name', 'Email', 'Manager Emp ID', 'Manager Name', 'Manager Email'].map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading approvers...</td>
                                </tr>
                            ) : approvers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No approvers found</td>
                                </tr>
                            ) : approvers.map((a) => (
                                <tr key={a.emp_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.emp_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.manager_emp_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.manager_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.manager_email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-3xl mx-auto">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <UserCheck className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Add New Approver</h3>
                    </div>
                </div>
                <form onSubmit={handleSubmitWrapper} className="px-4 sm:px-6 py-5 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                            <input
                                type="text"
                                name="emp_id"
                                placeholder="Employee ID"
                                required
                                value={form.emp_id}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-purple-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-purple-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-purple-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="manager_emp_id"
                                placeholder="Manager Employee ID"
                                required
                                value={form.manager_emp_id}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-purple-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="manager_name"
                                placeholder="Manager Name"
                                required
                                value={form.manager_name}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-purple-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="manager_email"
                                placeholder="Manager Email"
                                required
                                value={form.manager_email}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-purple-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
                        >
                            Add Approver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
