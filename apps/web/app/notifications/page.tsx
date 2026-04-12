/**
 * Notifications Page
 * View and manage all user notifications
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Loader,
  Check,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    fetchNotifications(token, userId);
  }, []);

  async function fetchNotifications(token: string, userId: string) {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });

      const data = await response.json();

      if (data.success && data.data.notifications) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({ read: true }),
      });

      setNotifications((n) =>
        n.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function handleDelete(notificationId: string) {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });

      setNotifications((n) => n.filter((notif) => notif.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  async function handleMarkAllAsRead() {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({ markAll: true }),
      });

      setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </main>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_confirmation":
        return <CheckCircle className="text-green-600" size={24} />;
      case "payment_success":
        return <CheckCircle className="text-green-600" size={24} />;
      case "booking_update":
        return <AlertCircle className="text-blue-600" size={24} />;
      case "review_reply":
        return <Bell className="text-yellow-600" size={24} />;
      default:
        return <Info className="text-gray-600" size={24} />;
    }
  };

  const getNotificationBGColor = (type: string) => {
    switch (type) {
      case "booking_confirmation":
      case "payment_success":
        return "bg-green-50";
      case "booking_update":
        return "bg-blue-50";
      case "review_reply":
        return "bg-yellow-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notification
                  {unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-4 font-semibold border-b-2 transition ${
              filter === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-4 font-semibold border-b-2 transition ${
              filter === "unread"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 rounded-lg border ${
                  notification.read
                    ? "bg-white border-gray-200"
                    : `${getNotificationBGColor(notification.type)} border-l-4`
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check size={18} className="text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {notification.relatedId && (
                  <Link
                    href={`/bookings/${notification.relatedId}`}
                    className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Bell className="mx-auto text-gray-400 mb-4" size={40} />
            <p className="text-gray-600 text-lg mb-2">No notifications</p>
            <p className="text-gray-500 text-sm">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
