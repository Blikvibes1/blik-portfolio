// js/terminal.js — the interactive hero terminal: typed commands, command tabs,
// and the scrolling command log.

const BlikTerminal = (() => {
  let heroLog;

  function logLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    heroLog.appendChild(div);
    heroLog.scrollTop = heroLog.scrollHeight;
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: BlikMatrix.reduceMotion ? 'auto' : 'smooth' }), 300);
  }

  const commands = {
    help: () => {
      logLine('Available commands:', 'out');
      ['help', 'skills', 'about', 'projects', 'ailab', 'experience', 'contact', 'commands', 'clear']
        .forEach(c => logLine('  · ' + c));
    },
    commands: () => commands.help(),
    skills: () => { logLine('Redirecting to skills matrix...', 'out'); scrollToId('about'); },
    about: () => { logLine('Loading about.log...', 'out'); scrollToId('about'); },
    projects: () => {
      logLine('Listing ./projects ...', 'out');
      if (typeof BlikProjects !== 'undefined' && BlikProjects.projects) {
        BlikProjects.projects.forEach(pr => logLine('  · ./' + pr.name, 'out'));
      }
      scrollToId('projects');
    },
    ailab: () => { logLine('Launching AI Prompt Lab...', 'out'); scrollToId('ai-lab'); },
    experience: () => { logLine('Tailing experience.log...', 'out'); scrollToId('experience'); },
    contact: () => { logLine('Opening uplink...', 'out'); scrollToId('contact'); },
    clear: () => { heroLog.innerHTML = ''; }
  };

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    logLine('BLIK@SYSTEM:~$ ' + raw);
    if (commands[cmd]) {
      commands[cmd]();
    } else {
      logLine("command not found: '" + cmd + "' — type 'help'", 'err');
    }
  }

  function init() {
    heroLog = document.getElementById('heroLog');
    const cmdForm = document.getElementById('cmdForm');
    const cmdInput = document.getElementById('cmdInput');

    BlikType.typeInto(document.getElementById('welcomeType'),
      "Welcome, visitor. Type 'help' for available commands.", 28);

    cmdForm.addEventListener('submit', e => {
      e.preventDefault();
      runCommand(cmdInput.value);
      cmdInput.value = '';
    });

    document.querySelectorAll('.cmd-tab[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => runCommand(btn.dataset.cmd));
    });
  }

  return { init, runCommand };
})();
