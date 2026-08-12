import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, RefreshCw, Clock, Users, CheckCircle2, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { createQr, getTodayAttendance } from '../services/presenceService';

const AttendanceVerification = () => {
  const [qrToken, setQrToken] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);

  const countdownTimerRef = useRef(null);
  const logsPollTimerRef = useRef(null);

  const generateNewQR = async () => {
    try {
      setQrLoading(true);
      const data = await createQr();
      if (data.success) {
        setQrToken(data.qrToken);
        const expiry = new Date(data.expiresAt);
        setExpiresAt(expiry);

        const diffMs = expiry.getTime() - Date.now();
        const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
        setTimeLeft(diffSecs);
      }
    } catch (error) {
      console.error('Failed to generate QR session:', error);
      toast.error('Failed to generate verification QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const fetchTodayLogs = async () => {
    try {
      const response = await getTodayAttendance({ page: 1, limit: 100, search: '' });
      const checkedInToday = (response.data || []).filter((r) => r.check_in);
      setLogs(checkedInToday);
    } catch (error) {
      console.error('Failed to fetch today logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    generateNewQR();
    fetchTodayLogs();

    logsPollTimerRef.current = setInterval(fetchTodayLogs, 10000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (logsPollTimerRef.current) clearInterval(logsPollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewQR();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimerRef.current);
  }, [expiresAt]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    try {
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      return new Date(timeStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const qrPayload = JSON.stringify({
    token: qrToken,
    type: 'ATTENDANCE_CHECKIN',
    issuedAt: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AbsenceFlow Kiosk Portal</h1>
            <p className="text-xs text-slate-500">Self-Service Workforce Check-In System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">Kiosk Online</span>
        </div>
      </div>

      {/* Main Kiosk Content */}
      <div className="max-w-5xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: QR Code Scanner */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
            <QrCode size={24} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Scan QR Code to Check In</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Hold your mobile device camera up to the dynamic QR token to record your arrival.
          </p>

          {/* QR Code Container */}
          <div className="my-6 p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 shadow-inner flex items-center justify-center relative">
            {qrLoading || !qrToken ? (
              <div className="w-52 h-52 flex items-center justify-center">
                <LoadingSpinner size="md" text="Refreshing QR..." />
              </div>
            ) : (
              <QRCodeCanvas
                value={qrPayload}
                size={208}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.ico',
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            )}
          </div>

          {/* Countdown & Refresh Action */}
          <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Expires in <strong className="text-blue-600 font-mono">{timeLeft}s</strong>
              </span>
            </div>

            <Button
              size="xs"
              variant="secondary"
              icon={RefreshCw}
              onClick={generateNewQR}
              loading={qrLoading}
            >
              Refresh Token
            </Button>
          </div>
        </div>

        {/* Right Side: Live Arrivals Feed */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col h-full max-h-[460px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Today's Check-In Feed</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {logs.length} Logged
            </span>
          </div>

          {logsLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <LoadingSpinner size="sm" text="Polling arrival feed..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <Users size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-600">No arrivals recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Arrivals will stream live on this kiosk in real-time.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 -mx-6 px-6 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.employee_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs flex-shrink-0">
                      {(log.first_name?.[0] || 'U') + (log.last_name?.[0] || '')}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {log.first_name} {log.last_name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{log.matricule}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {formatTime(log.check_in)}
                    </span>
                    <StatusBadge status="completed" type="dot" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400">
        AbsenceFlow Workforce Verification System · TLS 1.3 AES-256 Bit Secure Connection
      </div>
    </div>
  );
};

export default AttendanceVerification;
