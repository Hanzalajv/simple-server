require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const PORT = process.env.PORT || 3000;

// Stage 1: Sign Up
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ user: data.user });
});

// Stage 1: Log In
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid login credentials' });
  res.status(200).json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
});

// Stage 2: Public route
app.get('/public/info', (req, res) => {
  res.json({ message: 'Welcome stranger! This info is public.' });
});

// Stage 3 & 4: Auth middleware
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = data.user;
  next();
}

// Stage 3: Protected profile
app.get('/protected/profile', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at
  });
});

// Stage 4: Protected dashboard (proves middleware reuse)
app.get('/protected/dashboard', requireAuth, (req, res) => {
  res.json({ message: `Welcome back, ${req.user.email}` });
});

// Stage 4: Logout
app.post('/auth/logout', requireAuth, async (req, res) => {
  await supabase.auth.signOut();
  res.status(204).send();
});

// Stage 5: Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const openapi = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});