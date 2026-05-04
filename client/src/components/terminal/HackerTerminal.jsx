import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_SEQUENCE = [
  'KRONOS OS v2.1.0 — Inicializando...',
  'Cargando modulos del kernel...',
  'Conectando a red KRONOS...',
  'Autenticando usuario...',
  'Terminal lista. Escribe "help" para ver comandos disponibles.'
];

const COMMANDS = {
  help: () => [
    'Comandos disponibles:',
    '  whoami         — Muestra tu perfil',
    '  feed           — Muestra tu feed reciente',
    '  trending       — Posts virales del momento',
    '  wallet         — Tu saldo de tokens KRO',
    '  ping <user>    — Enviar un ping a un usuario',
    '  clear          — Limpia la terminal',
    '  matrix         — Activa modo matrix',
    '  hack <target>  — (solo estetico)',
    '  version        — Version del sistema',
    '  exit           — Cerrar terminal'
  ],
  whoami: (user) => [
    `Usuario: @${user?.username || 'guest'}`,
    `ID: ${user?.id || 'N/A'}`,
    `Nivel de acceso: ${user?.role || 'user'}`,
    `Estado: ACTIVO`
  ],
  version: () => ['KRONOS OS v2.1.0', 'Build: 20260409', 'Kernel: KRONOS-CORE 3.14.159', 'Uptime: En linea'],
  feed: () => ['[API] Cargando feed...', 'Usa el modulo Feed para ver publicaciones completas.'],
  trending: () => ['[API] Cargando tendencias...', 'Conectando con motor de recomendaciones...'],
  wallet: (user) => [`[KRO] Balance: consultando...`, `Usa el modulo Tokens para ver tu saldo.`],
  matrix: () => ['MODO MATRIX ACTIVADO', 'Presiona cualquier tecla para salir...'],
  clear: () => null,
  exit: () => ['Cerrando sesion...', 'Hasta luego, agente.']
};

function MatrixRain({ active, onEnd }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*KRONOS';

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f0';
      ctx.font = '14px monospace';

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const interval = setInterval(draw, 33);
    const timeout = setTimeout(() => { clearInterval(interval); onEnd(); }, 5000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [active, onEnd]);

  return active ? (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
  ) : null;
}

function HackAnimation({ target, onEnd }) {
  const [lines, setLines] = useState([]);
  const steps = [
    `Escaneando objetivo: ${target}...`,
    'Buscando vulnerabilidades... [████░░░░░░]',
    'Buscando vulnerabilidades... [████████░░]',
    'Buscando vulnerabilidades... [██████████]',
    'ERROR: TARGET_IS_TOO_COOL_TO_HACK',
    'Retrocediendo... activando protocolo KRONOS...',
    `${target} ha sido... seguido en Instagram. 😂`
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLines(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onEnd, 1000);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-1">
      {lines.map((line, i) => (
        <div key={i} className={`text-sm ${line.includes('ERROR') ? 'text-red-400' : 'text-green-400'}`}>
          {line}
        </div>
      ))}
    </div>
  );
}

export default function HackerTerminal({ isOpen, onClose, user }) {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [hackTarget, setHackTarget] = useState(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && !booted) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < BOOT_SEQUENCE.length) {
          setLines(prev => [...prev, { type: 'system', text: BOOT_SEQUENCE[i] }]);
          i++;
        } else {
          clearInterval(interval);
          setBooted(true);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isOpen, booted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (booted && isOpen) inputRef.current?.focus();
  }, [booted, isOpen]);

  const addLines = useCallback((newLines, type = 'output') => {
    if (!newLines) return;
    setLines(prev => [...prev, ...newLines.map(text => ({ type, text }))]);
  }, []);

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const [command, ...args] = trimmed.split(' ');

    setLines(prev => [...prev, { type: 'input', text: `$ ${cmd}` }]);

    if (command === 'clear') {
      setLines([]);
      return;
    }
    if (command === 'exit') {
      addLines(['Cerrando sesion...']);
      setTimeout(onClose, 1000);
      return;
    }
    if (command === 'matrix') {
      setMatrixActive(true);
      return;
    }
    if (command === 'hack') {
      const target = args.join(' ') || 'desconocido';
      setHackTarget(target);
      return;
    }
    if (command === 'ping') {
      const target = args.join(' ') || '?';
      addLines([`Enviando ping a @${target}...`, 'PONG recibido — usuario activo', `Latencia: ${Math.floor(Math.random() * 50) + 5}ms`]);
      return;
    }

    if (COMMANDS[command]) {
      const result = COMMANDS[command](user);
      if (result) addLines(result);
    } else if (trimmed) {
      addLines([`Comando no encontrado: '${command}'. Escribe 'help' para ver comandos.`], 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl h-[500px] bg-black border border-green-500/30 rounded-lg flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,255,0,0.1)] relative"
          >
            <MatrixRain active={matrixActive} onEnd={() => setMatrixActive(false)} />

            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border-b border-green-500/20">
              <div className="flex gap-1.5">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-green-400/70 text-xs font-mono flex-1 text-center">KRONOS TERMINAL — {user?.username || 'guest'}@kronos</span>
            </div>

            {/* Output */}
            <div
              className="flex-1 overflow-y-auto p-4 font-mono text-sm cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((line, i) => (
                <div key={i} className={`leading-6 ${
                  line.type === 'input' ? 'text-cyan-400' :
                  line.type === 'error' ? 'text-red-400' :
                  line.type === 'system' ? 'text-yellow-400/70' :
                  'text-green-400'
                }`}>
                  {line.text}
                </div>
              ))}

              {hackTarget && (
                <HackAnimation target={hackTarget} onEnd={() => setHackTarget(null)} />
              )}

              {booted && !hackTarget && (
                <div className="flex items-center gap-1 text-green-400">
                  <span className="text-cyan-400">$</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <span className="animate-pulse">█</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
