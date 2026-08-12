import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllActivities } from '../services/craService';
import { connectSocket } from '../services/socket';
import {
  Radio,
  RefreshCw,
  AlertCircle,
  Maximize,
  Minimize,
  Clock,
  Search,
  X,
  Play,
  Hash,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

// ─── Live stopwatch calculating strictly from DB start_time ──────────────────

const LiveStopwatch = ({ startTime, size = 'default' }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();

    const update = () => {
      const diffMs = Date.now() - start;
      if (diffMs < 0) {
        setElapsed('00:00:00');
        return;
      }
      const t = Math.floor(diffMs / 1000);
      const h = String(Math.floor(t / 3600)).padStart(2, '0');
      const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
      const s = String(t % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (size === 'large') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#e7f0fa] text-[#0064e0] rounded-xl border border-[#dde5ec] shadow-2xs">
        <Clock size={16} className="text-[#0064e0] animate-pulse" />
        <span className="text-xl sm:text-2xl font-mono font-black tracking-widest">{elapsed}</span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e7f0fa] text-[#0064e0] rounded-xl text-xs font-mono font-black border border-[#dde5ec] tracking-wider">
      <Clock size={13} className="text-[#0064e0] animate-pulse" />
      {elapsed}
    </span>
  );
};

const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ─── Modern Minimal Live Working Monitor Page ─────────────────────────────────

const CRALiveMonitor = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workingTasks, setWorkingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('rows'); // 'rows' | 'grid'
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // ─── Fetch Active Working Telemetry ─────────────────────────────────────────
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await getAllActivities({ status: 'IN_PROGRESS', limit: 100 });
      setWorkingTasks(res.data || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch live working CRA data:', err);
      setError('Failed to fetch live working telemetry');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + 10s auto-refresh fallback
  useEffect(() => {
    if (authLoading) return;
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveData, authLoading]);

  // ─── Socket.IO Real-Time Event Sync ─────────────────────────────────────────
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
    socket.on('cra_created', onRefresh);
    socket.on('cra_approved', onRefresh);
    socket.on('cra_rejected', onRefresh);
    if (socket.connected) setSocketConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('cra_started', onRefresh);
      socket.off('cra_finished', onRefresh);
      socket.off('cra_created', onRefresh);
      socket.off('cra_approved', onRefresh);
      socket.off('cra_rejected', onRefresh);
    };
  }, [fetchLiveData, authLoading]);

  // ─── Fullscreen API ──────────────────────────────────────────────────────────
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

  // Filter tasks by search
  const filteredTasks = workingTasks.filter((task) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = (task.employee_name || '').toLowerCase().includes(q);
    const matchTicket = (task.ticket_reference || '').toLowerCase().includes(q);
    const matchDesc = (task.description || '').toLowerCase().includes(q);
    return matchName || matchTicket || matchDesc;
  });

  // Auth guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f1f5f8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0064e0] border-t-transparent" />
      </div>
    );
  }

  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#f1f5f8] flex items-center justify-center p-6 text-[#1c2b33]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#dde5ec] shadow-2xl p-8 text-center">
          <AlertCircle size={48} className="text-rose-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-black mb-2">Access Denied</h2>
          <p className="text-xs text-[#5f7380] mb-6 font-semibold">Only managers or administrators can access the CRA Live Monitor.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-[#0064e0] hover:bg-[#004fb3] text-white font-bold rounded-xl transition-all shadow-electric-glow cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f1f5f8] text-[#1c2b33] flex flex-col font-sans">

      {/* ─── Top Telemetry Console Bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#1c2b33] text-white shadow-2xl border-b border-slate-700 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand & Live Active Count */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0064e0] flex items-center justify-center shadow-electric-glow">
              <Radio size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-heading font-black text-white tracking-tight">
                  WinSAP Live Working Monitor
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {workingTasks.length} Working Now
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Real-Time Employee Activity Telemetry</p>
            </div>
          </div>

          {/* Controls & Indicators */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search working employee or ticket..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0064e0] w-48 sm:w-64 font-medium"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('rows')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'rows' ? 'bg-[#0064e0] text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Large Rows View"
              >
                <TableIcon size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#0064e0] text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {/* Socket connection indicator */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              socketConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {socketConnected ? 'Live Sync' : 'Offline'}
            </div>

            {/* Manual Refresh */}
            <button
              onClick={fetchLiveData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0064e0] hover:bg-[#004fb3] text-white text-xs font-bold rounded-xl transition-all shadow-electric-glow cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>

            {/* Close tab button */}
            <button
              onClick={() => window.close()}
              className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Close Monitor"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Monitoring Body ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto px-6 py-8 flex flex-col">

        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3 text-rose-700 text-xs font-bold mb-6">
            <AlertCircle size={16} />
            {error}
            <button onClick={fetchLiveData} className="ml-auto underline hover:text-rose-900 cursor-pointer">Retry</button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Clock className="w-10 h-10 text-[#0064e0] animate-spin mb-3" />
            <p className="text-xs font-bold text-[#5f7380] animate-pulse">Connecting to live employee telemetry...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* ─── Modern Minimal Empty State ─────────────────────────────────────── */
          <div className="flex-1 bg-white rounded-3xl border border-[#dde5ec] shadow-premium-card p-12 flex flex-col items-center justify-center text-center my-auto min-h-[450px]">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-[#e7f0fa] border border-[#dde5ec] flex items-center justify-center text-[#0064e0] shadow-electric-glow">
                <Radio size={36} className="animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#1c2b33] tracking-tight">
              No employees are currently working
            </h2>
            <p className="text-xs sm:text-sm text-[#5f7380] mt-2 max-w-md font-semibold leading-relaxed">
              Telemetry active. The monitor is listening for real-time task activity and will update automatically as soon as an employee starts a task.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-[#f1f5f8] rounded-xl border border-[#dde5ec] text-xs font-bold text-[#5f7380]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Listening via Socket.IO WebSocket Stream
            </div>
          </div>
        ) : viewMode === 'rows' ? (
          /* ─── Large Modern Employee Monitoring Rows ───────────────────────────── */
          <div className="space-y-4">
            {filteredTasks.map((item, index) => {
              const initials = (item.employee_name || 'E')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-[#dde5ec] shadow-premium-sm hover:shadow-blue-glow hover:border-[#0082fb]/50 transition-all duration-200 animate-fade-in flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Left: Employee Avatar & Name */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white flex items-center justify-center font-heading font-black text-lg shadow-electric-glow flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-heading font-black text-[#1c2b33] uppercase tracking-tight">
                          {item.employee_name}
                        </h3>
                      </div>
                      {item.matricule && (
                        <p className="text-xs font-mono font-bold text-[#5f7380] mt-0.5">
                          Matricule: {item.matricule}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Current Task & Ticket */}
                  <div className="flex-1 min-w-0 space-y-1.5 border-l-0 lg:border-l border-[#dde5ec] lg:pl-6">
                    <div className="flex items-center gap-2">
                      {item.ticket_reference && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e7f0fa] text-[#0064e0] rounded-lg text-xs font-mono font-bold border border-[#dde5ec]">
                          <Hash size={11} />
                          {item.ticket_reference}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7380]">
                        Started at {formatTime(item.start_time)}
                      </span>
                    </div>

                    <p className="text-base font-semibold text-[#1c2b33] leading-snug truncate">
                      {item.description || 'Task in progress'}
                    </p>
                  </div>

                  {/* Right: Live Stopwatch & Status */}
                  <div className="flex items-center gap-4 flex-shrink-0 border-l-0 lg:border-l border-[#dde5ec] lg:pl-6 justify-between sm:justify-end">
                    <LiveStopwatch startTime={item.start_time} size="large" />

                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-400" />
                      WORKING
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Card Grid View ────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((item, index) => {
              const initials = (item.employee_name || 'E')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-[#dde5ec] shadow-premium-sm hover:shadow-blue-glow hover:border-[#0082fb]/50 transition-all duration-200 animate-fade-in flex flex-col justify-between"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#dde5ec]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1c2b33] to-[#0064e0] text-white flex items-center justify-center font-heading font-black text-base shadow-electric-glow">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-base text-[#1c2b33] uppercase">
                            {item.employee_name}
                          </h3>
                          {item.matricule && (
                            <p className="text-xs font-mono font-bold text-[#5f7380]">{item.matricule}</p>
                          )}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        WORKING
                      </div>
                    </div>

                    {/* Task Description */}
                    <div className="mb-4">
                      {item.ticket_reference && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e7f0fa] text-[#0064e0] rounded-lg text-xs font-mono font-bold border border-[#dde5ec] mb-2">
                          <Hash size={11} />
                          {item.ticket_reference}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-[#1c2b33] leading-snug line-clamp-3">
                        {item.description || 'Task in progress'}
                      </p>
                    </div>
                  </div>

                  {/* Live Timer Box */}
                  <div className="bg-[#f1f5f8] rounded-xl p-4 border border-[#dde5ec] flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7380] block">Started</span>
                      <span className="text-xs font-mono font-bold text-[#1c2b33]">{formatTime(item.start_time)}</span>
                    </div>
                    <LiveStopwatch startTime={item.start_time} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Minimal Console Footer ───────────────────────────────────────────── */}
      <div className="border-t border-[#dde5ec] bg-white text-[#5f7380] text-xs font-semibold px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#0064e0]" />
          <span>WinSAP CRA Telemetry Monitor • Read-Only Console</span>
        </div>
        <span>Auto-sync: WebSocket Stream • Timer linked to DB timestamp</span>
      </div>
    </div>
  );
};

export default CRALiveMonitor;
