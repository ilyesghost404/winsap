import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLiveCraData } from '../services/craService';
import { connectSocket } from '../services/socket';
import {
  Activity, Play, Radio, RefreshCw, AlertCircle,
  Maximize, Minimize, Clock
} from 'lucide-react';

// ─── Live stopwatch ─────────────────────────────────────────────────────────

const LiveStopwatch = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();

    const update = () => {
      const diffMs = Date.now() - start;
      if (diffMs < 0) { setElapsed('00:00:00'); return; }
      const t = Math.floor(diffMs / 1000);
      const h = Math.floor(t / 3600);
      const m = Math.floor((t % 3600) / 60);
      const s = t % 60;
      const p = (n) => String(n).padStart(2, '0');
      setElapsed(`${p(h)}:${p(m)}:${p(s)}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-mono font-bold border border-blue-100">
      <Clock size={14} className="text-blue-500 animate-pulse" />
      {elapsed}
    </span>
  );
};

const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatRelative = (d) => {
  if (!d) return '';
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

// ─── Main Component ─────────────────────────────────────────────────────────

const CRALiveMonitor = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // ─── Fetch data ───────────────────────────────────────────────────────
  const fetchLiveData = useCallback(async () => {
    try {
      const result = await getLiveCraData();
      if (result.success) {
        setTasks(result.data || []);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch live CRA data:', err);
      setError('Failed to load live data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + 30s polling fallback
  useEffect(() => {
    if (authLoading) return;
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveData, authLoading]);

  // ─── Socket.IO ────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    const socket = connectSocket();
    if (!socket) return;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onRefresh = () => fetchLiveData();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('cra_started', onRefresh);
    socket.on('cra_finished', onRefresh);
    socket.on('cra_approved', onRefresh);
    socket.on('cra_auto_started', onRefresh);
    if (socket.connected) setSocketConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('cra_started', onRefresh);
      socket.off('cra_finished', onRefresh);
      socket.off('cra_approved', onRefresh);
      socket.off('cra_auto_started', onRefresh);
    };
  }, [fetchLiveData, authLoading]);

  // ─── Fullscreen API ───────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── Auth guard ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center">
          <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Only managers or administrators can access the CRA Live Monitor.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      {/* ─── Top bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200/60 shadow-sm px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">CRA Live Monitor</h1>
              <p className="text-xs text-slate-500 font-medium">Real-time active employee tasks</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Connection indicator */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {socketConnected ? 'Live Connected' : 'Disconnected'}
            </div>

            {/* Last update */}
            {lastUpdate && (
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Last update: {lastUpdate.toLocaleTimeString('fr-FR')}
              </span>
            )}

            {/* Refresh */}
            <button
              onClick={fetchLiveData}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/60 transition-all"
              title="Refresh now"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10"
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              {isFullscreen ? 'Exit Fullscreen' : '⛶ Full Screen'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6 flex flex-col">

        {/* Active count bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              In Progress
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200/40">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Play size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-slate-500">
              {tasks.length === 0
                ? 'No active tasks'
                : `${tasks.length} employee${tasks.length !== 1 ? 's' : ''} working`}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3 text-rose-700 text-sm mb-4">
            <AlertCircle size={16} />
            {error}
            <button onClick={fetchLiveData} className="ml-auto underline text-rose-800 hover:text-rose-600 text-xs font-semibold">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state matching main application */
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <Activity size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No Active Tasks</h3>
            <p className="text-sm text-slate-500 max-w-sm">Tasks will appear here in real-time when employees start working.</p>
          </div>
        ) : (
          /* Table matching Main Table of CRA page */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Employee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {task.employee_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{task.employee_name || 'Unknown'}</p>
                            {task.matricule && <p className="text-xs text-slate-400 font-mono">{task.matricule}</p>}
                          </div>
                        </div>
                      </td>
                      {/* Reference */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-bold border border-slate-200/40">
                          {task.ticket_reference || '—'}
                        </span>
                      </td>
                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-md truncate" title={task.description}>
                          {task.description || '—'}
                        </p>
                      </td>
                      {/* Start Time */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {formatTime(task.start_time)}
                      </td>
                      {/* Current Duration */}
                      <td className="px-6 py-4">
                        <LiveStopwatch startTime={task.start_time} />
                      </td>
                      {/* Last update */}
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {formatRelative(task.updated_at || task.start_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200/60 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>AbsenceFlow — CRA Live Monitor</span>
          <span>Auto-refresh every 30s • Socket.IO real-time</span>
        </div>
      </div>
    </div>
  );
};

export default CRALiveMonitor;
