import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
  FaEye,
  FaArrowLeft,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
  FaChevronRight,
  FaCalendarAlt
} from 'react-icons/fa';
import { useGetUserTicketsQuery } from '../redux/api/customerSupportApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import moment from 'moment';

const MyTickets = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, error, refetch } = useGetUserTicketsQuery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const tickets = data?.tickets || [];
  const count = data?.count || 0;

  // Priority definitions with colors and icons
  const priorityConfig = {
    low: { 
      label: 'Low', 
      icon: <FaInfoCircle />, 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      badge: 'bg-blue-500'
    },
    medium: { 
      label: 'Medium', 
      icon: <FaExclamationCircle />, 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      badge: 'bg-yellow-500'
    },
    high: { 
      label: 'High', 
      icon: <FaExclamationTriangle />, 
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      badge: 'bg-orange-500'
    },
    urgent: { 
      label: 'Urgent', 
      icon: <FaExclamationTriangle />, 
      color: 'bg-red-100 text-red-700 border-red-200',
      badge: 'bg-red-500'
    }
  };

  // Status definitions
  const statusConfig = {
    open: { label: 'Open', color: 'bg-green-100 text-green-700 border-green-200', badge: 'bg-green-500' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', badge: 'bg-blue-500' },
    resolved: { label: 'Resolved', color: 'bg-purple-100 text-purple-700 border-purple-200', badge: 'bg-purple-500' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-200', badge: 'bg-gray-500' }
  };

  // Filter and sort tickets
  const filteredAndSortedTickets = React.useMemo(() => {
    let filtered = [...tickets];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = moment(a.createdAt);
      const dateB = moment(b.createdAt);
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else if (sortOrder === 'oldest') {
        return dateA - dateB;
      } else if (sortOrder === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      }
      return 0;
    });
    
    return filtered;
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortOrder]);

  const getPriorityInfo = (priority) => {
    return priorityConfig[priority] || priorityConfig.medium;
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', badge: 'bg-gray-500' };
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY [at] h:mm A');
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
            <p className="text-gray-600 mb-8">Please log in to view your support tickets.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Message variant="danger">
            {error?.data?.message || "Failed to load tickets"}
          </Message>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaTicketAlt className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Support Tickets</h1>
                  <p className="text-white/90 mt-2">
                    You have {count} {count === 1 ? 'ticket' : 'tickets'} total
                  </p>
                </div>
              </div>
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-navigray rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
              >
                <FaHeadset className="mr-2" />
                New Ticket
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray appearance-none bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (Highest)</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 bg-navigray/10 text-navigray rounded text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-navigray/10 text-navigray rounded text-xs">
                    Status: {statusFilter}
                  </span>
                )}
                {priorityFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-navigray/10 text-navigray rounded text-xs">
                    Priority: {priorityFilter}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="text-sm text-navigray hover:text-navigray-dark"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Tickets List */}
        {filteredAndSortedTickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTicketAlt className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tickets match your search criteria'
                : "You haven't created any support tickets yet"}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors"
            >
              <FaHeadset className="mr-2" />
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTickets.map((ticket) => {
              const priority = getPriorityInfo(ticket.priority);
              const status = getStatusInfo(ticket.status);
              
              return (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-navigray/30 transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header with Priority and Status */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        {/* Priority Badge */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                          {priority.icon}
                          <span className="ml-1">{priority.label}</span>
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.badge} mr-1.5`}></span>
                          {status.label}
                        </span>

                        {/* Ticket ID */}
                        <span className="text-xs text-gray-500">
                          #{ticket._id.slice(-6)}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-1.5 text-gray-400" />
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>

                    {/* Subject */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-navigray transition-colors">
                      {ticket.subject}
                    </h3>

                    {/* Message Preview */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {ticket.message}
                    </p>

                    {/* Footer with Meta Info */}
                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm">
                        {/* Created time */}
                        <span className="text-gray-500 flex items-center">
                          <FaClock className="mr-1.5 text-gray-400" />
                          {getTimeAgo(ticket.createdAt)}
                        </span>

                        {/* Assigned To */}
                        {ticket.assignedTo && (
                          <span className="text-gray-500 flex items-center">
                            <FaUser className="mr-1.5 text-gray-400" />
                            {ticket.assignedTo.name || 'Support Agent'}
                          </span>
                        )}

                        {/* Last Updated */}
                        {ticket.updatedAt !== ticket.createdAt && (
                          <span className="text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1.5 text-gray-400" />
                            Updated {getTimeAgo(ticket.updatedAt)}
                          </span>
                        )}
                      </div>

                      {/* View Details */}
                      <span className="inline-flex items-center text-navigray font-medium text-sm group-hover:translate-x-1 transition-transform">
                        View Details
                        <FaChevronRight className="ml-1 w-3 h-3" />
                      </span>
                    </div>

                    {/* Response indicator if there are replies */}
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center text-sm text-green-700">
                          <FaCheckCircle className="mr-2 w-4 h-4" />
                          <span>Support has responded to this ticket</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Results count */}
            <div className="text-center text-sm text-gray-500 pt-4">
              Showing {filteredAndSortedTickets.length} of {tickets.length} tickets
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {tickets.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <FaTicketAlt className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Open</div>
                  <div className="text-xl font-semibold">
                    {tickets.filter(t => t.status === 'open').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FaExclamationCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">In Progress</div>
                  <div className="text-xl font-semibold">
                    {tickets.filter(t => t.status === 'in-progress').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FaCheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Resolved</div>
                  <div className="text-xl font-semibold">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Urgent</div>
                  <div className="text-xl font-semibold">
                    {tickets.filter(t => t.priority === 'urgent').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;