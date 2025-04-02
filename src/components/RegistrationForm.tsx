import React, { useState } from 'react';
import { addDays, format, addMonths } from 'date-fns';
import { Camera, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App';

interface FormData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  photo: File | null;
  plan: '1month' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  paymentMethod: 'cash' | 'online';
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  months: number;
}

const PLAN_DURATIONS = {
  '1month': 30,
  'quarterly': 90,
  'yearly': 365,
};

const plans: PlanOption[] = [
  {
    id: '1month',
    name: '1 Month',
    price: 1500,
    months: 1
  },
  {
    id: 'quarterly',
    name: '6 Months',
    price: 5000,
    months: 6
  },
  {
    id: 'yearly',
    name: '1 Year',
    price: 8000,
    months: 12
  }
];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    dob: '',
    photo: null,
    plan: '1month',
    startDate: new Date().toISOString().split('T')[0],
    endDate: addMonths(new Date(), 1).toISOString().split('T')[0],
    paymentMethod: 'online',
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('1month');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast.error('Photo size should be less than 1MB');
        return;
      }
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlanSelect = (plan: PlanOption) => {
    const startDate = new Date();
    const endDate = addMonths(startDate, plan.months);

    setSelectedPlan(plan.id);
    setFormData(prev => ({
      ...prev,
      plan: plan.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        // Special handling for photo
        if (key === 'photo' && formData[key] instanceof File) {
          formDataToSend.append('photo', formData[key]);
        } else {
          formDataToSend.append(key, String(formData[key]));
        }
      });

      console.log('Sending registration request to:', `${API_BASE_URL}/api/users/register`);

      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header when sending FormData
        // The browser will set it automatically with the correct boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      toast.success('Registration successful! Please check your email.');
      navigate('/thank-you');
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Choose Your Plan</h2>
      
      {/* Price Selection Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Select Your Plan</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              className={`p-4 rounded-lg transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'bg-yellow-500 text-white transform scale-105'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="text-lg font-bold mb-1">{plan.name}</div>
              <div className={`text-2xl font-bold ${
                selectedPlan === plan.id ? 'text-white' : 'text-yellow-500'
              }`}>
                {formatPrice(plan.price)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Existing Form */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-2xl font-bold mb-6">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-sm text-gray-500">
                Click to upload or drag and drop<br />
                PNG, JPG up to 1MB
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'online' })}
              >
                <option value="online">Online Payment</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;