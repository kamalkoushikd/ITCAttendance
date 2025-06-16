import { useEffect, useState } from 'react';
import { postData, fetchEmployees, fetchLocations, fetchVendors, fetchApprovers, fetchBillingCycleRules } from '../api/api';
import { Users } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';

export default function AddEmployee() {
    useAuthTokenSync();

    const [employees, setEmployees] = useState<any[]>([]);
    const [form, setForm] = useState({
        emp_id: '',
        name: '',
        gender: '',
        state: '',
        location: '',
        vendor_name: '',
        approver_emp_id: '',
        billing_rule_id: '',
        doj: '',
        resignation_date: '',
        resigned: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [locations, setLocations] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [approvers, setApprovers] = useState<any[]>([]);
    const [billingRules, setBillingRules] = useState<any[]>([]);

    useEffect(() => {
        const getEmployees = async () => {
            try {
                setIsLoading(true);
                const data = await fetchEmployees();
                setEmployees(data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getEmployees();
    }, []);

    useEffect(() => {
        // Fetch options for dropdowns
        const fetchOptions = async () => {
            setLocations(await fetchLocations());
            setVendors(await fetchVendors());
            setApprovers(await fetchApprovers());
            setBillingRules(await fetchBillingCycleRules());
        };
        fetchOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;
        if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postData('employees', form);
            setForm({
                emp_id: '',
                name: '',
                gender: '',
                state: '',
                location: '',
                vendor_name: '',
                approver_emp_id: '',
                billing_rule_id: '',
                doj: '',
                resignation_date: '',
                resigned: false
            });
            const updatedEmployees = await fetchEmployees();
            setEmployees(updatedEmployees);
        } catch (err) {
            alert('Failed to add employee');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Employee Management</h2>
            <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">All Employees</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Emp ID', 'Name', 'Gender', 'State', 'Location', 'Vendor', 'Approver', 'Billing Rule', 'DOJ', 'Resignation', 'Status'].map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-4 text-center text-gray-500">Loading employees...</td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-4 text-center text-gray-500">No employees found</td>
                                </tr>
                            ) : employees.map((emp) => (
                                <tr key={emp.emp_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.emp_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.gender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.state}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.vendor_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.approver_emp_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.billing_rule_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.doj}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.resignation_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.resigned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {emp.resigned ? 'Resigned' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
                <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Add New Employee</h3>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <input
                                type="text"
                                name="emp_id"
                                placeholder="Employee ID"
                                required
                                value={form.emp_id}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
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
                                className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div className="relative">
                            <select
                                name="gender"
                                required
                                value={form.gender}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10"
                            >
                                <option value="">Select Gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                name="location"
                                required
                                value={form.location}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10"
                            >
                                <option value="">Select Location</option>
                                {locations.map(l => (
                                    <option key={l.location} value={l.location}>{l.location}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                name="vendor_name"
                                required
                                value={form.vendor_name}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10"
                            >
                                <option value="">Select Vendor</option>
                                {vendors.map(v => (
                                    <option key={v.vendor_name} value={v.vendor_name}>{v.vendor_name}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                name="approver_emp_id"
                                required
                                value={form.approver_emp_id}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10"
                            >
                                <option value="">Select Approver</option>
                                {approvers.map(a => (
                                    <option key={a.emp_id} value={a.emp_id}>{a.name} ({a.emp_id})</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                name="billing_rule_id"
                                required
                                value={form.billing_rule_id}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10"
                            >
                                <option value="">Select Billing Rule</option>
                                {billingRules.map(r => (
                                    <option key={r.rule_id} value={r.rule_id}>{r.rule_id}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </div>
                        <div>
                            <input
                                type="date"
                                name="doj"
                                required
                                value={form.doj}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                name="resignation_date"
                                value={form.resignation_date}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="resigned"
                                checked={form.resigned}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-base text-gray-900">
                                Resigned
                            </label>
                        </div>
                    </div>
                    <div className="pt-5">
                        <button
                            type="submit"
                            className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                        >
                            Add Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
