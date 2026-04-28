import { useEffect, useState } from "react";
import {
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../Service/api"; // same file you already have

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
      fetchNotifications();
    } catch (err) {
      console.log("Mark read error:", err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      <div className="bg-white shadow rounded p-4">

        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found</p>
        ) : (
          <ul className="space-y-3">

            {notifications.map((n) => (
              <li
                key={n._id}
                className={`p-3 border rounded flex justify-between items-center ${
                  n.read ? "bg-gray-100" : "bg-yellow-50"
                }`}
              >

                {/* MESSAGE */}
                <div>
                  <p className="font-medium">{n.message}</p>

                  <small className="text-gray-500">
                    {n.read ? "Read" : "Unread"}
                  </small>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                </div>

              </li>
            ))}

          </ul>
        )}

      </div>
    </div>
  );
};

export default NotificationPage;