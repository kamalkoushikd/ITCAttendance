import { useEffect, useState } from 'react';
import { postData, fetchEmployees, fetchLocations, fetchVendors, fetchApprovers, fetchBillingCycleRules, updateData, deleteData, fetchDesignations } from '../api/api';
import { Users } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        resigned: false,
        designation_id: '',
        dob: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [locations, setLocations] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [approvers, setApprovers] = useState<any[]>([]);
    const [billingRules, setBillingRules] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    // Track selected vendor and billing rule
    const [filteredBillingRules, setFilteredBillingRules] = useState<any[]>([]);
    const [vendorLocked, setVendorLocked] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editEmpId, setEditEmpId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ open: boolean, emp: any | null }>({ open: false, emp: null });

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
            const locationsData = await fetchLocations();
            const vendorsData = await fetchVendors();
            const approversData = await fetchApprovers();
            const billingRulesData = await fetchBillingCycleRules();
            setLocations(locationsData);
            setVendors(vendorsData);
            setApprovers(approversData);
            setBillingRules(billingRulesData);

            // Fetch designations by vendor if vendor is selected
            if (form.vendor_name) {
                const designations = await fetchDesignations(form.vendor_name);
                setDesignations(designations);
                console.log(designations)
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        // When vendor_name changes, filter billing rules and designations
        if (form.vendor_name) {
            setFilteredBillingRules(billingRules.filter(r => r.vendor_name === form.vendor_name));
            const fetchDesignationsForVendor = async (vendorName: string) => {
                if (vendorName) {
                    setDesignations(await fetchDesignations(vendorName));
                } else {
                    setDesignations([]);
                }
            };
            fetchDesignationsForVendor(form.vendor_name);
        } else {
            setFilteredBillingRules(billingRules);
            setDesignations([]);
        }
    }, [form.vendor_name, billingRules]);

    useEffect(() => {
        // When billing_rule_id changes, auto-select vendor and lock it
        if (form.billing_rule_id) {
            const rule = billingRules.find(r => r.rule_id === form.billing_rule_id);
            if (rule) {
                setForm(prev => ({ ...prev, vendor_name: rule.vendor_name }));
                setVendorLocked(true);
            }
        } else {
            setVendorLocked(false);
        }
    }, [form.billing_rule_id, billingRules]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;
        if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;
        // If location is changed, auto-set state
        if (name === 'location') {
            const selectedLocation = locations.find((l) => l.location === value);
            setForm((prev) => ({ ...prev, location: value, state: selectedLocation ? selectedLocation.state : '' }));
        } else if (name === 'vendor_name') {
            setForm((prev) => ({ ...prev, vendor_name: value, designation_id: '' }));
            // fetchDesignationsForVendor(value);
        } else {
            setForm((prev) => ({ ...prev, [name]: newValue }));
        }
    };

    const handleEdit = (emp: any) => {
        setForm({
            emp_id: emp.emp_id,
            name: emp.name,
            gender: emp.gender,
            state: emp.state,
            location: emp.location,
            vendor_name: emp.vendor_name,
            approver_emp_id: emp.approver_emp_id,
            billing_rule_id: emp.billing_rule_id,
            doj: emp.doj ? emp.doj.slice(0, 10) : '',
            resignation_date: emp.resignation_date ? emp.resignation_date.slice(0, 10) : '',
            resigned: emp.resigned,
            designation_id: emp.designation_id,
            dob: emp.dob ? emp.dob.slice(0, 10) : ''
        });
        setEditMode(true);
        setEditEmpId(emp.emp_id);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditEmpId(null);
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
            resigned: false,
            designation_id: '',
            dob: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate required fields (all except resignation_date)
        const requiredFields = [
            'emp_id', 'name', 'gender', 'state', 'location', 'vendor_name',
            'approver_emp_id', 'billing_rule_id', 'doj', 'designation_id', 'dob'
        ];
        for (const field of requiredFields) {
            if (!form[field as keyof typeof form] || (typeof form[field as keyof typeof form] === 'string' && form[field as keyof typeof form] === '')) {
                toast.error(`Field '${field.replace('_', ' ').toUpperCase()}' is required.`);
                return;
            }
        }
        const payload = {
            ...form,
            doj: form.doj === '' ? null : form.doj,
            dob: form.dob === '' ? null : form.dob,
            resignation_date: form.resignation_date === '' ? null : form.resignation_date
        };
        try {
            if (editMode && editEmpId) {
                await updateData('employees', editEmpId, payload);
                toast.success('Employee updated successfully');
            } else {
                await postData('employees', payload);
                toast.success('Employee added successfully');
            }
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
                resigned: false,
                designation_id: '',
                dob: ''
            });
            setEditMode(false);
            setEditEmpId(null);
            const updatedEmployees = await fetchEmployees();
            setEmployees(updatedEmployees);
        } catch (err) {
            toast.error(editMode ? 'Failed to update employee' : 'Failed to add employee');
        }
    };

    const handleDelete = (emp: any) => {
        setShowConfirm({ open: true, emp });
    };

    const confirmDelete = async () => {
        if (showConfirm.emp) {
            try {
                await deleteData('employees', showConfirm.emp.emp_id);
                setEmployees(await fetchEmployees());
                toast.success('Employee deleted successfully');
            } catch {
                toast.error('Failed to delete employee');
            }
        }
        setShowConfirm({ open: false, emp: null });
    };

    const cancelDelete = () => {
        setShowConfirm({ open: false, emp: null });
    };

    // Fetch all designations for mapping in table
    const [allDesignations, setAllDesignations] = useState<any[]>([]);
    useEffect(() => {
        const fetchAllDesignations = async () => {
            const all = await fetchDesignations();
            setAllDesignations(all);
        };
        fetchAllDesignations();
    }, []);

    // Helper: Map designation_id to designation name using allDesignations
    const designationIdToName = (id: string | number) => {
        const d = allDesignations.find((d: any) => String(d.designation_id) === String(id));
        return d ? d.designation : id;
    };

    return (
        <>
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
                    Employee Management
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
                                    <Users className="h-6 w-6 text-blue-500" />
                                    <h3 className="text-xl font-semibold text-gray-900">Add New Employee</h3>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-6">
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="emp_id" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                        <input
                                            type="text"
                                            name="emp_id"
                                            id="emp_id"
                                            placeholder="Employee ID"
                                            required
                                            value={form.emp_id}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder="Full Name"
                                            required
                                            value={form.name}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <select
                                            name="gender"
                                            id="gender"
                                            required
                                            value={form.gender}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <select
                                            name="location"
                                            id="location"
                                            required
                                            value={form.location}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                        >
                                            <option value="">Select Location</option>
                                            {locations.map(l => (
                                                <option key={l.location} value={l.location}>{l.location}</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                                        <select
                                            name="vendor_name"
                                            id="vendor_name"
                                            required
                                            value={form.vendor_name}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                            disabled={vendorLocked}
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(v => (
                                                <option key={v.vendor_name} value={v.vendor_name}>{v.vendor_name}</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="billing_rule_id" className="block text-sm font-medium text-gray-700 mb-1">Billing Rule</label>
                                        <select
                                            name="billing_rule_id"
                                            id="billing_rule_id"
                                            required
                                            value={form.billing_rule_id}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                        >
                                            <option value="">Select Billing Rule</option>
                                            {filteredBillingRules.map(r => (
                                                <option key={r.rule_id} value={r.rule_id}>{r.rule_id}</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="approver_emp_id" className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                                        <select
                                            name="approver_emp_id"
                                            id="approver_emp_id"
                                            required
                                            value={form.approver_emp_id}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                        >
                                            <option value="">Select Approver</option>
                                            {approvers.map(a => (
                                                <option key={a.emp_id} value={a.emp_id}>{a.name} ({a.emp_id})</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="designation_id" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                        <select
                                            name="designation_id"
                                            id="designation_id"
                                            required
                                            value={form.designation_id || ''}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-400 bg-white px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition appearance-none cursor-pointer pr-10 align-middle"
                                        >
                                            <option value="">Select Designation</option>
                                            {designations.map((d: any) => (
                                                <option key={d.designation_id} value={d.designation_id}>{d.designation}</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </div>
                                    <div>
                                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            id="dob"
                                            required
                                            value={form.dob || ''}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="doj" className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                                        <input
                                            type="date"
                                            name="doj"
                                            id="doj"
                                            required
                                            value={form.doj}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            name="resigned"
                                            id="resigned"
                                            checked={form.resigned}
                                            onChange={e => {
                                                handleChange(e);
                                                // If unchecked, clear resignation_date
                                                if (!(e.target as HTMLInputElement).checked) {
                                                    setForm(prev => ({ ...prev, resignation_date: '' }));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="resigned" className="ml-2 block text-base text-gray-900">
                                            Resigned
                                        </label>
                                    </div>
                                    <div>
                                        <label htmlFor="resignation_date" className="block text-sm font-medium text-gray-700 mb-1">Resignation Date</label>
                                        <input
                                            type="date"
                                            name="resignation_date"
                                            id="resignation_date"
                                            value={form.resignation_date}
                                            onChange={handleChange}
                                            disabled={!form.resigned}
                                            className="block w-full rounded-lg border border-blue-300 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="pt-5 flex gap-4">
                                    <button
                                        type="submit"
                                        className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                                    >
                                        {editMode ? 'Update Employee' : 'Add Employee'}
                                    </button>
                                    {editMode && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gray-300 hover:bg-gray-400 text-gray-800 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                    <div>
                        <motion.div
                            className="bg-white shadow-xl rounded-lg overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="px-4 sm:px-6 py-5 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-6 w-6 text-blue-500" />
                                    <h3 className="text-xl font-semibold text-gray-900">Employee List</h3>
                                </div>
                            </div>
                            <div className="px-4 sm:px-6 py-5">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Rule</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOJ</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resignation</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={13} className="px-6 py-4 text-center text-gray-500">Loading employees...</td>
                                                </tr>
                                            ) : employees.length === 0 ? (
                                                <tr>
                                                    <td colSpan={13} className="px-6 py-4 text-center text-gray-500">No employees found</td>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{designationIdToName(emp.designation_id)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.doj}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.dob}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.resignation_date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.resigned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{emp.resigned ? 'Resigned' : 'Active'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEdit(emp)}
                                                            className="text-blue-600 hover:text-blue-900 font-semibold mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(emp)}
                                                            className="text-red-600 hover:text-red-900 font-semibold"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
            {showConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h2>
                        <p className="mb-6 text-gray-700">Are you sure you want to delete employee <span className="font-bold">{showConfirm.emp?.name}</span> (<span className="font-mono">{showConfirm.emp?.emp_id}</span>)?</p>
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
        </>
    );
}

