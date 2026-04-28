import { useEffect, useState, useRef } from "react";
import {
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../Service/Api";
import { FiBell, FiCheckCircle, FiTrash2, FiMail, FiClock, FiAlertCircle } from "react-icons/fi";
import { FaEnvelopeOpen } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.log("Fetch notifications error:", err);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ================= MARK AS READ =================
  const handleMarkRead = async (id) => {
    try {
      await updateNotification(id, { read: true });
      toast.success("Notification marked as read");
      fetchNotifications();
    } catch (err) {
      console.log("Mark read error:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id, message) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: `This notification will be deleted permanently.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteNotification(id);
            fetchNotifications();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Notification deleted successfully.",
              "success"
            );
          } catch (error) {
            console.log("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete notification.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Notification is safe 🙂",
            "error"
          );
        }
      });
  };

  const getNotificationIcon = (read) => {
    return read ? <FaEnvelopeOpen className="w-5 h-5 text-gray-400" /> : <FiMail className="w-5 h-5 text-primary" />;
  };

  const getTimeAgo = (date) => {
    if (!date) return "Unknown time";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Calculate statistics
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaBell className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Notifications</h1>
            <p className="text-gray-500 text-sm">Manage your system notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
              Unread: {unreadCount}
            </div>
            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold">
              Read: {readCount}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[800px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1fr_auto] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Notification</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col">
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBell className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No notifications found</p>
                  <p className="text-sm text-gray-400 mt-1">When you receive notifications, they'll appear here</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={notification._id}
                    className={`grid grid-cols-[1fr_auto] gap-4 items-center px-6 py-4 border-b border-gray-100 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    } ${
                      !notification.read ? "border-l-4 border-l-primary shadow-sm" : ""
                    }`}
                  >
                    {/* Notification Content */}
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${!notification.read ? 'bg-primary/10' : 'bg-gray-100'}`}>
                        {getNotificationIcon(notification.read)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.message || "No message content"}
                          </p>
                          {!notification.read && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            <span>{getTimeAgo(notification.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.read ? (
                              <>
                                <FiCheckCircle className="w-3 h-3 text-success" />
                                <span className="text-success">Read</span>
                              </>
                            ) : (
                              <>
                                <FiAlertCircle className="w-3 h-3 text-warning" />
                                <span className="text-warning">Unread</span>
                              </>
                            )}
                          </div>
                          {notification.createdAt && (
                            <div className="text-gray-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification._id)}
                          className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                          title="Mark as Read"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id, notification.message)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Notification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Total count */}
        {notifications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
            <span>Total Notifications: {notifications.length}</span>
            <div className="flex gap-2">
              <span className="text-primary">📬 {unreadCount} unread</span>
              <span className="text-gray-500">📖 {readCount} read</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">TOTAL NOTIFICATIONS</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {notifications.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time notifications</p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <FiBell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">UNREAD</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {unreadCount}
              </p>
              <p className="text-xs text-orange-600 mt-1">Awaiting your attention</p>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
              <FiMail className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">READ</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {readCount}
              </p>
              <p className="text-xs text-green-600 mt-1">Already reviewed</p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <FaEnvelopeOpen className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;