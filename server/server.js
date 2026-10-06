import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db();
    console.log('✅ MongoDB connecté');
    await initializeData();
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB', error);
    process.exit(1);
  }
}

async function initializeData() {
  const users = db.collection('users');
  const products = db.collection('products');

  const adminExists = await users.findOne({ email: 'admin@lexus.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await users.insertOne({
      name: 'Moussa Admin',
      email: 'admin@lexus.com',
      phone: '67000000',
      country: 'Côte d\'Ivoire',
      password: hashedPassword,
      role: 'admin',
      balance: 500000,
      totalInvested: 0,
      referralCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Admin créé: admin@lexus.com / admin123');
  }

  const userExists = await users.findOne({ email: 'user@lexus.com' });
  if (!userExists) {
    const hashedPassword = await bcrypt.hash('user123', 10);
    await users.insertOne({
      name: 'Awa Kone',
      email: 'user@lexus.com',
      phone: '69000000',
      country: 'Burkina Faso',
      password: hashedPassword,
      role: 'user',
      balance: 50000,
      totalInvested: 5000,
      referralCount: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Utilisateur créé: user@lexus.com / user123');
  }

  const productsCount = await products.countDocuments();
  if (productsCount === 0) {
    await products.insertMany([
      { name: 'Lexus IS', model: 'Sedan Premium', amount: 2000, daily: 300, total: 54000, accent: '#ef4444' },
      { name: 'Lexus ES', model: 'Luxe affair', amount: 5000, daily: 800, total: 144000, accent: '#f97316' },
      { name: 'Lexus RX', model: 'SUV Familial', amount: 15000, daily: 2400, total: 432000, accent: '#f59e0b' },
      { name: 'Lexus NX', model: 'Compact SUV', amount: 35000, daily: 5600, total: 1008000, accent: '#14b8a6' },
      { name: 'Lexus GS', model: 'Executive', amount: 50000, daily: 8500, total: 1530000, accent: '#8b5cf6' },
      { name: 'Lexus LC', model: 'Grand Tourer', amount: 100000, daily: 17000, total: 3060000, accent: '#d946ef' },
      { name: 'Lexus LX', model: 'Luxury SUV', amount: 250000, daily: 45000, total: 8100000, accent: '#0ea5e9' },
      { name: 'Lexus GT', model: 'Sport Performance', amount: 500000, daily: 100000, total: 18000000, accent: '#22c55e' },
      { name: 'Lexus X', model: 'Ultimate', amount: 800000, daily: 200000, total: 36000000, accent: '#dc2626' }
    ]);
    console.log('✅ Produits créés');
  }
}

connectDB();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès admin requis' });
  }
  next();
};

app.get('/', (req, res) => {
  res.json({ message: 'Lexus API ✅ running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, country, password } = req.body;

    if (!name || !email || !phone || !country || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const users = db.collection('users');
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      phone,
      country,
      password: hashedPassword,
      role: 'user',
      balance: 0,
      totalInvested: 0,
      referralCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await users.insertOne(user);

    const token = jwt.sign(
      { id: result.insertedId.toString(), email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        balance: user.balance,
        totalInvested: user.totalInvested
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        balance: user.balance,
        totalInvested: user.totalInvested
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/users/me', authenticate, async (req, res) => {
  try {
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      role: user.role,
      balance: user.balance,
      totalInvested: user.totalInvested
    });
  } catch (error) {
    console.error('Erreur get user:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = db.collection('products');
    const items = await products.find({}).sort({ amount: 1 }).toArray();
    res.json(items);
  } catch (error) {
    console.error('Erreur produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/deposits', authenticate, async (req, res) => {
  try {
    const { amount, network, phone } = req.body;

    if (!amount || !network || !phone) {
      return res.status(400).json({ message: 'Montant, réseau et numéro requis' });
    }

    const deposits = db.collection('deposits');
    const result = await deposits.insertOne({
      userId: req.user.id,
      userName: req.user.name,
      amount: Number(amount),
      network,
      phone,
      country: req.user.country,
      status: 'en_attente',
      createdAt: new Date()
    });

    return res.status(201).json({ message: 'Demande de dépôt envoyée', id: result.insertedId });
  } catch (error) {
    console.error('Erreur dépôt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/deposits', authenticate, async (req, res) => {
  try {
    const deposits = db.collection('deposits');
    const items = await deposits.find({}).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    console.error('Erreur deposits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/deposits/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deposits = db.collection('deposits');
    const users = db.collection('users');

    const deposit = await deposits.findOne({ _id: new ObjectId(id) });
    if (!deposit) return res.status(404).json({ message: 'Dépôt introuvable' });

    await deposits.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'approved', approvedAt: new Date() } });
    await users.updateOne(
      { _id: new ObjectId(deposit.userId) },
      { $inc: { balance: Number(deposit.amount) } }
    );

    return res.json({ message: 'Dépôt approuvé' });
  } catch (error) {
    console.error('Erreur approbation dépôt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/deposits/:id/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deposits = db.collection('deposits');

    await deposits.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'rejected', rejectedAt: new Date() } });

    return res.json({ message: 'Dépôt rejeté' });
  } catch (error) {
    console.error('Erreur rejet dépôt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/withdrawals', authenticate, async (req, res) => {
  try {
    const { amount, network, phone } = req.body;

    if (!amount || !network || !phone) {
      return res.status(400).json({ message: 'Montant, réseau et numéro requis' });
    }

    const withdrawals = db.collection('withdrawals');
    const result = await withdrawals.insertOne({
      userId: req.user.id,
      userName: req.user.name,
      amount: Number(amount),
      network,
      phone,
      country: req.user.country,
      status: 'en_attente',
      createdAt: new Date()
    });

    return res.status(201).json({ message: 'Demande de retrait envoyée', id: result.insertedId });
  } catch (error) {
    console.error('Erreur retrait:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/withdrawals', authenticate, async (req, res) => {
  try {
    const withdrawals = db.collection('withdrawals');
    const items = await withdrawals.find({}).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    console.error('Erreur withdrawals:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/withdrawals/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawals = db.collection('withdrawals');
    const users = db.collection('users');

    const withdrawal = await withdrawals.findOne({ _id: new ObjectId(id) });
    if (!withdrawal) return res.status(404).json({ message: 'Retrait introuvable' });

    await withdrawals.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'approved', approvedAt: new Date() } });
    await users.updateOne(
      { _id: new ObjectId(withdrawal.userId) },
      { $inc: { balance: -Number(withdrawal.amount) } }
    );

    return res.json({ message: 'Retrait approuvé' });
  } catch (error) {
    console.error('Erreur approbation retrait:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/withdrawals/:id/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawals = db.collection('withdrawals');

    await withdrawals.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'rejected', rejectedAt: new Date() } });

    return res.json({ message: 'Retrait rejeté' });
  } catch (error) {
    console.error('Erreur rejet retrait:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const users = db.collection('users');
    const deposits = db.collection('deposits');
    const withdrawals = db.collection('withdrawals');

    const totalUsers = await users.countDocuments();
    const pendingDeposits = await deposits.countDocuments({ status: 'en_attente' });
    const pendingWithdrawals = await withdrawals.countDocuments({ status: 'en_attente' });
    const approvedDeposits = await deposits.countDocuments({ status: 'approved' });

    return res.json({
      totalUsers,
      pendingDeposits,
      pendingWithdrawals,
      approvedDeposits
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/admin/deposits-pending', authenticate, isAdmin, async (req, res) => {
  try {
    const deposits = db.collection('deposits');
    const items = await deposits.find({ status: 'en_attente' }).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    console.error('Erreur dépôts en attente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/admin/withdrawals-pending', authenticate, isAdmin, async (req, res) => {
  try {
    const withdrawals = db.collection('withdrawals');
    const items = await withdrawals.find({ status: 'en_attente' }).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    console.error('Erreur retraits en attente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur Lexus démarré sur le port ${port}`);
});
