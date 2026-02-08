import { toast } from "react-toastify";

const OwnerActions = ({ appointment, appointmentId, ownerResponse, markPaid, refetch }) => {
  const canOwnerAct = ["Rescheduled", "Accepted"].includes(appointment?.status);
  const isPaid = appointment?.isPaid || false;
  const isCompleted = appointment?.status === "Completed";
  const isVideoCall = appointment?.appointmentType === "Video Call";
  const isRescheduled = appointment?.status === "Rescheduled";

  const handleOwnerResponse = async (status) => {
    try {
      await ownerResponse({
        appointmentId,
        status,
      }).unwrap();
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid({
        appointmentId,
        isPaid: !isPaid,
      }).unwrap();
      toast.success(isPaid ? "Marked as unpaid" : "Marked as paid");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const renderStatus = () => {
    if (isCompleted) {
      return (
        <div className="w-full bg-gray-50 rounded-xl p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Appointment Completed</h3>
          <p className="text-gray-600 text-center">This appointment has been completed</p>
        </div>
      );
    }

    if (!canOwnerAct) {
      return (
        <div className="w-full bg-yellow-50 rounded-xl p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Status: {appointment?.status}</h3>
          <p className="text-gray-600 text-center">Waiting for doctor's action</p>
        </div>
      );
    }

    // If paid, only show Video Call option if applicable
    if (isPaid) {
      return (
        <div className="w-full space-y-6">
          {/* Video Call Section */}
          {isVideoCall && appointment?.status === "Accepted" && (
            <div className="w-full bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Call
              </h4>
              <button
                onClick={() => window.location.href = `/${appointmentId}/video`}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Join Video Call
              </button>
              <p className="text-xs text-purple-600 mt-2 text-center">
                Available at appointment time: {appointment.appointmentTime}
              </p>
            </div>
          )}
          
          {/* Payment Status Card */}
          <div className="w-full bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-green-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Payment Status
              </h4>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                PAID
              </span>
            </div>
            <p className="text-green-600 text-center">Payment has been confirmed</p>
          </div>
        </div>
      );
    }

    // If NOT paid, show all actions stacked vertically
    return (
      <div className="w-full space-y-6">
        {/* Payment Action - Always at top */}
        <div className="w-full bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-green-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment Status
            </h4>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
              PENDING
            </span>
          </div>
          <button
            onClick={handleMarkPaid}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Mark as Paid
          </button>
          <p className="text-sm text-green-600 mt-3 text-center">
            Mark payment as completed
          </p>
        </div>

        {/* Appointment Actions - Stacked vertically */}
        <div className="w-full space-y-6">
          {/* Cancel Appointment - Always visible if not paid */}
          <div className="w-full bg-red-50 rounded-xl p-6 border border-red-200">
            <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Appointment
            </h4>
            <button
              onClick={() => handleOwnerResponse("Cancelled")}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel Appointment
            </button>
            <p className="text-sm text-red-600 mt-3 text-center">
              Cancel this appointment
            </p>
          </div>

          {/* Accept Reschedule (Only if status is Rescheduled) */}
          {isRescheduled && (
            <div className="w-full bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Accept Reschedule
              </h4>
              <button
                onClick={() => handleOwnerResponse("Accepted")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Accept New Time
              </button>
              <p className="text-sm text-blue-600 mt-3 text-center">
                Accept doctor's rescheduled time
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Actions
      </h3>
      {renderStatus()}
    </div>
  );
};

export default OwnerActions;