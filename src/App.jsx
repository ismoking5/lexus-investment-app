import { useEffect, useMemo, useState } from 'react';

const allowedCountries = ['Bénin', 'Cameroun', 'Côte d’Ivoire', 'Burkina Faso', 'Niger'];
const paymentNetworks = ['Orange Money', 'Moov Money', 'MTN Money', 'Wave'];
const telegramLink = 'https://t.me/+74TGsMBlIwwyYTI0';
const paymentLink = 'https://example.com/payment';

const defaultProducts = [
  { id: 1, name: 'Lexus IS', model: 'Sedan Premium', amount: 2000, daily: 300, total: 54000, accent: '#ef4444', image: 'sedan' },
  { id: 2, name: 'Lexus ES', model: 'Luxe affair', amount: 5000, daily: 800, total: 144000, accent: '#f97316', image: 'luxury' },
  { id: 3, name: 'Lexus RX', model: 'SUV Familial', amount: 15000, daily: 2400, total: 432000, accent: '#f59e0b', image: 'suv' },
  { id: 4, name: 'Lexus NX', model: 'Compact SUV', amount: 35000, daily: 5600, total: 1008000, accent: '#14b8a6', image: 'compact' },
  { id: 5, name: 'Lexus GS', model: 'Executive', amount: 50000, daily: 8500, total: 1530000, accent: '#8b5cf6', image: 'executive' },
  { id: 6, name: 'Lexus LC', model: 'Grand Tourer', amount: 100000, daily: 17000, total: 3060000, accent: '#d946ef', image: 'tourer' },
  { id: 7, name: 'Lexus LX', model: 'Luxury SUV', amount: 250000, daily: 45000, total: 8100000, accent: '#0ea5e9', image: 'luxury-suv' },
  { id: 8, name: 'Lexus GT', model: 'Sport Performance', amount: 500000, daily: 100000, total: 18000000, accent: '#22c55e', image: 'sport' },
  { id: 9, name: 'Lexus X', model: 'Ultimate', amount: 800000, daily: 200000, total: 36000000, accent: '#dc2626', image: 'ultimate' },
];

const initialUsers = [
  { id: 'u-001', name: 'Moussa Diop', phone: '67000000', country: 'Côte d’Ivoire', balance: 45000, totalInvested: 15000, referral: 0, isAdmin: true },
  { id: 'u-002', name: 'Awa Kone', phone: '69000000', country: 'Burkina Faso', balance: 8500, totalInvested: 5000, referral: 1, isAdmin: false },
  { id: 'u-003', name: 'Paul Ngu', phone: '65000000', country: 'Cameroun', balance: 12000, totalInvested: 35000, referral: 2, isAdmin: false },
];

const initialDeposits = [
  { id: 'dep-1', name: 'Awa Kone', amount: 5000, network: 'Orange Money', phone: '69000000', country: 'Burkina Faso', date: '2026-10-05T08:00:00', proof: 'IMG-001.png', status: 'en_attente' },
  { id: 'dep-2', name: 'Paul Ngu', amount: 35000, network: 'MTN Money', phone: '65000000', country: 'Cameroun', date: '2026-10-04T12:00:00', proof: 'IMG-002.png', status: 'approved' },
];

const initialWithdrawals = [
  { id: 'wit-1', name: 'Awa Kone', amount: 1800, network: 'Wave', phone: '69000000', country: 'Burkina Faso', date: '2026-10-05T09:00:00', status: 'en_attente' },
  { id: 'wit-2', name: 'Moussa Diop', amount: 2000, network: 'Moov Money', phone: '67000000', country: 'Côte d’Ivoire', date: '2026-10-03T15:34:00', status: 'approved' },
];

const defaultSettings = {
  paymentLink,
  telegramLink,
  welcomeBanner: 'Rejoignez notre Canal Telegram',
  targetCountry: 'Benin',
};

const initialInvestmentHistory = [
  { id: 'inv-1', userName: 'Awa Kone', phone: '69000000', amount: 5000, product: 'Lexus ES', date: '2026-10-04T10:30:00', status: 'actif' },
  { id: 'inv-2', userName: 'Paul Ngu', phone: '65000000', amount: 35000, product: 'Lexus RX', date: '2026-10-03T16:00:00', status: 'actif' },
];

const defaultNotifications = [
  'Nouvelle demande de dépôt en attente',
  'Rappel de validation admin',
  'Gain journalier calculé',
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value) =>
  new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function App() {
  const [activeView, setActiveView] = useState('home');
  const [loggedIn, setLoggedIn] = useState(true);
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [toast, setToast] = useState('');
  const [products, setProducts] = useState(defaultProducts);
  const [users, setUsers] = useState(initialUsers);
  const [deposits, setDeposits] = useState(initialDeposits);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [settings, setSettings] = useState(defaultSettings);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [investmentHistory, setInvestmentHistory] = useState(initialInvestmentHistory);
  const [selectedUser, setSelectedUser] = useState(initialUsers[0]);
  const [adminSection, setAdminSection] = useState('dashboard');
  const [userForm, setUserForm] = useState({ amount: '', network: 'Orange Money', phone: '', country: 'Bénin' });
  const [depositConfirm, setDepositConfirm] = useState({ amount: '', network: 'Orange Money', phone: '', method: 'Mobile Money' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', network: 'Orange Money', phone: '' });
  const [prodForm, setProdForm] = useState({ amount: '', daily: '', total: '', name: '', model: '', accent: '#dc2626' });

  const currentUser = useMemo(() => users.find((user) => user.isAdmin) || users[0], [users]);

  useEffect(() => {
    const data = {
      products,
      users,
      deposits,
      withdrawals,
      settings,
      notifications,
      investmentHistory,
      selectedUser,
    };
    localStorage.setItem('lexus-investment-app', JSON.stringify(data));
  }, [products, users, deposits, withdrawals, settings, notifications, investmentHistory, selectedUser]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (!user.totalInvested || user.totalInvested <= 0) return user;
          const generated = user.totalInvested * 0.0018;
          return { ...user, balance: Math.round(user.balance + generated) };
        })
      );
      setNotifications((prev) => ['Gain journalier calculé', ...prev].slice(0, 6));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addToast = (message) => setToast(message);
  const addNotification = (message) => setNotifications((prev) => [message, ...prev].slice(0, 6));

  const openPayment = () => {
    if (settings.paymentLink) {
      window.open(settings.paymentLink, '_blank', 'noopener,noreferrer');
    }
    addToast('Paiement initié. Merci de confirmer votre dépôt après paiement.');
  };

  const handleDepositCommit = () => {
    if (!depositConfirm.amount || !depositConfirm.network || !depositConfirm.phone) {
      addToast('Veuillez remplir tous les champs du dépôt.');
      return;
    }

    const item = {
      id: `dep-${Date.now()}`,
      name: currentUser.name,
      amount: Number(depositConfirm.amount),
      network: depositConfirm.network,
      phone: depositConfirm.phone,
      country: currentUser.country,
      date: new Date().toISOString(),
      proof: 'Déclaration utilisateur',
      status: 'en_attente',
    };

    setDeposits((prev) => [item, ...prev]);
    setDepositConfirm({ amount: '', network: 'Orange Money', phone: '', method: 'Mobile Money' });
    setActiveView('home');
    addNotification('Demande de dépôt envoyée. En attente de validation Admin');
    addToast('Demande de dépôt envoyée. En attente de validation Admin');
  };

  const handleWithdrawalRequest = () => {
    const amount = Number(withdrawForm.amount);
    if (!amount || amount < 800) {
      addToast('Le montant minimum de retrait est de 800 FCFA.');
      return;
    }
    if (currentUser.totalInvested <= 0) {
      addToast('Veuillez d’abord investir pour activer le retrait.');
      return;
    }

    const fee = Math.round(amount * 0.15);
    const item = {
      id: `wit-${Date.now()}`,
      name: currentUser.name,
      amount,
      network: withdrawForm.network,
      phone: withdrawForm.phone,
      country: currentUser.country,
      fee,
      date: new Date().toISOString(),
      status: 'en_attente',
    };
    setWithdrawals((prev) => [item, ...prev]);
    setWithdrawForm({ amount: '', network: 'Orange Money', phone: '' });
    setActiveView('home');
    addNotification('Demande de retrait envoyée en attente de validation');
    addToast('Demande de retrait envoyée.');
  };

  const approveDeposit = (item) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.name === item.name && user.phone === item.phone
          ? { ...user, balance: user.balance + item.amount }
          : user
      )
    );
    setDeposits((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'approved' } : p)));
    addNotification(`Dépôt approuvé pour ${item.name}`);
    addToast('Dépôt approuvé et solde crédité.');
  };

  const rejectDeposit = (item) => {
    setDeposits((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'rejected' } : p)));
    addNotification(`Dépôt rejeté pour ${item.name}`);
    addToast('Dépôt rejeté.');
  };

  const approveWithdrawal = (item) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.name === item.name && user.phone === item.phone
          ? { ...user, balance: Math.max(0, user.balance - item.amount) }
          : user
      )
    );
    setWithdrawals((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'approved' } : p)));
    addNotification(`Retrait approuvé pour ${item.name}`);
    addToast('Retrait approuvé et débit effectué.');
  };

  const rejectWithdrawal = (item) => {
    setWithdrawals((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'rejected' } : p)));
    addNotification(`Retrait rejeté pour ${item.name}`);
    addToast('Retrait rejeté.');
  };

  const addProduct = () => {
    if (!prodForm.amount || !prodForm.name || !prodForm.model) {
      addToast('Complétez le produit avant de l’ajouter.');
      return;
    }
    const amount = Number(prodForm.amount);
    const daily = Number(prodForm.daily || amount * 0.15);
    const total = Number(prodForm.total || daily * 180);
    const newProduct = {
      id: Date.now(),
      name: prodForm.name,
      model: prodForm.model,
      amount,
      daily,
      total,
      accent: prodForm.accent,
      image: 'custom',
    };
    setProducts((prev) => [newProduct, ...prev]);
    setProdForm({ amount: '', daily: '', total: '', name: '', model: '', accent: '#dc2626' });
    addNotification('Nouveau produit ajouté au catalogue');
    addToast('Produit ajouté avec succès.');
  };

  const updateProduct = (id) => {
    const item = products.find((p) => p.id === id);
    if (!item) return;
    const updated = {
      ...item,
      amount: Number(prodForm.amount || item.amount),
      daily: Number(prodForm.daily || item.daily),
      total: Number(prodForm.total || item.total),
      name: prodForm.name || item.name,
      model: prodForm.model || item.model,
      accent: prodForm.accent || item.accent,
    };
    setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)));
    addToast('Produit mis à jour.');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    addToast('Produit supprimé.');
  };

  const offerProductToPromoter = (product) => {
    setInvestmentHistory((prev) => [
      {
        id: `promo-${Date.now()}`,
        userName: 'Promoteur Lexus',
        phone: '70000000',
        amount: product.amount,
        product: product.name,
        date: new Date().toISOString(),
        status: 'offert',
      },
      ...prev,
    ]);
    addNotification(`Produit ${product.name} offert au promoteur`);
    addToast('Produit offert au promoteur.');
  };

  const saveUserBalance = () => {
    const amount = Number(userForm.amount);
    if (!selectedUser || !amount) {
      addToast('Sélectionnez un utilisateur et entrez un montant.');
      return;
    }
    const sign = userForm.country === 'remove' ? -1 : 1;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? { ...user, balance: Math.max(0, user.balance + amount * sign) }
          : user
      )
    );
    addNotification(`Solde mis à jour pour ${selectedUser.name}`);
    addToast('Solde utilisateur mis à jour.');
  };

  const renderProductVisual = (product) => (
    <div className="product-visual" style={{ background: `linear-gradient(135deg, ${product.accent}, #111827)` }}>
      <div className="car-card">
        <div className="car-window" />
        <div className="car-body" />
        <div className="wheel left" />
        <div className="wheel right" />
      </div>
    </div>
  );

  const stats = {
    totalUsers: users.length,
    activeInvestments: investmentHistory.length,
    waitDeposits: deposits.filter((item) => item.status === 'en_attente').length,
    waitWithdrawals: withdrawals.filter((item) => item.status === 'en_attente').length,
    totalVolume: products.reduce((sum, p) => sum + p.total, 0),
  };

  const depositPending = deposits.filter((item) => item.status === 'en_attente');
  const withdrawalPending = withdrawals.filter((item) => item.status === 'en_attente');

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">L</div>
          <div>
            <div className="brand-name">Lexus</div>
            <div className="brand-subtitle">Investissement FCFA</div>
          </div>
        </div>
        <nav className="nav-menu">
          {['home', 'products', 'deposit', 'withdraw', 'profile'].map((item) => (
            <button key={item} className={activeView === item ? 'nav-button active' : 'nav-button'} onClick={() => setActiveView(item)}>
              {item === 'home' && 'Accueil'}
              {item === 'products' && 'Produits'}
              {item === 'deposit' && 'Dépôt'}
              {item === 'withdraw' && 'Retrait'}
              {item === 'profile' && 'Moi'}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <a href={settings.telegramLink} target="_blank" rel="noreferrer" className="telegram-pill">Telegram</a>
          <button className="primary-button small" onClick={() => setActiveView('admin')}>Admin</button>
        </div>
      </header>

      <main className="main-shell">
        {showInfoPopup && (
          <div className="info-popup">
            <div className="popup-card">
              <h3>INFORMATION</h3>
              <ul>
                <li>Inscrivez-vous maintenant et recevez 500 FCFA gratuitement.</li>
                <li>Invitez vos amis à investir et gagnez 25% / 3% / 2% sur 3 niveaux.</li>
                <li>Les rendements sont versés automatiquement chaque jour pendant 180 jours.</li>
                <li>Investissez dès 2 000 FCFA et commencez à gagner dès le lendemain.</li>
              </ul>
              <div className="popup-actions">
                <button className="primary-button" onClick={() => setShowInfoPopup(false)}>D'accord</button>
                <a href={settings.telegramLink} target="_blank" rel="noreferrer" className="telegram-button">Telegram</a>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}

        {activeView === 'home' && (
          <div className="page-grid">
            <section className="hero-panel">
              <div className="hero-copy">
                <span className="mini-label">Lexus</span>
                <h1>Investissez avec les meilleures voitures Lexus</h1>
                <p>Le placement intelligent, la croissance stable et les gains quotidiens automatiques en FCFA.</p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => setActiveView('deposit')}>Ajouter un dépôt</button>
                  <button className="secondary-button" onClick={() => setActiveView('products')}>Voir les produits</button>
                </div>
                <div className="tele-banner">
                  <span>Rejoignez notre Canal Telegram</span>
                  <a href={settings.telegramLink} target="_blank" rel="noreferrer">Telegram</a>
                </div>
              </div>
              <div className="hero-visual">
                <div className="luxury-illustration" />
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card"><span>Total utilisateurs</span><strong>{stats.totalUsers}</strong></div>
              <div className="stat-card"><span>Investissements actifs</span><strong>{stats.activeInvestments}</strong></div>
              <div className="stat-card"><span>Dépôts en attente</span><strong>{stats.waitDeposits}</strong></div>
              <div className="stat-card"><span>Retraits en attente</span><strong>{stats.waitWithdrawals}</strong></div>
            </section>

            <section className="quick-section">
              <h2>Produits populaires</h2>
              <div className="product-list small-grid">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="product-card compact" onClick={() => setActiveView('products')}>
                    {renderProductVisual(product)}
                    <div className="product-body">
                      <h3>{product.name}</h3>
                      <p>{formatCurrency(product.amount)}</p>
                      <span>{formatCurrency(product.daily)}/jour</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeView === 'products' && (
          <div className="page-block">
            <div className="section-heading">
              <div>
                <span className="mini-label">Produits d’investissement</span>
                <h2>Portfolio Lexus</h2>
              </div>
              <button className="primary-button" onClick={() => setActiveView('deposit')}>Dépôt</button>
            </div>
            <div className="product-list">
              {products.map((product) => (
                <div key={product.id} className="product-card full">
                  {renderProductVisual(product)}
                  <div className="product-body">
                    <div className="tagline">{product.model}</div>
                    <h3>{product.name}</h3>
                    <div className="pricing-grid">
                      <div>
                        <span>Investissement</span>
                        <strong>{formatCurrency(product.amount)}</strong>
                      </div>
                      <div>
                        <span>Gain/jour</span>
                        <strong>{formatCurrency(product.daily)}</strong>
                      </div>
                      <div>
                        <span>Total 180j</span>
                        <strong>{formatCurrency(product.total)}</strong>
                      </div>
                    </div>
                    <button className="primary-button" onClick={() => {
                      setActiveView('deposit');
                      setDepositConfirm((prev) => ({ ...prev, amount: String(product.amount) }));
                    }}>Investir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'deposit' && (
          <div className="page-block">
            <div className="section-heading">
              <div>
                <span className="mini-label">Dépôt / Recharger</span>
                <h2>Confirmation de dépôt</h2>
              </div>
            </div>

            <div className="deposit-layout">
              <div className="card-box">
                <label>Méthode de paiement</label>
                <select value="Mobile Money" readOnly>
                  <option>Mobile Money</option>
                </select>

                <label>Montant</label>
                <input type="number" min="2000" value={depositConfirm.amount} onChange={(e) => setDepositConfirm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Montant minimum 2000 FCFA" />

                <label>Réseau utilisé</label>
                <select value={depositConfirm.network} onChange={(e) => setDepositConfirm((prev) => ({ ...prev, network: e.target.value }))}>
                  {paymentNetworks.map((network) => <option key={network}>{network}</option>)}
                </select>

                <label>Numéro</label>
                <input type="tel" value={depositConfirm.phone} onChange={(e) => setDepositConfirm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Ex : Numéro de téléphone sans indicatif" />
                <small className="muted">Indiquez le numéro mobile money utilisé</small>

                <button className="primary-button full" onClick={openPayment}>Payer</button>
              </div>

              <div className="card-box step-box">
                <h3>1. Effectuez le paiement</h3>
                <p>2. Cliquez sur le bouton ci-dessous</p>
                <button className="primary-button full" onClick={() => setActiveView('deposit')}>Confirmation de dépôt</button>
                <div className="confirm-form" style={{ marginTop: '12px' }}>
                  <label>Montant déposé</label>
                  <input type="number" value={depositConfirm.amount} onChange={(e) => setDepositConfirm((prev) => ({ ...prev, amount: e.target.value }))} />

                  <label>Réseau</label>
                  <select value={depositConfirm.network} onChange={(e) => setDepositConfirm((prev) => ({ ...prev, network: e.target.value }))}>
                    {paymentNetworks.map((network) => <option key={network}>{network}</option>)}
                  </select>

                  <label>Numéro utilisé</label>
                  <input type="tel" value={depositConfirm.phone} onChange={(e) => setDepositConfirm((prev) => ({ ...prev, phone: e.target.value }))} />

                  <button className="primary-button full" onClick={handleDepositCommit}>Soumettre la demande</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'withdraw' && (
          <div className="page-block">
            <div className="section-heading">
              <div>
                <span className="mini-label">Retrait</span>
                <h2>Retirer vos gains</h2>
              </div>
            </div>

            <div className="withdraw-layout">
              <div className="card-box">
                <label>Montant</label>
                <input type="number" value={withdrawForm.amount} onChange={(e) => setWithdrawForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="800 FCFA minimum" />
                <label>Réseau</label>
                <select value={withdrawForm.network} onChange={(e) => setWithdrawForm((prev) => ({ ...prev, network: e.target.value }))}>
                  {paymentNetworks.map((network) => <option key={network}>{network}</option>)}
                </select>
                <label>Numéro</label>
                <input type="tel" value={withdrawForm.phone} onChange={(e) => setWithdrawForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Numéro mobile money" />
                <small className="muted">Frais de retrait : 15%. Heures 24h/7. Montant minimum : 800 FCFA.</small>
                <button className="primary-button full" onClick={handleWithdrawalRequest}>Valider le retrait</button>
              </div>

              <div className="card-box">
                <h3>Solde utilisateur</h3>
                <div className="balance-box">
                  <span>Solde actuel</span>
                  <strong>{formatCurrency(currentUser.balance)}</strong>
                </div>
                <div className="balance-box muted-box">
                  <span>Retrait estimé</span>
                  <strong>{withdrawForm.amount ? formatCurrency(Number(withdrawForm.amount) * 0.85) : formatCurrency(0)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="page-block">
            <div className="section-heading">
              <div>
                <span className="mini-label">Mon compte</span>
                <h2>{currentUser.name}</h2>
              </div>
            </div>

            <div className="profile-grid">
              <div className="card-box">
                <div className="profile-row"><span>Nom</span><strong>{currentUser.name}</strong></div>
                <div className="profile-row"><span>Numéro</span><strong>{currentUser.phone}</strong></div>
                <div className="profile-row"><span>Pays</span><strong>{currentUser.country}</strong></div>
                <div className="profile-row"><span>Solde</span><strong>{formatCurrency(currentUser.balance)}</strong></div>
                <div className="profile-row"><span>Investissement total</span><strong>{formatCurrency(currentUser.totalInvested)}</strong></div>
              </div>

              <div className="card-box">
                <h3>Notifications</h3>
                <ul className="note-list">
                  {notifications.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeView === 'admin' && (
          <div className="page-block admin-page">
            <div className="section-heading">
              <div>
                <span className="mini-label">Backoffice Admin</span>
                <h2>Tableau de bord</h2>
              </div>
            </div>

            <div className="admin-dashboard">
              <div className="admin-sidebar">
                {['dashboard', 'users', 'demands', 'products', 'payment', 'telegram', 'referral', 'balance', 'history'].map((section) => (
                  <button key={section} className={adminSection === section ? 'admin-tab active' : 'admin-tab'} onClick={() => setAdminSection(section)}>
                    {section === 'dashboard' && 'Tableau de bord'}
                    {section === 'users' && 'Utilisateurs'}
                    {section === 'demands' && 'Demandes en attente'}
                    {section === 'products' && 'Produits'}
                    {section === 'payment' && 'Gestion Paiement'}
                    {section === 'telegram' && 'Gestion Telegram'}
                    {section === 'referral' && 'Parrainage'}
                    {section === 'balance' && 'Solde'}
                    {section === 'history' && 'Historiques'}
                  </button>
                ))}
              </div>

              <div className="admin-content">
                {adminSection === 'dashboard' && (
                  <div>
                    <div className="stats-grid admin-stats">
                      <div className="stat-card"><span>Pays</span><strong>{allowedCountries.length}</strong></div>
                      <div className="stat-card"><span>Utilisateurs</span><strong>{users.length}</strong></div>
                      <div className="stat-card"><span>Dépôts</span><strong>{deposits.length}</strong></div>
                      <div className="stat-card"><span>Retraits</span><strong>{withdrawals.length}</strong></div>
                    </div>
                    <div className="country-list">
                      {allowedCountries.map((country) => (
                        <div key={country} className="country-item">
                          <span>{country}</span>
                          <strong>{users.filter((u) => u.country === country).length}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSection === 'users' && (
                  <div className="admin-panel">
                    <h3>Gestion utilisateurs</h3>
                    <select value={selectedUser?.country || 'Bénin'} onChange={(e) => setSelectedUser(users.find((u) => u.country === e.target.value) || users[0])}>
                      {allowedCountries.map((country) => <option key={country}>{country}</option>)}
                    </select>
                    <div className="table-list">
                      {users.map((user) => (
                        <div key={user.id} className="table-row" onClick={() => setSelectedUser(user)}>
                          <span>{user.name}</span>
                          <span>{user.country}</span>
                          <span>{user.phone}</span>
                          <span>{formatCurrency(user.balance)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSection === 'demands' && (
                  <div className="admin-panel">
                    <div className="tabs-row">
                      <button className="tab-button active" onClick={() => setAdminSection('demands')}>Dépôts</button>
                      <button className="tab-button" onClick={() => setAdminSection('demands')}>Retraits</button>
                    </div>
                    <div className="table-list">
                      {depositPending.map((item) => (
                        <div key={item.id} className="demo-item">
                          <div className="demo-meta"><strong>{item.name}</strong><span>{item.amount} FCFA</span></div>
                          <div className="demo-meta"><span>{item.phone}</span><span>{item.country}</span></div>
                          <div className="demo-meta"><span>{item.proof}</span><span>{formatDate(item.date)}</span></div>
                          <div className="demo-actions">
                            <button className="approve" onClick={() => approveDeposit(item)}>Approuver</button>
                            <button className="reject" onClick={() => rejectDeposit(item)}>Rejeter</button>
                          </div>
                        </div>
                      ))}
                      {withdrawalPending.map((item) => (
                        <div key={item.id} className="demo-item">
                          <div className="demo-meta"><strong>{item.name}</strong><span>{item.amount} FCFA</span></div>
                          <div className="demo-meta"><span>{item.phone}</span><span>{item.country}</span></div>
                          <div className="demo-meta"><span>{item.network}</span><span>{formatDate(item.date)}</span></div>
                          <div className="demo-actions">
                            <button className="approve" onClick={() => approveWithdrawal(item)}>Approuver</button>
                            <button className="reject" onClick={() => rejectWithdrawal(item)}>Rejeter</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSection === 'products' && (
                  <div className="admin-panel">
                    <h3>Gestion produits</h3>
                    <div className="form-grid">
                      <input value={prodForm.name} onChange={(e) => setProdForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nom du produit" />
                      <input value={prodForm.model} onChange={(e) => setProdForm((prev) => ({ ...prev, model: e.target.value }))} placeholder="Modèle" />
                      <input value={prodForm.amount} onChange={(e) => setProdForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Montant" type="number" />
                      <input value={prodForm.daily} onChange={(e) => setProdForm((prev) => ({ ...prev, daily: e.target.value }))} placeholder="Gain par jour" type="number" />
                      <input value={prodForm.total} onChange={(e) => setProdForm((prev) => ({ ...prev, total: e.target.value }))} placeholder="Total 180j" type="number" />
                      <input value={prodForm.accent} onChange={(e) => setProdForm((prev) => ({ ...prev, accent: e.target.value }))} type="color" />
                    </div>
                    <div className="demo-actions">
                      <button className="primary-button" onClick={addProduct}>Ajouter</button>
                    </div>
                    <div className="table-list">
                      {products.map((product) => (
                        <div key={product.id} className="table-row">
                          <span>{product.name}</span>
                          <span>{product.model}</span>
                          <span>{formatCurrency(product.amount)}</span>
                          <div className="demo-actions compact">
                            <button className="approve" onClick={() => updateProduct(product.id)}>Modifier</button>
                            <button className="reject" onClick={() => deleteProduct(product.id)}>Supprimer</button>
                            <button className="primary-button" onClick={() => offerProductToPromoter(product)}>Offrir</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSection === 'payment' && (
                  <div className="admin-panel">
                    <h3>Gestion paiement</h3>
                    <label>Lien de paiement</label>
                    <input value={settings.paymentLink} onChange={(e) => setSettings((prev) => ({ ...prev, paymentLink: e.target.value }))} />
                    <button className="primary-button" onClick={() => addToast('Lien de paiement enregistré.')}>Enregistrer</button>
                  </div>
                )}

                {adminSection === 'telegram' && (
                  <div className="admin-panel">
                    <h3>Gestion Telegram</h3>
                    <label>Texte bannière</label>
                    <input value={settings.welcomeBanner} onChange={(e) => setSettings((prev) => ({ ...prev, welcomeBanner: e.target.value }))} />
                    <label>Lien du canal</label>
                    <input value={settings.telegramLink} onChange={(e) => setSettings((prev) => ({ ...prev, telegramLink: e.target.value }))} />
                    <button className="primary-button" onClick={() => addToast('Configuration Telegram sauvegardée.')}>Sauvegarder</button>
                  </div>
                )}

                {adminSection === 'referral' && (
                  <div className="admin-panel">
                    <h3>Parrainage</h3>
                    <ul className="note-list">
                      <li>Premier niveau : 25%</li>
                      <li>Deuxième niveau : 3%</li>
                      <li>Troisième niveau : 2%</li>
                    </ul>
                  </div>
                )}

                {adminSection === 'balance' && (
                  <div className="admin-panel">
                    <h3>Ajout / retrait du solde</h3>
                    <select value={selectedUser?.id || users[0]?.id} onChange={(e) => setSelectedUser(users.find((u) => u.id === e.target.value) || users[0])}>
                      {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <input type="number" value={userForm.amount} onChange={(e) => setUserForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Montant" />
                    <select value={userForm.country} onChange={(e) => setUserForm((prev) => ({ ...prev, country: e.target.value }))}>
                      <option value="add">Ajouter au solde</option>
                      <option value="remove">Retirer du solde</option>
                    </select>
                    <button className="primary-button" onClick={saveUserBalance}>Valider</button>
                  </div>
                )}

                {adminSection === 'history' && (
                  <div className="admin-panel">
                    <h3>Historique des investissements</h3>
                    <div className="table-list">
                      {investmentHistory.map((item) => (
                        <div key={item.id} className="table-row">
                          <span>{item.userName}</span>
                          <span>{item.phone}</span>
                          <span>{item.product}</span>
                          <span>{formatDate(item.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
