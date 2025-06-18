import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchApproverEmployees, postData } from '../api/api';
import { fetchAttendanceRecords } from '../api/attendance';
import AttendanceNavbar from '../components/AttendanceNavbar';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

// This helper function is no longer needed as the logic is moved into the useEffect hook
// function getDaysInPeriod(...)


export default function AttendanceHome() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState({
        month: new Date().getMonth() + 1, // Default to February
        year: new Date().getFullYear(), // Default to 2026 as in your example
    });
    const [payableDays, setPayableDays] = useState<{ [empId: string]: number }>({});
    const [leavesTaken, setLeavesTaken] = useState<{ [empId: string]: number }>({});
    const [submitting, setSubmitting] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

    useEffect(() => {
        fetchApproverEmployees()
            .then(setEmployees)
            .catch(() => {
                setEmployees([]);
                toast.error('Failed to fetch employees');
            });
    }, []);

    useEffect(() => {
        // Fetch attendance records for the selected period
        fetchAttendanceRecords({ month: selectedPeriod.month, year: selectedPeriod.year })
            .then(setAttendanceRecords)
            .catch(() => setAttendanceRecords([]));
    }, [selectedPeriod]);

    useEffect(() => {
        const newPayableDays: { [empId: string]: number } = {};

        employees.forEach((emp) => {
            if (emp.billing_rule_start_day == null) {
                newPayableDays[emp.emp_id] = 0;
                return;
            }

            // --- 1. Define the Billing Period Boundaries for the single selected month ---
            const periodStartDate = new Date(
                selectedPeriod.year,
                selectedPeriod.month - 1, // month is 1-based, convert to 0-based
                emp.billing_rule_start_day
            );

            // Exclusive end date is the start of the NEXT month.
            const periodEndDateExclusive = new Date(
                selectedPeriod.year,
                selectedPeriod.month, // Use month value directly (e.g., 2 for Feb becomes monthIndex 2 = March)
                emp.billing_rule_start_day
            );

            // --- 2. Define the Employee's Active Tenure ---
            const employeeJoiningDate = emp.doj ? new Date(emp.doj) : new Date(0);
            const employeeResignationDate = emp.resignation_date ? new Date(emp.resignation_date) : null;

            // --- 3. Find the Intersection to Determine the Payable Period ---
            const payableStartDate = employeeJoiningDate > periodStartDate ? employeeJoiningDate : periodStartDate;

            let payableEndDateExclusive = periodEndDateExclusive;
            if (employeeResignationDate) {
                // The employee's tenure ends on the day of resignation (inclusive).
                // To make it an exclusive end date for calculation, we take the day AFTER resignation.
                const resignationEndExclusive = new Date(employeeResignationDate);
                resignationEndExclusive.setDate(resignationEndExclusive.getDate() + 1);

                // The payable period ends at the EARLIER of the period end or the resignation end.
                if (resignationEndExclusive < payableEndDateExclusive) {
                    payableEndDateExclusive = resignationEndExclusive;
                }
            }

            // --- 4. Calculate the Difference in Days ---
            let days = 0;
            if (payableEndDateExclusive > payableStartDate) {
                const diffMs = payableEndDateExclusive.getTime() - payableStartDate.getTime();
                days = Math.round(diffMs / (1000 * 60 * 60 * 24));
            }

            newPayableDays[emp.emp_id] = Math.max(0, days);
        });

        setPayableDays(newPayableDays);
    }, [employees, selectedPeriod]);

    // Filter employees based on period and tenure, and exclude those with attendance already submitted
    const filteredEmployees = employees.filter((emp) => {
        if (!emp.doj) return false;
        const joiningDate = new Date(emp.doj);
        const resignationDate = emp.resignation_date ? new Date(emp.resignation_date) : null;
        // Billing period boundaries
        const periodStart = new Date(selectedPeriod.year, selectedPeriod.month - 1, emp.billing_rule_start_day || 1);
        const periodEnd = new Date(selectedPeriod.year, selectedPeriod.month, emp.billing_rule_start_day || 1);
        // Exclude if period is entirely before joining
        if (periodEnd <= joiningDate) return false;
        // Exclude if period is entirely after resignation
        if (resignationDate && periodStart > resignationDate) return false;
        // Exclude if attendance already exists for this emp_id, month, year
        const alreadySubmitted = attendanceRecords.some(
            (rec) => rec.emp_id === emp.emp_id && rec.month === selectedPeriod.month && rec.year === selectedPeriod.year
        );
        if (alreadySubmitted) return false;
        return true;
    });

    const handleLeavesChange = (empId: string, value: number) => {
        setLeavesTaken((prev) => ({ ...prev, [empId]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const records = filteredEmployees.map((emp) => ({
                emp_id: emp.emp_id,
                approver_emp_id: emp.approver_emp_id,
                month: selectedPeriod.month,
                year: selectedPeriod.year,
                payable_days: payableDays[emp.emp_id] || 0,
                leaves_taken: leavesTaken[emp.emp_id] || 0,
            }));
            await postData('monthly-attendance', { records });
            toast.success('Attendance submitted successfully!');
        } catch (err) {
            toast.error('Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    if (!Array.isArray(employees)) return null;

    return (
        <motion.div
            className="max-w-7xl mx-auto py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <AttendanceNavbar />
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Attendance Home
            </h2>
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <label className="font-semibold">Select Period:</label>
                <select
                    value={selectedPeriod.month}
                    onChange={(e) =>
                        setSelectedPeriod((p) => ({
                            ...p,
                            month: +e.target.value,
                        }))
                    }
                >
                    {months.map((m, i) => (
                        <option key={i} value={i + 1}>
                            {m}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    value={selectedPeriod.year}
                    onChange={(e) =>
                        setSelectedPeriod((p) => ({ ...p, year: +e.target.value }))
                    }
                    className="border rounded px-2 py-1 w-24"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow mb-8 text-base">
                    <thead>
                        <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
                            <th className="py-4 px-6 font-bold text-gray-700">Employee ID</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Employee Name</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Gender</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Billing Rule ID</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Vendor</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Location</th>
                            {/* <th className="py-4 px-6 font-bold text-gray-700">State</th> */}
                            <th className="py-4 px-6 font-bold text-gray-700">Designation</th>
                            {/* <th className="py-4 px-6 font-bold text-gray-700">Date of Birth</th> */}
                            {/* <th className="py-4 px-6 font-bold text-gray-700">Date of Joining</th> */}
                            {/* <th className="py-4 px-6 font-bold text-gray-700">Resignation Date</th> */}
                            <th className="py-4 px-6 font-bold text-gray-700">Resigned</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Payable Days</th>
                            <th className="py-4 px-6 font-bold text-gray-700">Leaves Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.emp_id} className="border-b last:border-b-0">
                                <td className="py-4 px-6">{emp.emp_id}</td>
                                <td className="py-4 px-6">{emp.name}</td>
                                <td className="py-4 px-6">{emp.gender || '-'}</td>
                                <td className="py-4 px-6">{emp.billing_rule_id}</td>
                                <td className="py-4 px-6">{emp.vendor_name}</td>
                                <td className="py-4 px-6">{emp.location}</td>
                                {/* <td className="py-4 px-6">{emp.state}</td> */}
                                <td className="py-4 px-6">{emp.designation || '-'}</td>
                                {/* <td className="py-4 px-6">{emp.dob ? new Date(emp.dob).toLocaleDateString() : '-'}</td> */}
                                {/* <td className="py-4 px-6">{emp.doj ? new Date(emp.doj).toLocaleDateString() : '-'}</td> */}
                                {/* <td className="py-4 px-6">{emp.resignation_date ? new Date(emp.resignation_date).toLocaleDateString() : '-'}</td> */}
                                <td className="py-4 px-6">{emp.resigned ? 'Yes' : 'No'}</td>
                                <td className="py-4 px-6">
                                    <input
                                        type="number"
                                        value={payableDays[emp.emp_id] > 0 ? payableDays[emp.emp_id] : ''}
                                        readOnly
                                        className="border rounded px-2 py-1 w-24 bg-gray-100"
                                    />
                                </td>
                                <td className="py-4 px-6">
                                    <input
                                        type="number"
                                        min={0}
                                        className="border rounded px-2 py-1 w-24"
                                        placeholder="Leaves"
                                        value={leavesTaken[emp.emp_id] ?? ''}
                                        onChange={e => handleLeavesChange(emp.emp_id, +e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={submitting}
            >
                {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Notification Toast" />
        </motion.div>
    );
}