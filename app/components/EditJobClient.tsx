'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface JobRecord {
    u_id: string;
    rowuid: string;
    serial_number: string;
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

type ReadonlyFields =
    | 'u_id'
    | 'rowuid'
    | 'serial_number'
    | 'date_receipt'
    | 'received_date'
    | 'supplier'
    | 'count_round';

type EditableFields =
    | 'replace_serial'
    | 'job_no'
    | 'condition'
    | 'remark'
    | 'replace_code'
    | 'replace_product';

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
                setForm(data[0]);
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
                        setForm(prev =>
                            prev ? { ...prev, replace_product: data.product_name || '' } : prev
                        );
                    }
                } catch (err) {
                    console.error('Auto-fill error:', err);
                }
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [form?.replace_code]);

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
            condition: form.condition,
            remark: form.remark,
            replace_code: form.replace_code,
            replace_product: form.replace_product,
            update_by: username || 'unknown',
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

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-8">
            <h1 className="text-2xl font-bold text-blue-800 mb-6">Edit Job</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                {(['u_id', 'rowuid', 'serial_number', 'date_receipt', 'received_date', 'supplier', 'count_round'] as ReadonlyFields[]).map(field => (
                    <div key={field}>
                        <label className="block text-gray-600 text-sm font-semibold mb-1 capitalize">
                            {field.replace('_', ' ')}
                        </label>
                        <input
                            type="text"
                            value={
                                form
                                    ? field === 'count_round'
                                        ? String(form[field])
                                        : form[field]
                                    : ''
                            }
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-md"
                        />
                    </div>
                ))}

                {(['replace_serial', 'job_no', 'condition', 'remark', 'replace_code', 'replace_product'] as EditableFields[]).map(field => (
                    <div key={field}>
                        <label className="block text-gray-700 text-sm font-semibold mb-1 capitalize">
                            {field.replace('_', ' ')}
                        </label>
                        <input
                            type="text"
                            name={field}
                            value={form ? form[field] ?? '' : ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            readOnly={field === 'replace_product'}
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    className="bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 mt-4"
                >
                    Save Changes
                </button>

                {error && <p className="text-red-600 font-medium">❌ {error}</p>}
                {success && <p className="text-green-600 font-medium">🎉 {success}</p>}
            </form>
        </div>
    );
}
