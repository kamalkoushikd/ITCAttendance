import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/auth';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const success = await login(form.username, form.password);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (success) {
                if (user.is_admin) {
                    navigate('/');
                } else {
                    navigate('/attendance-home');
                }
            } else {
                setError('Invalid credentials');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <motion.form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4"
                    >
                        <LogIn size={32} />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                    <p className="mt-1 text-sm text-gray-600">Enter your credentials to continue</p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={form.username}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <motion.div
                            className="text-red-600 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}
                </motion.div>

                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm font-semibold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </motion.button>
            </motion.form>
        </div>
    );
}
