import React, { useState } from 'react';
import { useCreateTicketMutation } from "../redux/api/customerSupportApiSlice";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FaHeadset, 
  FaTicketAlt, 
  FaExclamationCircle, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaPaperPlane,
  FaCheckCircle,
  FaArrowLeft,
  FaChevronRight,
  FaEnvelope,
  FaPhone,
  FaListAlt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const CustomerSupport = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', icon: <FaInfoCircle />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'medium', label: 'Medium', icon: <FaExclamationCircle />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'high', label: 'High', icon: <FaExclamationTriangle />, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'urgent', label: 'Urgent', icon: <FaExclamationTriangle />, color: 'bg-red-100 text-red-700 border-red-200' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters';
    } else if (formData.subject.length > 100) {
      errors.subject = 'Subject must be less than 100 characters';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (formData.message.length > 1000) {
      errors.message = 'Message must be less than 1000 characters';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      const response = await createTicket(formData).unwrap();
      
      if (response.success) {
        setSubmitSuccess(true);
        toast.success('Support ticket created successfully!');
        
        // Reset form after 3 seconds and redirect
        setTimeout(() => {
          navigate('/my-tickets');
        }, 3000);
      }
    } catch (error) {
      toast.error(error?.data?.error || error?.data?.message || 'Failed to create support ticket');
      console.error('Ticket creation error:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const found = priorities.find(p => p.value === priority);
    return found ? found.color : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-navigray/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeadset className="w-10 h-10 text-navigray" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">Please log in to access customer support.</p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ticket Submitted!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Your support ticket has been created successfully.
            </p>
            <div className="bg-navigray/5 rounded-xl p-6 mb-8 border border-navigray/20">
              <h3 className="font-semibold text-navigray mb-3">What happens next?</h3>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-navigray mr-2">✓</span>
                  Our support team will review your ticket
                </li>
                <li className="flex items-start">
                  <span className="text-navigray mr-2">✓</span>
                  You'll receive email updates on your ticket status
                </li>
                <li className="flex items-start">
                  <span className="text-navigray mr-2">✓</span>
                  Average response time: 24-48 hours
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/my-tickets"
                className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors"
              >
                View My Tickets
              </Link>
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    subject: '',
                    message: '',
                    priority: 'medium'
                  });
                }}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create Another Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with gradient - matching your theme */}
        <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaHeadset className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Customer Support</h1>
                  <p className="text-white/90 mt-2">
                    We're here to help! Submit a ticket and our support team will get back to you soon.
                  </p>
                </div>
              </div>
              <Link
                to="/my-tickets"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center backdrop-blur-sm border border-white/10"
              >
                <FaListAlt className="mr-2" />
                My Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-navigray hover:text-navigray-dark font-medium mb-6 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-navigray/5 to-navigray-dark/5">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaTicketAlt className="mr-3 text-navigray" />
              Create Support Ticket
            </h2>
            <p className="text-gray-600 mt-2">
              Please provide details about your issue or question
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Subject Field */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of your issue"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray transition-colors ${
                  formErrors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.subject && (
                <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.subject.length}/100 characters
              </p>
            </div>

            {/* Priority Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                      formData.priority === priority.value
                        ? 'border-navigray ring-2 ring-navigray/20'
                        : 'border-gray-200 hover:border-navigray/50'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${priority.color.split(' ')[0]}`}>
                      {priority.icon}
                    </span>
                    <span className="text-sm font-medium">{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Priority Indicator */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selected Priority:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(formData.priority)}`}>
                  {priorities.find(p => p.value === formData.priority)?.icon}
                  <span className="ml-2">
                    {priorities.find(p => p.value === formData.priority)?.label}
                  </span>
                </span>
              </div>
            </div>

            {/* Message Field */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Please describe your issue in detail..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray transition-colors resize-none ${
                  formErrors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.message && (
                <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.message.length}/1000 characters
              </p>
            </div>

            {/* Help Tips */}
            <div className="mb-8 p-4 bg-navigray/5 rounded-lg border border-navigray/20">
              <h4 className="font-medium text-navigray mb-2 flex items-center">
                <FaInfoCircle className="mr-2" />
                Tips for faster resolution:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Provide clear and detailed information about your issue</li>
                <li>Include any relevant error messages or screenshots (if applicable)</li>
                <li>Mention what you've already tried to resolve the issue</li>
                <li>Select the appropriate priority level based on urgency</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader small />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Support Options */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-navigray/10 rounded-lg flex items-center justify-center mb-4">
              <FaHeadset className="w-6 h-6 text-navigray" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Chat with our support team in real-time</p>
            <button className="text-navigray hover:text-navigray-dark font-medium text-sm flex items-center">
              Start Chat
              <FaChevronRight className="ml-1 w-3 h-3" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-navigray/10 rounded-lg flex items-center justify-center mb-4">
              <FaEnvelope className="w-6 h-6 text-navigray" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">support@vettkoneckt.com</p>
            <p className="text-xs text-gray-500">Response within 24-48 hours</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-navigray/10 rounded-lg flex items-center justify-center mb-4">
              <FaPhone className="w-6 h-6 text-navigray" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-4">+1 (800) 123-4567</p>
            <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;