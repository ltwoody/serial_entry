'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTraffic() {
  const router = useRouter();
  const [form, setForm] = useState({
    BU: '',
    Branch: '',
    Name: '',
    Quarter: '',
    Week: '',
    Traffic: '',
    SerialNo: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    const payload = {
      ...form,
      Traffic: Number(form.Traffic),
    };

    let data = { message: 'Unknown error' };

    try {
      const res = await fetch('/api/create-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      try {
        data = await res.json();
      } catch (jsonErr) {
        const raw = await res.text();
        console.error('Non-JSON response:', raw);
        setError(`Server error: ${raw}`);
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        setSuccess('');
      } else {
        setSuccess('✅ Traffic record created successfully!');
        setError('');
        setForm({ BU: '', Branch: '', Name: '', Quarter: '', Week: '', Traffic: '', SerialNo: '' });

        setTimeout(() => {
          router.push('/traffic-list');
        }, 1000);
      }
    } catch (err) {
      console.error('Network or server error:', err);
      setError('Network or server error');
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          🚦 Create Branch Traffic
        </h1>

        <div className="space-y-4">
          {['BU', 'Branch', 'Name', 'Quarter', 'Week', 'Traffic', 'SerialNo'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field}
              </label>
              <input
                type={field === 'Traffic' ? 'number' : 'text'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={`Enter ${field}`}
                value={form[field as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg  font-bold hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Submit Traffic
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">
            ❌ {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-sm text-green-600 text-center bg-green-50 p-2 rounded-lg">
            🎉 {success}
          </p>
        )}
      </div>
    </div>
  );
}
