// app/create-branch-traffic/page.tsx
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
    Traffic: Number(form.Traffic) // ensure numeric
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
      setSuccess('Traffic record created successfully!');
      setError('');

      // Reset form
      setForm({ BU: '', Branch: '', Name: '', Quarter: '', Week: '', Traffic: '', SerialNo: '' });

      // Redirect after a short delay to show success message (optional)
      setTimeout(() => {
        router.push('/traffic-list'); // Redirect to traffic-list page
      }, 1000); // 1 second delay
    }

  } catch (err) {
    console.error('Network or server error:', err);
    setError('Network or server error');
    setSuccess('');
  }
};


  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Create Branch Traffic</h1>
      {['BU', 'Branch', 'Name', 'Quarter', 'Week', 'Traffic', 'SerialNo'].map((field) => (
        <input
          key={field}
          className="border p-2 w-full mb-2"
          placeholder={field}
          value={form[field as keyof typeof form]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ))}
      <button className="bg-green-500 text-white px-4 py-2" onClick={handleSubmit}>
        Submit
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
}
