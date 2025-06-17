'use client';
import { useState} from 'react';
import { useRouter } from 'next/navigation';

const fields = [
  { name: 'serial_number', label: 'Serial No', type: 'text' },
  { name: 'date_receipt', label: 'Date Receipt', type: 'date' },
  { name: 'supplier', label: 'Supplier Name', type: 'text' },
  { name: 'received_date', label: 'Received Date', type: 'date' },
  { name: 'product_code', label: 'Product Code', type: 'text' },
  { name: 'product_name', label: 'Product Name', type: 'text' },
  { name: 'brand_name', label: 'Brand', type: 'text' },
  { name: 'job_no', label: 'Job No', type: 'text' },
  { name: 'condition', label: 'Condition', type: 'text' },
  { name: 'remark', label: 'Remark', type: 'text' },
  { name: 'count_round', label: 'Round', type: 'number' },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-700">
           Create Job
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

         // Lookup by product_code
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
                brand_name: data.brand_name,
                product_name: data.product_name,
              }));
            } else {
              setForm((prevForm) => ({
                ...prevForm,
                brand_name: '',
                product_name: '',
              }));
            }
          } catch (err) {
            console.error('Product lookup failed:', err);
          }
        }

        

       // Lookup by serial_number
  if (name === 'serial_number' && value.trim().length > 0) {
    try {
      const res = await fetch('/api/get-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_number: value }),
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({
          ...prev,
          count_round: data.count_round ?? '',
        }));

        // Optional: autofill u_id (if you're displaying it)
        if (data.u_id) {
          console.log('Fetched u_id:', data.u_id); // Debug or use as needed
        }
      } else {
        if (data.message) {
          console.warn(data.message);
          setError(data.message);
        }
        setForm((prev) => ({
          ...prev,
          count_round: '',
        }));
      }
    } catch (err) {
      console.error('Serial lookup failed:', err);
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
            className="md:col-span-2 bg-gray-500 hover:bg-gray-700 transition text-white font-bold py-3 rounded-lg mt-4 shadow-lg"
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
