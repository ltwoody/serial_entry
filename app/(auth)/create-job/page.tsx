'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fields = [
  { name: 'serial_no', label: 'Serial No', type: 'text' },
  { name: 'job_date', label: 'Job Date', type: 'date' },
  { name: 'supplier_name', label: 'Supplier Name', type: 'text' },
  { name: 'received_date', label: 'Received Date', type: 'date' },
  { name: 'product_code', label: 'Product Code', type: 'text' },
  { name: 'brand', label: 'Brand', type: 'text' },
  { name: 'job_no', label: 'Job No', type: 'text' },
  { name: 'product_name', label: 'Product Name', type: 'text' },
  { name: 'status', label: 'Status', type: 'text' },
  { name: 'round', label: 'Round', type: 'text' },
];

export default function CreateJob() {
  const router = useRouter();
  const [form, setForm] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    const payload = {
      ...form,
      /*Traffic: Number(form.Traffic),*/
    };

    let data = { message: 'Unknown error' };

    try {
      const res = await fetch('/api/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      try {
        data = await res.json();
      } catch (jsonErr) {
        const raw = await res.text();
        console.error('Non-JSON response:', raw);
        setError(`Server error: ${raw} ${jsonErr}`);
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        setSuccess('');
      } else {
        setSuccess('✅ Traffic record created successfully!');
        setError('');
        setForm(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));

        setTimeout(() => {
          router.push('/job-report');
        }, 1000);
      }
    } catch (err) {
      console.error('Network or server error:', err);
      setError('Network or server error');
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-900">
          🚦 Create Job
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {fields.map(({ name, label, type }) => (
  <div key={name} className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-semibold text-gray-700 capitalize">
      {label}
    </label>
    <input
      id={name}
      type={type}
      value={form[name as keyof typeof form]}
      onChange={async (e) => {
        const value = e.target.value;
        setForm({ ...form, [name]: value });

        if (name === 'product_code' && value.trim().length > 0) {
          try {
            const res = await fetch('/api/get-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product_code: value }),
            });

            if (res.ok) {
              const data = await res.json();
              setForm((prevForm) => ({
                ...prevForm,
                brand: data.brand,
                product_name: data.product_name,
              }));
            } else {
              setForm((prevForm) => ({
                ...prevForm,
                brand: '',
                product_name: '',
              }));
            }
          } catch (err) {
            console.error('Product lookup failed:', err);
          }
        }
        if (name === 'job_no' && value.trim()) {
      try {
        const res = await fetch('/api/get-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_no: value }),
        });
        if (res.ok) {
          const data = await res.json();
          setForm((prev) => ({ ...prev, round: data.round ?? '' }));
        } else {
          setForm((prev) => ({ ...prev, round: '' }));
        }
      } catch (err) {
        console.error(err);
      }
    }


      }}
      className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      placeholder={`Enter ${label}`}
    />
  </div>
))}

          {/* Submit button spans both columns */}
          <button
            type="submit"
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 rounded-lg mt-4 shadow-lg"
          >
            Submit Traffic
          </button>
        </form>

        {error && (
          <p className="mt-6 text-center text-red-700 bg-red-100 p-3 rounded-lg font-semibold">
            ❌ {error}
          </p>
        )}

        {success && (
          <p className="mt-6 text-center text-green-700 bg-green-100 p-3 rounded-lg font-semibold">
            🎉 {success}
          </p>
        )}
      </div>
    </div>
  );
}
