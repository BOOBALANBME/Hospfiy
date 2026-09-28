import React from 'react';
import { Bell, CheckCheck, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useHospital();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Hospital Operational Alerts & Internal Dispatch</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time automated alerts: bed status transitions, cleaning requests, critical admissions, and vital threshold notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          const isDanger = notif.priority === 'urgent' || notif.type === 'ADMIN_ALERT';
          const isWarning = notif.priority === 'high' || notif.type === 'CLEANING_REQUIRED';
          const isSuccess = notif.type === 'BED_AVAILABLE';

          return (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                !notif.read
                  ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-100'
                  : 'bg-slate-50/60 border-slate-200 opacity-80'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDanger
                    ? 'bg-rose-100 text-rose-700'
                    : isWarning
                    ? 'bg-amber-100 text-amber-700'
                    : isSuccess
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isDanger || isWarning ? (
                  <AlertCircle className="w-4 h-4" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900">{notif.title}</h4>
                  <span className="font-mono text-[11px] text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" title="Unread" />
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No system notifications recorded.
          </div>
        )}
      </div>
    </div>
  );
};
