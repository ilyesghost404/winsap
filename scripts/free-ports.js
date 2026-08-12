const { execSync } = require('child_process');

const PORTS = [5000, 5001, 5173, 5174];

function getPidsOnPort(port) {
  const isWindows = process.platform === 'win32';
  const pids = new Set();

  try {
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
          const pid = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(pid) && pid > 0 && pid !== process.pid && pid !== process.ppid) {
            pids.add(pid);
          }
        }
      }
    } else {
      // Linux / macOS: Use lsof or fuser or ss
      try {
        const output = execSync(`lsof -ti :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        output.trim().split('\n').forEach((line) => {
          const pid = parseInt(line.trim(), 10);
          if (!isNaN(pid) && pid > 0 && pid !== process.pid && pid !== process.ppid) {
            pids.add(pid);
          }
        });
      } catch {
        // lsof might fail if no process on port, try fuser / ss as fallback
        try {
          const fuserOutput = execSync(`fuser ${port}/tcp 2>/dev/null`, { encoding: 'utf8' });
          fuserOutput.trim().split(/\s+/).forEach((line) => {
            const pid = parseInt(line.trim(), 10);
            if (!isNaN(pid) && pid > 0 && pid !== process.pid && pid !== process.ppid) {
              pids.add(pid);
            }
          });
        } catch {
          // No process on port
        }
      }
    }
  } catch {
    // Port is free
  }

  return Array.from(pids);
}

function freePorts() {
  console.log('🔍 Checking for occupied ports before launch...');
  let killedAny = false;

  for (const port of PORTS) {
    const pids = getPidsOnPort(port);
    if (pids.length > 0) {
      console.log(`⚠️  Port ${port} is occupied by PID(s): ${pids.join(', ')}. Terminating...`);
      for (const pid of pids) {
        try {
          if (process.platform === 'win32') {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } else {
            // Send SIGTERM, then fallback to SIGKILL
            try {
              process.kill(pid, 'SIGTERM');
            } catch {
              // Ignore
            }
            // Ensure killed
            try {
              process.kill(pid, 'SIGKILL');
            } catch {
              // Ignore
            }
          }
          console.log(`   ✓ Successfully stopped process ${pid} on port ${port}`);
          killedAny = true;
        } catch (err) {
          console.warn(`   ✗ Could not terminate process ${pid}:`, err.message);
        }
      }
    }
  }

  if (killedAny) {
    // Give OS 500ms to release sockets cleanly
    try {
      execSync('sleep 0.5', { stdio: 'ignore' });
    } catch {
      // Ignore
    }
    console.log('✅ Ports freed successfully. Ready to start services.');
  } else {
    console.log('✅ All service ports (5000, 5001, 5173) are clear.');
  }
}

freePorts();
