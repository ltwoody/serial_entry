'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon for back button

interface JobRecord {
    u_id: string;
    rowuid: string;
    serial_number: string;
    product_code: string;
    product_name: string;
    date_receipt: string;
    received_date: string;
    supplier: string;
    count_round: number;
    job_no: string;
    replace_serial: string;
    condition: string;
    remark: string;
    replace_code: string;
    replace_product: string;
}

interface EditJobClientProps {
    rowuid: string;
}

// Helper function to format date to YYYY-MM-DD for input type="date"
const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return ''; // Return empty string for invalid dates
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return ''; // Handle potential errors during date parsing
    }
};

export default function EditJobClient({ rowuid }: EditJobClientProps) {
    const router = useRouter();

    const [form, setForm] = useState<JobRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const cookieUser = decodeURIComponent(
            document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1] || ''
        );
        setUsername(cookieUser);
    }, []);

    useEffect(() => {
        if (!rowuid) return;
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs?rowuid=${rowuid}`);
                if (!res.ok) throw new Error('Failed to fetch job record');
                const data = await res.json();
                const jobData: JobRecord = data[0];

                // Format dates for input type="date"
                const formattedJobData = {
                    ...jobData,
                    date_receipt: formatDateForInput(jobData.date_receipt),
                    received_date: formatDateForInput(jobData.received_date),
                };

                setForm(formattedJobData);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [rowuid]);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (form?.replace_code?.trim()) {
                try {
                    const res = await fetch('/api/product-name', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_code: form.replace_code }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        // Only auto-fill if replace_product is currently empty or not touched by user
                        // This logic can be refined further if you need more control
                        if (!form.replace_product) {
                            setForm(prev =>
                                prev ? { ...prev, replace_product: data.product_name || '' } : prev
                            );
                        }
                    }
                } catch (err) {
                    console.error('Auto-fill error:', err);
                }
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [form?.replace_code, form?.replace_product]); // Add form.replace_product to dependency array

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;

        const payload = {
            job_no: form.job_no,
            replace_serial: form.replace_serial,
            product_code: form.product_code,
            product_name: form.product_name,
            condition: form.condition,
            remark: form.remark,
            replace_code: form.replace_code,
            replace_product: form.replace_product, // Ensure this is included
            date_receipt: form.date_receipt,
            received_date: form.received_date,
            serial_number: form.serial_number,
            supplier: form.supplier,
            // Assuming product_code and product_name are part of the original job record
            // If they are not in the form state, they won't be sent unless explicitly added
            // based on the original data fetched (record.product_code, etc.)
            // For now, let's stick to fields from the `form` state as per payload structure
            // in the previous turn. If product_code/name need to be updated, they need inputs.
            update_by: username || 'unknown', // Pass username as update_by
        };

        try {
            const res = await fetch(`/api/update-job/${rowuid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());

            setSuccess('✅ Job updated successfully!');
            setError('');
            setTimeout(() => router.push('/job-report'), 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (!form) return <p className="text-center text-red-600">Record not found</p>;

    // Define all fields to be displayed in the form, categorized for columns
    const columnDefinitions = [
        // Column 1: Core Details
        [
            { key: 'serial_number', label: 'Serial Number', type: 'text', readOnly: false },
            { key: 'date_receipt', label: 'วันที่ใบเสร็จ', type: 'date', readOnly: false },
            { key: 'received_date', label: 'วันที่รับของ', type: 'date', readOnly: false },
            { key: 'supplier', label: 'ชื่อ Supplier', type: 'text', readOnly: false },
        ],
        // Column 2: Job & Product Information
        [
            { key: 'job_no', label: 'เลข Job ใน Nimbus', type: 'text', readOnly: false },
            
            { key: 'product_code', label: 'S Code', type: 'text', readOnly: false }, // Added from previous request, assuming read-only
            { key: 'product_name', label: 'Product Name', type: 'text', readOnly: false }, // Added from previous request, assuming read-only
            { key: 'condition', label: 'อาการเสีย', type: 'text', readOnly: false },
        ],
        // Column 3: Replacement Details
        [
            { key: 'replace_serial', label: 'Replace Serial', type: 'text', readOnly: false },
            { key: 'replace_code', label: 'Replace SCode', type: 'text', readOnly: false },
            { key: 'replace_product', label: 'Replace Name', type: 'text', readOnly: false }, // MADE EDITABLE HERE
            { key: 'remark', label: 'Remark', type: 'textarea', readOnly: false }, // Use textarea for remark
        ],
        // Column 4: Record Identifiers & Counters
        [
            { key: 'u_id', label: 'U ID', readOnly: true },
            { key: 'rowuid', label: 'Row UID', readOnly: true },
            { key: 'count_round', label: 'ครั้งที่เคลม', readOnly: true, type: 'text' },
            // You could also add `update_by` here as a read-only field if you want to show it.
            // { key: 'update_by', label: 'Last Updated By', type: 'text', readOnly: true },
        ],
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto p-8 mb-10">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-700 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 bg-gray-200 hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        ✍️ Edit Job - <span className="text-blue-600">ID {form.u_id}</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
                        {columnDefinitions.map((fieldsInColumn, colIndex) => (
                            <div key={colIndex} className="flex flex-col">
                                {fieldsInColumn.map(field => {
                                    // Ensure product_code and product_name are in JobRecord for display
                                    // If not, they would cause type errors. Assuming they are.
                                    if (!(field.key in form)) {
                                        console.warn(`Field ${String(field.key)} not found in form data.`);
                                        return null; // Skip rendering if field key doesn't exist in form
                                    }

                                    const isTextArea = field.type === 'textarea';
                                    const InputComponent = isTextArea ? 'textarea' : 'input';
                                    const isFieldReadOnly = field.readOnly; // Use the readOnly property from columnDefinitions

                                    return (
                                        <div key={field.key} className="mb-5 last:mb-0">
                                            <label htmlFor={String(field.key)} className="block text-gray-700 text-sm font-bold capitalize mb-1">
                                                {field.label || String(field.key).replace(/_/g, ' ')}
                                            </label>
                                            <InputComponent
                                                id={String(field.key)}
                                                type={field.type === 'textarea' ? undefined : field.type}
                                                name={String(field.key)}
                                                // Handle numbers correctly if any are added, e.g. String(form[field.key])
                                                value={form[field.key as keyof JobRecord] ?? ''}
                                                onChange={handleChange}
                                                readOnly={isFieldReadOnly}
                                                className={`w-full px-4 py-2 border border-gray-300 bg-blue-100 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                                                    isFieldReadOnly
                                                        ? ' bg-gray-300 text-gray-700 cursor-not-allowed'
                                                        : ''
                                                } ${isTextArea ? 'min-h-[80px] resize-y' : ''}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 mt-6 text-lg transition-colors duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                        Save Changes
                    </button>

                    {error && <p className="text-red-600 font-medium mt-4 text-center">❌ {error}</p>}
                    {success && <p className="text-green-600 font-medium mt-4 text-center">🎉 {success}</p>}
                </form>
            </div>
        </div>
    );
}