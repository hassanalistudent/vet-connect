import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaTicketAlt,
    FaHeadset,
    FaClock,
    FaUser,
    FaEnvelope,
    FaExclamationCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaArrowLeft,
    FaPaperPlane,
    FaCalendarAlt,
    FaTag,
    FaFlag,
    FaReply,
    FaUserCog,
    FaCheck,
    FaSpinner,
    FaRegClock,
    FaSearch,
    FaTimesCircle as FaTimesCircleIcon
} from 'react-icons/fa';
import {
    useGetTicketByIdQuery,
    useUpdateTicketMutation,
    useAddResponseMutation
} from '../redux/api/customerSupportApiSlice';
import { useGetUsersQuery } from '../redux/api/userApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import moment from 'moment';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const isAdmin = userInfo?.role === 'Admin';

    const { data, isLoading, error, refetch } = useGetTicketByIdQuery(id);
    const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
    const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
    const [addResponse, { isLoading: isAddingResponse }] = useAddResponseMutation();

    const [responseMessage, setResponseMessage] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [assignedToName, setAssignedToName] = useState('');
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [responseError, setResponseError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const ticket = data?.ticket;

    // Get all admin users for assignment dropdown - using fullName
    const adminUsers = React.useMemo(() => {
        if (!usersData) return [];
        return usersData.filter(user => user.role === 'Admin');
    }, [usersData]);

    console.log('Admin Users:', usersData); // Debug log
    console.log('Admin ticket:', ticket); // Debug log

    // Set initial status when ticket loads
    useEffect(() => {
        if (ticket) {
            setNewStatus(ticket.status);
            if (ticket.assignedTo?._id) {
                setAssignedTo(ticket.assignedTo._id);
                setAssignedToName(ticket.assignedTo.fullName || ticket.assignedTo.fullName || '');
            }
        }
    }, [ticket]);

    // Filter admins based on search - using fullName
    const filteredAdmins = React.useMemo(() => {
        if (!searchTerm.trim()) return adminUsers;

        return adminUsers.filter(admin => {
            const fullName = admin.fullName || admin.fullName || '';
            const email = admin.email || '';
            const searchLower = searchTerm.toLowerCase();
            return fullName.toLowerCase().includes(searchLower) ||
                email.toLowerCase().includes(searchLower);
        });
    }, [adminUsers, searchTerm]);

    // Priority configurations
    const priorityConfig = {
        low: {
            label: 'Low',
            icon: <FaInfoCircle />,
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            badge: 'bg-blue-500',
            bg: 'bg-blue-50'
        },
        medium: {
            label: 'Medium',
            icon: <FaExclamationCircle />,
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            badge: 'bg-yellow-500',
            bg: 'bg-yellow-50'
        },
        high: {
            label: 'High',
            icon: <FaExclamationTriangle />,
            color: 'bg-orange-100 text-orange-700 border-orange-200',
            badge: 'bg-orange-500',
            bg: 'bg-orange-50'
        },
        urgent: {
            label: 'Urgent',
            icon: <FaExclamationTriangle />,
            color: 'bg-red-100 text-red-700 border-red-200',
            badge: 'bg-red-500',
            bg: 'bg-red-50'
        }
    };

    // Status configurations
    const statusConfig = {
        open: {
            label: 'Open',
            color: 'bg-green-100 text-green-700 border-green-200',
            badge: 'bg-green-500',
            bg: 'bg-green-50',
            icon: <FaRegClock />
        },
        'in-progress': {
            label: 'In Progress',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            badge: 'bg-blue-500',
            bg: 'bg-blue-50',
            icon: <FaSpinner />
        },
        resolved: {
            label: 'Resolved',
            color: 'bg-purple-100 text-purple-700 border-purple-200',
            badge: 'bg-purple-500',
            bg: 'bg-purple-50',
            icon: <FaCheckCircle />
        },
        closed: {
            label: 'Closed',
            color: 'bg-gray-100 text-gray-700 border-gray-200',
            badge: 'bg-gray-500',
            bg: 'bg-gray-50',
            icon: <FaTimesCircle />
        }
    };

    const getPriorityInfo = (priority) => {
        return priorityConfig[priority] || priorityConfig.medium;
    };

    const getStatusInfo = (status) => {
        return statusConfig[status] || {
            label: status,
            color: 'bg-gray-100 text-gray-700 border-gray-200',
            badge: 'bg-gray-500',
            bg: 'bg-gray-50',
            icon: <FaTag />
        };
    };

    const formatDate = (date) => {
        return moment(date).format('MMMM Do, YYYY [at] h:mm A');
    };

    const getTimeAgo = (date) => {
        return moment(date).fromNow();
    };

    const handleAddResponse = async (e) => {
        e.preventDefault();
        setResponseError('');

        // Validate that we have an ID
        if (!id) {
            setResponseError('Ticket ID is missing');
            return;
        }

        if (!responseMessage.trim()) {
            setResponseError('Response message cannot be empty');
            return;
        }

        try {
            console.log('Sending response for ticket ID:', id); // Debug log
            console.log('Response message:', responseMessage.trim()); // Debug log

            // FIX: Use ticketId instead of id to match the API expectation
            const response = await addResponse({
                ticketId: id,  // Changed from 'id' to 'ticketId'
                message: responseMessage.trim()
            }).unwrap();

            console.log('Response added successfully:', response);
            setResponseMessage('');
            refetch();
            toast.success('Response added successfully');
        } catch (error) {
            console.error('Add response error:', error);
            console.error('Error details:', error?.data); // Log the full error response
            setResponseError(error?.data?.error || error?.data?.message || 'Failed to add response');
        }
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();

        // Validate that we have an ID
        if (!id) {
            alert('Ticket ID is missing');
            return;
        }

        const updateData = {};
        if (newStatus !== ticket.status) updateData.status = newStatus;

        // Only include assignedTo if it's a valid ID
        if (assignedTo && assignedTo !== (ticket.assignedTo?._id || '')) {
            updateData.assignedTo = assignedTo;
        }

        if (Object.keys(updateData).length === 0) {
            setShowUpdateForm(false);
            return;
        }

        try {
            console.log('Updating ticket with ID:', id, updateData); // Debug log

            // FIX: Use ticketId instead of id to match the API expectation
            await updateTicket({
                ticketId: id,  // Changed from 'id' to 'ticketId' to match API
                ...updateData
            }).unwrap();

            setShowUpdateForm(false);
            setSearchTerm('');
            refetch();
            toast.success('Ticket updated successfully');
        } catch (error) {
            console.error('Update error:', error);
            alert(error?.data?.error || 'Failed to update ticket');
        }
    };

    const handleSelectAdmin = (adminId, adminName) => {
        if (!adminId) return;
        setAssignedTo(adminId);
        setAssignedToName(adminName);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleClearAssignment = () => {
        setAssignedTo('');
        setAssignedToName('');
        setSearchTerm('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (!userInfo) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-navigray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaHeadset className="w-10 h-10 text-navigray" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
                        <p className="text-gray-600 mb-8">Please log in to view this ticket.</p>
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

    if (isLoading || usersLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <Message variant="danger">
                        {error?.data?.error || "Ticket not found"}
                    </Message>
                    <button
                        onClick={() => navigate(isAdmin ? '/admin/tickets' : '/my-tickets')}
                        className="mt-4 inline-flex items-center text-navigray hover:text-navigray-dark"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Tickets
                    </button>
                </div>
            </div>
        );
    }

    // Check if user is authorized to view this ticket
    const isOwner = ticket.userId?._id === userInfo._id;
    if (!isAdmin && !isOwner) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <Message variant="danger">
                        You are not authorized to view this ticket.
                    </Message>
                    <button
                        onClick={() => navigate('/my-tickets')}
                        className="mt-4 inline-flex items-center text-navigray hover:text-navigray-dark"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to My Tickets
                    </button>
                </div>
            </div>
        );
    }

    const priority = getPriorityInfo(ticket.priority);
    const status = getStatusInfo(ticket.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FaTicketAlt className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Ticket Details</h1>
                                    <p className="text-white/90 mt-2">
                                        #{ticket._id.slice(-8)} • Created {getTimeAgo(ticket.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(isAdmin ? '/admin/tickets' : '/my-tickets')}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Ticket Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-navigray/5 to-navigray-dark/5">
                                <h2 className="text-2xl font-bold text-gray-900">{ticket.subject}</h2>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {ticket.message}
                                </p>
                                <div className="mt-4 text-sm text-gray-500 flex items-center">
                                    <FaClock className="mr-2" />
                                    Submitted {formatDate(ticket.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Responses/Replies */}
                        {/* Responses/Replies */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaReply className="mr-3 text-navigray" />
                                    Responses ({ticket.responses?.length || 0})
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {ticket.responses && ticket.responses.length > 0 ? (
                                    ticket.responses.map((response, index) => {
                                        // Check if the responder is the current user or an admin/support
                                        const isCurrentUser = response.responderId?._id === userInfo._id;
                                        const isSupport = response.responderId?.role === 'Admin' ||
                                            response.responderId?.role === 'Support';
                                        const responderName = response.responderId?.fullName || 'Unknown User';

                                        return (
                                            <div key={index} className="p-6 hover:bg-gray-50/80 transition-colors">
                                                <div className="flex items-start space-x-4">
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isSupport
                                                            ? 'bg-gradient-to-r from-navigray to-navigray-dark text-white'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {isSupport ? <FaHeadset /> : <FaUser />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <span className="font-medium text-gray-900">
                                                                    {responderName}
                                                                </span>
                                                                {isSupport && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-navigray/10 text-navigray rounded-full text-xs font-medium">
                                                                        Support
                                                                    </span>
                                                                )}
                                                                {isCurrentUser && !isSupport && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(response.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                            {response.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaReply className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600">No responses yet</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {isAdmin
                                                ? 'Be the first to respond to this ticket'
                                                : 'Support will respond to your ticket soon'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Response Form - Admins can respond */}
                        {isAdmin && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-8 py-6 border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900">Add Response</h3>
                                </div>
                                <div className="p-8">
                                    <form onSubmit={handleAddResponse}>
                                        <textarea
                                            value={responseMessage}
                                            onChange={(e) => setResponseMessage(e.target.value)}
                                            placeholder="Type your response here..."
                                            rows="4"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray transition-colors resize-none ${responseError ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {responseError && (
                                            <p className="mt-2 text-sm text-red-600">{responseError}</p>
                                        )}
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isAddingResponse}
                                                className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                                            >
                                                {isAddingResponse ? (
                                                    <>
                                                        <Loader small />
                                                        <span className="ml-2">Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaPaperPlane className="mr-2" />
                                                        Send Response
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Ticket Info & Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <FaTag className="mr-2 text-navigray" />
                                    Ticket Status
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className={`p-4 rounded-xl ${status.bg} border ${status.color.split(' ')[2]}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-600">Current Status</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                            {status.icon}
                                            <span className="ml-1">{status.label}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Priority</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priority.color}`}>
                                            {priority.icon}
                                            <span className="ml-1">{priority.label}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <FaUser className="mr-2 text-navigray" />
                                    User Information
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{ticket.userId?.fullName || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{ticket.userId?.email || 'No email'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">User ID</p>
                                        <p className="text-sm text-gray-600 font-mono">{ticket.userId?._id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <FaUserCog className="mr-2 text-navigray" />
                                    Assignment
                                </h3>
                            </div>
                            <div className="p-6">
                                {ticket.assignedTo ? (
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned To</p>
                                            <p className="font-medium text-gray-900">{ticket.assignedTo.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="text-gray-600">{ticket.assignedTo.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">Not assigned yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <FaClock className="mr-2 text-navigray" />
                                    Timeline
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">Created</p>
                                            <p className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</p>
                                        </div>
                                    </div>
                                    {ticket.updatedAt !== ticket.createdAt && (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                                <p className="text-xs text-gray-500">{formatDate(ticket.updatedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {ticket.responses && ticket.responses.length > 0 && (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">Last Response</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(ticket.responses[ticket.responses.length - 1].createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900 flex items-center">
                                        <FaFlag className="mr-2 text-navigray" />
                                        Admin Actions
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {!showUpdateForm ? (
                                        <button
                                            onClick={() => setShowUpdateForm(true)}
                                            className="w-full px-4 py-3 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors"
                                        >
                                            Update Ticket
                                        </button>
                                    ) : (
                                        <form onSubmit={handleUpdateTicket} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assign To
                                                </label>

                                                {/* Search and select admin */}
                                                <div className="relative">
                                                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-navigray focus-within:border-navigray">
                                                        <span className="pl-3 text-gray-400">
                                                            <FaSearch />
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={searchTerm}
                                                            onChange={(e) => {
                                                                setSearchTerm(e.target.value);
                                                                setShowDropdown(true);
                                                            }}
                                                            onFocus={() => setShowDropdown(true)}
                                                            placeholder="Search admin by name or email..."
                                                            className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none"
                                                        />
                                                    </div>

                                                    {/* Search Results Dropdown */}
                                                    {showDropdown && adminUsers.length > 0 && (
                                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                            {filteredAdmins.map((admin) => {
                                                                const adminName = admin.fullName || admin.fullName || '';
                                                                return (
                                                                    <button
                                                                        key={admin._id}
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectAdmin(admin._id, adminName);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left hover:bg-navigray/10 focus:outline-none border-b border-gray-100 last:border-0"
                                                                    >
                                                                        <div className="font-medium text-gray-900">{adminName}</div>
                                                                        <div className="text-sm text-gray-500">{admin.email}</div>
                                                                    </button>
                                                                );
                                                            })}
                                                            {filteredAdmins.length === 0 && (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    No admins match "{searchTerm}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selected Admin Display */}
                                                {assignedToName && (
                                                    <div className="mt-2 flex items-center justify-between p-2 bg-navigray/5 rounded-lg">
                                                        <div className="flex items-center">
                                                            <FaUserCog className="text-navigray mr-2" />
                                                            <span className="text-sm text-gray-700">{assignedToName}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={handleClearAssignment}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <FaTimesCircleIcon />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Show message if no admins found */}
                                                {adminUsers.length === 0 && (
                                                    <p className="mt-2 text-sm text-yellow-600">No admin users found in the system</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={isUpdating}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                                                >
                                                    {isUpdating ? 'Updating...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowUpdateForm(false);
                                                        setSearchTerm('');
                                                        setShowDropdown(false);
                                                        // Reset to original values
                                                        setNewStatus(ticket.status);
                                                        setAssignedTo(ticket.assignedTo?._id || '');
                                                        setAssignedToName(ticket.assignedTo?.fullName || ticket.assignedTo?.fullName || '');
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;