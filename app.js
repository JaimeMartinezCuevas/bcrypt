const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const users = require('./users');
const { generateToken, verifyToken } = require('./authMiddleware');
const { hashedSecret } = require('./config'); // Agregamos la importación del secreto

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'tu_secreto_es_secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get('/', (req, res) => {
  const loginForm = `
    <form action="/login" method="post">
      <label for="username">Usuario:</label>
      <input type="text" id="username" name="username" required><br>
      
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required><br>

      <button type="submit">Iniciar</button>
    </form>
    <a href="/dashboard">dashboard</a>
  `;

  if (!req.session.token) {
    res.send(loginForm);
  } else {
    res.redirect('/dashboard');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = generateToken(user, hashedSecret);
    req.session.token = token;
    res.redirect('/dashboard');
  } else {
    res.status(401).json({ mensaje: 'Las credenciales son incorrectas' });
  }
});

app.get('/dashboard', (req, res) => {
    verifyToken(req, res, () => {
      const userId = req.user;
      const user = users.find((user) => user.id === userId);
  
      if (user) {
        res.send(`
          <h1>Bienvenido, ${user.name}</h1>
          <p>ID: ${user.id}</p>
          <p>UserName: ${user.username}</p>

          <form action="/logout" method="post">
            <button type="submit">Salir de la sesión</button>
          </form>
        `);
      } else {
        res.status(401).json({ mensaje: 'Usuario no encontrado' });
      }
    }, hashedSecret);
  });

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Express está escuchando en http://localhost:${PORT}`);
});
