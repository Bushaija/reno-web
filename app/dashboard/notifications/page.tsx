"use client";
import NotificationsTable from "@/components/features/notifications/notifications-table";

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Your Notifications</h1>
      <NotificationsTable />
    </div>
  );
}