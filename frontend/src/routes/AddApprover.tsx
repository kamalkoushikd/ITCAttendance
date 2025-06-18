import { useEffect, useState } from 'react';
import { fetchApprovers, postData, updateData, deleteData } from '../api/api';
import { UserCheck } from 'lucide-react';
import { useAuthTokenSync } from '../api/auth';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bcrypt from 'bcryptjs';

// Define types for form and payload
interface FormState {
    emp_id: string;
    name: string;
    email: string;
    manager_emp_id: string;
    manager_name: string;
    manager_email: string;
    password: string;
    confirmPassword: string;
}

interface Payload {
    emp_id: string;
    name: string;
    email: string;
    manager_emp_id: string;
    manager_name: string;
    manager_email: string;
    password_hash: string;
}

export default function AddApprover() {
    useAuthTokenSync();

    const [approvers, setApprovers] = useState<any[]>([]);
    const [form, setForm] = useState<FormState>({
        emp_id: '',
        name: '',
        email: '',
        manager_emp_id: '',
        manager_name: '',
        manager_email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editEmpId, setEditEmpId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ open: boolean, approver: any | null }>({ open: false, approver: null });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (a: any) => {
        setForm({
            emp_id: a.emp_id,
            name: a.name,
            email: a.email,
            password: '', // Do not prefill password
            manager_emp_id: a.manager_emp_id,
            manager_name: a.manager_name,
            manager_email: a.manager_email,
            confirmPassword: '' // Do not prefill confirm password
        });
        setEditMode(true);
        setEditEmpId(a.emp_id);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditEmpId(null);
        setForm({
            emp_id: '',
            name: '',
            email: '',
            manager_emp_id: '',
            manager_name: '',
            manager_email: '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleDelete = (a: any) => {
        setShowConfirm({ open: true, approver: a });
    };

    const confirmDelete = async () => {
        if (showConfirm.approver) {
            try {
                await deleteData('approvers', showConfirm.approver.emp_id);
                setApprovers(await fetchApprovers());
                toast.success('Approver deleted successfully');
            } catch {
                toast.error('Failed to delete approver');
            }
        }
        setShowConfirm({ open: false, approver: null });
    };

    const cancelDelete = () => {
        setShowConfirm({ open: false, approver: null });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Require all fields
        const requiredFields = ['emp_id', 'name', 'email', 'password', 'confirmPassword'];
        for (const field of requiredFields) {
            if (!form[field as keyof FormState] || (typeof form[field as keyof FormState] === 'string' && form[field as keyof FormState] === '')) {
                toast.error(`Field '${field.replace('_', ' ').toUpperCase()}' is required.`);
                return;
            }
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        // Explicitly construct payload to only include backend fields
        const payload: Payload = {
            emp_id: form.emp_id,
            name: form.name,
            email: form.email,
            manager_emp_id: form.manager_emp_id,
            manager_name: form.manager_name,
            manager_email: form.manager_email,
            password_hash: bcrypt.hashSync(form.password, bcrypt.genSaltSync(10))
        };
        try {
            if (editMode && editEmpId !== null) {
                await updateData('approvers', editEmpId, payload);
                toast.success('Approver updated successfully');
            } else {
                await postData('approvers', payload);
                toast.success('Approver added successfully');
            }
            setForm({ emp_id: '', name: '', email: '', manager_emp_id: '', manager_name: '', manager_email: '', password: '', confirmPassword: '' });
            setEditMode(false);
            setEditEmpId(null);
            setApprovers(await fetchApprovers());
        } catch (err) {
            toast.error(editMode ? 'Error updating approver' : 'Error adding approver');
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
                Approver Management
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
                                <UserCheck className="h-6 w-6 text-purple-500" />
                                <h3 className="text-xl font-semibold text-gray-900">Add New Approver</h3>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 md:grid-cols-3">
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
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
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
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="Email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="manager_emp_id" className="block text-sm font-medium text-gray-700 mb-1">Manager Employee ID</label>
                                    <input
                                        type="text"
                                        name="manager_emp_id"
                                        id="manager_emp_id"
                                        placeholder="Manager Employee ID"
                                        required
                                        value={form.manager_emp_id}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="manager_name" className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                                    <input
                                        type="text"
                                        name="manager_name"
                                        id="manager_name"
                                        placeholder="Manager Name"
                                        required
                                        value={form.manager_name}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="manager_email" className="block text-sm font-medium text-gray-700 mb-1">Manager Email</label>
                                    <input
                                        type="email"
                                        name="manager_email"
                                        id="manager_email"
                                        placeholder="Manager Email"
                                        required
                                        value={form.manager_email}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="Password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="Confirm Password"
                                        required
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-purple-400 bg-gray-50 px-4 py-3 text-gray-900 text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full py-4 px-6 rounded-xl font-bold text-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
                                >
                                    {editMode ? 'Update Approver' : 'Add Approver'}
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
                        <h3 className="text-xl font-semibold text-gray-900">All Approvers</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                            <thead>
                                <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Approver Name</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Employee ID</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700">Email</th>
                                    <th className="py-4 px-6 text-lg font-bold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500 text-lg">Loading approvers...</td>
                                    </tr>
                                ) : approvers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500 text-lg">No approvers found</td>
                                    </tr>
                                ) : approvers.map((a) => (
                                    <tr key={a.emp_id} className="border-b last:border-b-0 hover:bg-purple-50 transition">
                                        <td className="py-4 px-6 font-medium">{a.name}</td>
                                        <td className="py-4 px-6">{a.emp_id}</td>
                                        <td className="py-4 px-6">{a.email}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Edit</button>
                                            <button onClick={() => handleDelete(a)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
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
                        <p className="mb-6 text-gray-700">Are you sure you want to delete approver <span className="font-bold">{showConfirm.approver?.name}</span> (<span className="font-mono">{showConfirm.approver?.emp_id}</span>)?</p>
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
