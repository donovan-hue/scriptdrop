// ═══════════════════════════════════════════════════════════════
// SERVIDOR SUPER-APP - Con soporte para Auth (en memoria)
// ═══════════════════════════════════════════════════════════════

const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 5000;

// Almacenamiento en memoria
const users = {};
const sessions = {};

// Ayudantes
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      callback({});
    }
  });
}

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return true;
  }
  return false;
}

// Rutas
const routes = {
  'GET /api/health': (req, res) => {
    sendJson(res, 200, {
      message: '✓ Server is running',
      timestamp: new Date(),
      port: PORT,
      users: Object.keys(users).length,
      endpoints: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile',
        'POST /api/auth/logout'
      ]
    });
  },

  'POST /api/auth/register': (req, res) => {
    parseBody(req, (body) => {
      const { username, email, password, firstName, lastName } = body;

      if (!username || !email || !password) {
        return sendJson(res, 400, { message: 'Faltan campos requeridos' });
      }

      if (users[email]) {
        return sendJson(res, 409, { message: 'El email ya está registrado' });
      }

      const token = generateToken();
      const user = { username, email, firstName, lastName, createdAt: new Date() };
      
      users[email] = { ...user, password };
      sessions[token] = email;

      sendJson(res, 201, {
        success: true,
        message: 'Registro exitoso',
        token,
        user
      });
    });
  },

  'POST /api/auth/login': (req, res) => {
    parseBody(req, (body) => {
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(res, 400, { message: 'Email y contraseña requeridos' });
      }

      const user = users[email];
      if (!user || user.password !== password) {
        return sendJson(res, 401, { message: 'Email o contraseña incorrectos' });
      }

      const token = generateToken();
      sessions[token] = email;

      const { password: _, ...userWithoutPassword } = user;
      sendJson(res, 200, {
        success: true,
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
      });
    });
  },

  'GET /api/auth/profile': (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const email = sessions[token];

    if (!email) {
      return sendJson(res, 401, { message: 'No autorizado' });
    }

    const user = users[email];
    const { password: _, ...userWithoutPassword } = user;
    sendJson(res, 200, { user: userWithoutPassword });
  },

  'POST /api/auth/logout': (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (sessions[token]) {
      delete sessions[token];
    }

    sendJson(res, 200, { message: 'Logout exitoso' });
  }
};

// Servidor
const server = http.createServer((req, res) => {
  if (handleCors(req, res)) return;

  const parsedUrl = url.parse(req.url, true);
  const key = `${req.method} ${parsedUrl.pathname}`;
  const handler = routes[key];

  if (handler) {
    handler(req, res);
  } else {
    sendJson(res, 404, { error: 'Ruta no encontrada', path: req.url });
  }
});

server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Health: http://localhost:${PORT}/api/health`);
  console.log(`✓ Auth endpoints disponibles`);
  console.log(`✓ Users en memoria: ${Object.keys(users).length}`);
});

process.on('SIGINT', () => {
  console.log('\n✓ Server stopped');
  process.exit(0);
});
