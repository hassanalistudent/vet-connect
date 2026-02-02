// src/pages/OwnerActions.jsx - FULL UPGRADE
import { toast } from "react-toastify";

const OwnerActions = ({ appointment, appointmentId, ownerResponse, markPaid, refetch }) => {
  // ✅ Owner logic: Can act on Scheduled OR Rescheduled
  const canOwnerAct = ["Scheduled", "Rescheduled"].includes(appointment?.status);
  const isPaid = appointment?.isPaid || false;
  const isCompleted = appointment?.status === "Completed";

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

  // ✅ Status-based conditional rendering
  const renderStatus = () => {
    if (isCompleted) {
      return (
        <div className="col-span-full p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-700 mb-2">Appointment Completed</h3>
          <p className="text-gray-600 text-lg">Doctor has completed the appointment</p>
        </div>
      );
    }

    if (!canOwnerAct) {
      return (
        <div className="col-span-full p-12 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl border-2 border-yellow-200 text-center flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-2xl font-bold text-yellow-700 mb-2">
            Status: {appointment?.status}
          </h3>
          <p className="text-gray-600 text-lg">Waiting for doctor action</p>
        </div>
      );
    }

    // ✅ ACTIVE STATE: Owner can act
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[380px]">
        {/* CANCEL - Left */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl shadow-xl border-2 border-red-200 h-full flex flex-col justify-center hover:shadow-2xl transition-all">
          <h4 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-3">
            ❌ Cancel Appointment
          </h4>
          <button
            onClick={() => handleOwnerResponse("Cancelled")}
            disabled={!canOwnerAct}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            Cancel Appointment
          </button>
          <p className="text-sm text-red-700 mt-4 text-center">Cancel before doctor accepts</p>
        </div>

        {/* ACCEPT RESCHEDULE - Center */}
        {appointment?.status === "Rescheduled" && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-xl border-2 border-blue-200 h-full flex flex-col justify-center hover:shadow-2xl transition-all">
            <h4 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-3">
              ✅ Accept Reschedule
            </h4>
            <button
              onClick={() => handleOwnerResponse("Accepted")}
              disabled={!canOwnerAct}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              Accept New Time
            </button>
            <p className="text-sm text-blue-700 mt-4 text-center">Doctor rescheduled - confirm new time</p>
          </div>
        )}

        {/* PAYMENT - Right */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl shadow-xl border-2 border-emerald-200 h-full flex flex-col justify-center hover:shadow-2xl transition-all">
          <h4 className="text-xl font-bold text-emerald-700 mb-6 flex items-center gap-3">
            💳 {isPaid ? "Payment Confirmed" : "Mark as Paid"}
          </h4>
          <button
            onClick={handleMarkPaid}
            disabled={isCompleted}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            {isPaid ? "Mark as Unpaid" : "Mark as Paid"}
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isPaid 
                ? "bg-green-200 text-green-800" 
                : "bg-yellow-200 text-yellow-800"
            }`}>
              {isPaid ? "PAID" : "PENDING"}
            </span>
          </button>
          <p className="text-sm text-emerald-700 mt-4 text-center">
            Toggle payment status
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-12 p-8 bg-gradient-to-br from-orange-50 via-pink-50 to-red-50 border-4 border-dashed border-orange-300 rounded-3xl shadow-2xl">
      <h3 className="text-3xl font-bold text-orange-700 mb-8 flex items-center gap-4">
        🐾 Owner Control Panel
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          appointment?.status === "Scheduled" ? "bg-yellow-100 text-yellow-800" :
          appointment?.status === "Rescheduled" ? "bg-blue-100 text-blue-800" :
          appointment?.status === "Completed" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {appointment?.status || "Scheduled"}
        </span>
      </h3>
      
      <div className="grid">
        {renderStatus()}
      </div>
    </div>
  );
};

export default OwnerActions;
