// Global AG Pilgrim Trading Platform - Main Application

// Global State
let currentUser = null;
let currentAccountType = 'customer';
let tradingRobot = {
    active: false,
    interval: null,
    lastAction: null,
    profitBalance: 0,
    mainBalance: 0
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeData();
});

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('globalAGPilgrim_data', JSON.stringify({
        users: users,
        transactions: transactions,
        trades: trades,
        marketData: marketData
    }));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('globalAGPilgrim_data');
    if (data) {
        const parsed = JSON.parse(data);
        window.users = parsed.users || [];
        window.transactions = parsed.transactions || [];
        window.trades = parsed.trades || [];
        window.marketData = parsed.marketData || {};
    }
}

// Initialize Default Data
function initializeData() {
    if (!window.users) {
        window.users = [
            {
                id: 'admin-001',
                name: 'Admin',
                email: 'admin@globalag.com',
                password: 'admin123',
                role: 'admin',
                serialNumber: 'SN-ADMIN-001',
                status: 'active',
                mainBalance: 0,
                profitBalance: 0,
                kycStatus: 'approved',
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    if (!window.transactions) {
        window.transactions = [];
    }
    
    if (!window.trades) {
        window.trades = [];
    }
    
    if (!window.marketData) {
        window.marketData = {
            pilgrimCoin: 0.50,
            globalBankShares: 5.00,
            gold: 1950.00,
            bitcoin: 45000.00,
            ethereum: 3200.00,
            lastUpdate: new Date().toISOString()
        };
    }
    
    saveToLocalStorage();
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    } else if (pageId === 'cover') {
        document.getElementById('cover-page').classList.add('active');
    }
}

// Modal Functions
function showShareModal() {
    document.getElementById('share-modal').classList.add('active');
}

function closeShareModal() {
    document.getElementById('share-modal').classList.remove('active');
}

function sendShareRequest() {
    const quantity = document.getElementById('share-quantity').value;
    if (!quantity || quantity < 1) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }
    
    const email = 'adeganglobal@gmail.com';
    const subject = `Share Purchase Request - Global Bank Nigeria`;
    const body = `I would like to purchase ${quantity} shares of Global Bank Nigeria at $5 per share.\n\nTotal: $${(quantity * 5).toFixed(2)}\n\nPlease provide payment instructions.`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('Email client opened. Please complete your request.', 'success');
    closeShareModal();
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const userType = document.getElementById('login-type').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        if (user.role !== userType) {
            showToast('Invalid account type selected', 'error');
            return;
        }
        
        if (user.status !== 'active') {
            showToast('Your account is not active. Please contact support.', 'error');
            return;
        }
        
        currentUser = user;
        currentAccountType = userType;
        
        if (userType === 'admin') {
            showAdminDashboard();
        } else {
            showCustomerDashboard();
        }
        
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid email or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    const serialNumber = 'SN-' + Date.now().toString().slice(-10);
    
    const newUser = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: 'customer',
        serialNumber: serialNumber,
        status: 'pending',
        mainBalance: 0,
        profitBalance: 0,
        kycStatus: 'pending',
        kycDocuments: {},
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToLocalStorage();
    
    showToast('Registration successful! Please complete KYC verification.', 'success');
    showPage('login');
}

function logout() {
    currentUser = null;
    stopTradingRobot();
    showPage('cover');
    showToast('Logged out successfully', 'success');
}

// Admin Dashboard Functions
function showAdminDashboard() {
    // Create admin dashboard HTML
    const dashboardHTML = `
        <div class="dashboard-header">
            <div class="logo">
                <i class="fas fa-chart-line"></i>
                <h1>Global AG Pilgrim</h1>
            </div>
            <div class="user-info">
                <div class="avatar">A</div>
                <div>
                    <div>Admin</div>
                    <small>Olawale Abdul-ganiyu Adeshina</small>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
        
        <div class="dashboard-content">
            <aside class="sidebar">
                <ul class="sidebar-nav">
                    <li><button class="active" onclick="showAdminSection('overview')"><i class="fas fa-home"></i> Overview</button></li>
                    <li><button onclick="showAdminSection('customers')"><i class="fas fa-users"></i> Customers</button></li>
                    <li><button onclick="showAdminSection('terminal')"><i class="fas fa-terminal"></i> Terminal</button></li>
                    <li><button onclick="showAdminSection('transactions')"><i class="fas fa-exchange-alt"></i> Transactions</button></li>
                    <li><button onclick="showAdminSection('trades')"><i class="fas fa-chart-bar"></i> Trades</button></li>
                </ul>
            </aside>
            
            <main class="dashboard-main">
                <div id="admin-overview" class="dashboard-section active">
                    <div class="section-header">
                        <h2>Admin Overview</h2>
                        <p>Platform statistics and monitoring</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-users"></i></div>
                            <div class="value">${users.length}</div>
                            <div class="label">Total Customers</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-check-circle"></i></div>
                            <div class="value">${users.filter(u => u.status === 'active').length}</div>
                            <div class="label">Active Accounts</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-clock"></i></div>
                            <div class="value">${users.filter(u => u.status === 'pending').length}</div>
                            <div class="label">Pending Approvals</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-dollar-sign"></i></div>
                            <div class="value">$${getTotalBalance().toFixed(2)}</div>
                            <div class="label">Total Platform Balance</div>
                        </div>
                    </div>
                </div>
                
                <div id="admin-customers" class="dashboard-section">
                    <div class="section-header">
                        <h2>Customer Management</h2>
                        <p>Manage customer accounts</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <button class="btn btn-primary" onclick="showCreateCustomerModal()">
                            <i class="fas fa-plus"></i> Create Customer
                        </button>
                        <input type="text" id="customer-search" placeholder="Search by serial number, name, or email..." 
                               style="padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white;"
                               oninput="filterCustomers()">
                    </div>
                    
                    <div class="table-container">
                        <table id="customers-table">
                            <thead>
                                <tr>
                                    <th>Serial Number</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Main Balance</th>
                                    <th>Profit Balance</th>
                                    <th>KYC Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="customers-table-body"></tbody>
                        </table>
                    </div>
                </div>
                
                <div id="admin-terminal" class="dashboard-section">
                    <div class="section-header">
                        <h2>Terminal</h2>
                        <p>Monitor online customers and activities</p>
                    </div>
                    
                    <div class="robot-status">
                        <h4><i class="fas fa-robot"></i> Trading Robot Status</h4>
                        <p><strong>Status:</strong> <span class="badge active">Active</span></p>
                        <p><strong>Last Action:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Interval:</strong> 5 seconds</p>
                        <p><strong>Strategy:</strong> Buy on market down, Sell on market up</p>
                    </div>
                    
                    <div class="table-container">
                        <h3>Online Customers</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Serial Number</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Active Trades</th>
                                    <th>Last Activity</th>
                                </tr>
                            </thead>
                            <tbody id="online-customers-table"></tbody>
                        </table>
                    </div>
                </div>
                
                <div id="admin-transactions" class="dashboard-section">
                    <div class="section-header">
                        <h2>All Transactions</h2>
                        <p>View and manage platform transactions</p>
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody id="transactions-table"></tbody>
                        </table>
                    </div>
                </div>
                
                <div id="admin-trades" class="dashboard-section">
                    <div class="section-header">
                        <h2>All Trades</h2>
                        <p>Monitor trading activities</p>
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Symbol</th>
                                    <th>Type</th>
                                    <th>Lot Size</th>
                                    <th>Open Price</th>
                                    <th>Close Price</th>
                                    <th>Profit/Loss</th>
                                </tr>
                            </thead>
                            <tbody id="trades-table"></tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
    
    document.getElementById('cover-page').innerHTML = dashboardHTML;
    document.getElementById('cover-page').classList.remove('active');
    document.getElementById('cover-page').style.display = 'none';
    
    document.body.innerHTML = dashboardHTML;
    document.body.style.display = 'block';
    
    // Initialize admin dashboard
    updateCustomersTable();
    updateTransactionsTable();
    updateTradesTable();
    updateOnlineCustomers();
    
    // Start real-time updates
    setInterval(updateOnlineCustomers, 5000);
    setInterval(updateMarketData, 5000);
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('admin-' + sectionId).classList.add('active');
    
    document.querySelectorAll('.sidebar-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('button').classList.add('active');
}

function updateCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    const customers = users.filter(u => u.role === 'customer');
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.serialNumber}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td><span class="badge ${customer.status}">${customer.status}</span></td>
            <td>$${customer.mainBalance.toFixed(2)}</td>
            <td>$${customer.profitBalance.toFixed(2)}</td>
            <td><span class="badge ${customer.kycStatus}">${customer.kycStatus}</span></td>
            <td>
                <button class="action-btn edit" onclick="editCustomer('${customer.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn activate" onclick="toggleCustomerStatus('${customer.id}')"><i class="fas fa-power-off"></i></button>
                <button class="action-btn delete" onclick="deleteCustomer('${customer.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const rows = document.querySelectorAll('#customers-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showCreateCustomerModal() {
    const modalHTML = `
        <div class="modal active" id="create-customer-modal">
            <div class="modal-content">
                <span class="close" onclick="closeCreateCustomerModal()">&times;</span>
                <h2>Create Customer Account</h2>
                <form onsubmit="createCustomer(event)">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="new-customer-name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="new-customer-email" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="new-customer-phone" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="new-customer-password" required>
                    </div>
                    <div class="form-group">
                        <label>Initial Balance ($)</label>
                        <input type="number" id="new-customer-balance" value="0" step="0.01">
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Create Account</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCreateCustomerModal() {
    const modal = document.getElementById('create-customer-modal');
    if (modal) modal.remove();
}

function createCustomer(event) {
    event.preventDefault();
    
    const name = document.getElementById('new-customer-name').value;
    const email = document.getElementById('new-customer-email').value;
    const phone = document.getElementById('new-customer-phone').value;
    const password = document.getElementById('new-customer-password').value;
    const initialBalance = parseFloat(document.getElementById('new-customer-balance').value) || 0;
    
    const serialNumber = 'SN-' + Date.now().toString().slice(-10);
    
    const newCustomer = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: 'customer',
        serialNumber: serialNumber,
        status: 'active',
        mainBalance: initialBalance,
        profitBalance: 0,
        kycStatus: 'pending',
        kycDocuments: {},
        createdAt: new Date().toISOString()
    };
    
    users.push(newCustomer);
    saveToLocalStorage();
    
    if (initialBalance > 0) {
        addTransaction({
            customerId: newCustomer.id,
            customerName: newCustomer.name,
            type: 'credit',
            amount: initialBalance,
            method: 'Admin Credit',
            status: 'completed',
            details: 'Initial balance by admin'
        });
    }
    
    closeCreateCustomerModal();
    updateCustomersTable();
    showToast('Customer created successfully!', 'success');
}

function editCustomer(customerId) {
    const customer = users.find(u => u.id === customerId);
    if (!customer) return;
    
    const modalHTML = `
        <div class="modal active" id="edit-customer-modal">
            <div class="modal-content">
                <span class="close" onclick="closeEditCustomerModal()">&times;</span>
                <h2>Edit Customer</h2>
                <form onsubmit="saveCustomer(event, '${customerId}')">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="edit-customer-name" value="${customer.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="edit-customer-email" value="${customer.email}" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" id="edit-customer-phone" value="${customer.phone}" required>
                    </div>
                    <div class="form-group">
                        <label>Main Balance ($)</label>
                        <input type="number" id="edit-customer-balance" value="${customer.mainBalance}" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Profit Balance ($)</label>
                        <input type="number" id="edit-customer-profit" value="${customer.profitBalance}" step="0.01">
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeEditCustomerModal() {
    const modal = document.getElementById('edit-customer-modal');
    if (modal) modal.remove();
}

function saveCustomer(event, customerId) {
    event.preventDefault();
    
    const customer = users.find(u => u.id === customerId);
    if (!customer) return;
    
    customer.name = document.getElementById('edit-customer-name').value;
    customer.email = document.getElementById('edit-customer-email').value;
    customer.phone = document.getElementById('edit-customer-phone').value;
    
    const newMainBalance = parseFloat(document.getElementById('edit-customer-balance').value);
    const newProfitBalance = parseFloat(document.getElementById('edit-customer-profit').value);
    
    // Record balance changes
    if (newMainBalance !== customer.mainBalance) {
        const difference = newMainBalance - customer.mainBalance;
        addTransaction({
            customerId: customer.id,
            customerName: customer.name,
            type: difference > 0 ? 'credit' : 'debit',
            amount: Math.abs(difference),
            method: 'Admin Adjustment',
            status: 'completed',
            details: 'Balance adjustment by admin'
        });
    }
    
    customer.mainBalance = newMainBalance;
    customer.profitBalance = newProfitBalance;
    
    saveToLocalStorage();
    closeEditCustomerModal();
    updateCustomersTable();
    showToast('Customer updated successfully!', 'success');
}

function toggleCustomerStatus(customerId) {
    const customer = users.find(u => u.id === customerId);
    if (!customer) return;
    
    customer.status = customer.status === 'active' ? 'inactive' : 'active';
    saveToLocalStorage();
    updateCustomersTable();
    showToast(`Customer ${customer.status}!`, 'success');
}

function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    const index = users.findIndex(u => u.id === customerId);
    if (index > -1) {
        users.splice(index, 1);
        saveToLocalStorage();
        updateCustomersTable();
        showToast('Customer deleted successfully!', 'success');
    }
}

function updateOnlineCustomers() {
    const tbody = document.getElementById('online-customers-table');
    if (!tbody) return;
    
    const activeCustomers = users.filter(u => u.role === 'customer' && u.status === 'active');
    
    tbody.innerHTML = activeCustomers.map(customer => {
        const activeTrades = trades.filter(t => t.customerId === customer.id && t.status === 'open');
        return `
            <tr>
                <td>${customer.serialNumber}</td>
                <td>${customer.name}</td>
                <td><span class="badge active">Online</span></td>
                <td>${activeTrades.length}</td>
                <td>${new Date().toLocaleString()}</td>
            </tr>
        `;
    }).join('');
}

function updateTransactionsTable() {
    const tbody = document.getElementById('transactions-table');
    if (!tbody) return;
    
    tbody.innerHTML = transactions.map(tx => `
        <tr>
            <td>${new Date(tx.date).toLocaleString()}</td>
            <td><span class="badge ${tx.type}">${tx.type}</span></td>
            <td>${tx.customerName}</td>
            <td>$${tx.amount.toFixed(2)}</td>
            <td><span class="badge ${tx.status}">${tx.status}</span></td>
            <td>${tx.details || tx.method}</td>
        </tr>
    `).join('');
}

function updateTradesTable() {
    const tbody = document.getElementById('trades-table');
    if (!tbody) return;
    
    tbody.innerHTML = trades.map(trade => `
        <tr>
            <td>${new Date(trade.date).toLocaleString()}</td>
            <td>${trade.customerName}</td>
            <td>${trade.symbol}</td>
            <td><span class="badge ${trade.type}">${trade.type.toUpperCase()}</span></td>
            <td>${trade.lotSize}</td>
            <td>$${trade.openPrice.toFixed(2)}</td>
            <td>${trade.closePrice ? '$' + trade.closePrice.toFixed(2) : '-'}</td>
            <td class="${trade.profit >= 0 ? 'text-success' : 'text-error'}">
                ${trade.profit !== null ? '$' + trade.profit.toFixed(2) : '-'}
            </td>
        </tr>
    `).join('');
}

// Customer Dashboard Functions
function showCustomerDashboard() {
    const dashboardHTML = `
        <div class="dashboard-header">
            <div class="logo">
                <i class="fas fa-chart-line"></i>
                <h1>Global AG Pilgrim</h1>
            </div>
            <div class="user-info">
                <div class="avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                <div>
                    <div>${currentUser.name}</div>
                    <small>${currentUser.serialNumber}</small>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
        
        <div class="dashboard-content">
            <aside class="sidebar">
                <ul class="sidebar-nav">
                    <li><button class="active" onclick="showCustomerSection('overview')"><i class="fas fa-home"></i> Overview</button></li>
                    <li><button onclick="showCustomerSection('trading')"><i class="fas fa-chart-line"></i> Trading</button></li>
                    <li><button onclick="showCustomerSection('kyc')"><i class="fas fa-id-card"></i> KYC Verification</button></li>
                    <li><button onclick="showCustomerSection('transactions')"><i class="fas fa-exchange-alt"></i> Transactions</button></li>
                    <li><button onclick="showCustomerSection('withdrawal')"><i class="fas fa-money-bill-wave"></i> Withdrawal</button></li>
                    <li><button onclick="showCustomerSection('profile')"><i class="fas fa-user"></i> Profile</button></li>
                </ul>
            </aside>
            
            <main class="dashboard-main">
                <div id="customer-overview" class="dashboard-section active">
                    <div class="section-header">
                        <h2>Welcome, ${currentUser.name}!</h2>
                        <p>Your account overview and balance</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-wallet"></i></div>
                            <div class="value">$${currentUser.mainBalance.toFixed(2)}</div>
                            <div class="label">Main Balance</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-chart-line"></i></div>
                            <div class="value">$${currentUser.profitBalance.toFixed(2)}</div>
                            <div class="label">Profit Balance</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-coins"></i></div>
                            <div class="value">$${marketData.pilgrimCoin.toFixed(2)}</div>
                            <div class="label">Pilgrim Coin</div>
                            <div class="change positive">
                                <i class="fas fa-arrow-up"></i> 2.5%
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-building"></i></div>
                            <div class="value">$5.00</div>
                            <div class="label">GBN Share</div>
                        </div>
                    </div>
                    
                    <div class="trading-terminal">
                        <div class="terminal-header">
                            <h3><i class="fas fa-robot"></i> Trading Robot</h3>
                            <button class="btn btn-primary" onclick="toggleTradingRobot()">
                                ${tradingRobot.active ? 'Stop Robot' : 'Start Robot'}
                            </button>
                        </div>
                        
                        <div class="robot-status ${tradingRobot.active ? 'active' : ''}">
                            <h4><i class="fas fa-robot"></i> Robot Status</h4>
                            <p><strong>Status:</strong> <span class="badge ${tradingRobot.active ? 'active' : 'pending'}">${tradingRobot.active ? 'Running' : 'Stopped'}</span></p>
                            <p><strong>Strategy:</strong> Buy on down, Sell on up (5-second intervals)</p>
                            <p><strong>Profit Balance:</strong> $${currentUser.profitBalance.toFixed(2)}</p>
                        </div>
                        
                        <div class="market-data">
                            <div class="data-item">
                                <div class="label">Pilgrim Coin</div>
                                <div class="value up">$${marketData.pilgrimCoin.toFixed(2)}</div>
                            </div>
                            <div class="data-item">
                                <div class="label">Bitcoin</div>
                                <div class="value down">$${marketData.bitcoin.toFixed(2)}</div>
                            </div>
                            <div class="data-item">
                                <div class="label">Ethereum</div>
                                <div class="value up">$${marketData.ethereum.toFixed(2)}</div>
                            </div>
                            <div class="data-item">
                                <div class="label">Gold</div>
                                <div class="value up">$${marketData.gold.toFixed(2)}</div>
                            </div>
                            <div class="data-item">
                                <div class="label">GBN Share</div>
                                <div class="value">$${marketData.globalBankShares.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="customer-trading" class="dashboard-section">
                    <div class="section-header">
                        <h2>Trading Terminal</h2>
                        <p>Trade various instruments</p>
                    </div>
                    
                    <div class="market-data">
                        <div class="data-item">
                            <div class="label">Pilgrim Coin</div>
                            <div class="value" id="price-pilgrim">$${marketData.pilgrimCoin.toFixed(2)}</div>
                        </div>
                        <div class="data-item">
                            <div class="label">Bitcoin</div>
                            <div class="value" id="price-btc">$${marketData.bitcoin.toFixed(2)}</div>
                        </div>
                        <div class="data-item">
                            <div class="label">Ethereum</div>
                            <div class="value" id="price-eth">$${marketData.ethereum.toFixed(2)}</div>
                        </div>
                        <div class="data-item">
                            <div class="label">Gold</div>
                            <div class="value" id="price-gold">$${marketData.gold.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="trading-controls">
                        <div class="control-group">
                            <h4>Trade Settings</h4>
                            <div class="form-group">
                                <label>Instrument</label>
                                <select id="trade-symbol">
                                    <option value="pilgrimCoin">Pilgrim Coin</option>
                                    <option value="bitcoin">Bitcoin</option>
                                    <option value="ethereum">Ethereum</option>
                                    <option value="gold">Gold</option>
                                    <option value="globalBankShares">Global Bank Nigeria</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Lot Size (0.001 - 1000)</label>
                                <input type="number" id="trade-lot-size" min="0.001" max="1000" step="0.001" value="0.01">
                            </div>
                        </div>
                        <div class="control-group">
                            <h4>Actions</h4>
                            <button class="trade-btn buy" onclick="executeTrade('buy')">BUY</button>
                            <button class="trade-btn sell" onclick="executeTrade('sell')">SELL</button>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <h3>Open Positions</h3>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th>Type</th>
                                        <th>Lot Size</th>
                                        <th>Open Price</th>
                                        <th>Current Price</th>
                                        <th>Profit/Loss</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="open-positions"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="customer-kyc" class="dashboard-section">
                    <div class="section-header">
                        <h2>KYC Verification</h2>
                        <p>Complete verification to unlock full features</p>
                    </div>
                    
                    ${currentUser.kycStatus === 'pending' ? `
                        <div class="kyc-form">
                            <form onsubmit="submitKYC(event)">
                                <div class="form-group">
                                    <label>Full Name</label>
                                    <input type="text" id="kyc-name" value="${currentUser.name}" required>
                                </div>
                                <div class="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" id="kyc-dob" required>
                                </div>
                                <div class="form-group">
                                    <label>Country</label>
                                    <input type="text" id="kyc-country" required>
                                </div>
                                <div class="form-group">
                                    <label>ID Type</label>
                                    <select id="kyc-id-type" required>
                                        <option value="">Select ID Type</option>
                                        <option value="passport">Passport</option>
                                        <option value="national_id">National ID</option>
                                        <option value="driver_license">Driver's License</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>ID Number</label>
                                    <input type="text" id="kyc-id-number" required>
                                </div>
                                <div class="form-group">
                                    <label>Bank Name</label>
                                    <input type="text" id="kyc-bank-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Account Number</label>
                                    <input type="text" id="kyc-account-number" required>
                                </div>
                                <button type="submit" class="btn btn-primary btn-full">Submit KYC</button>
                            </form>
                        </div>
                    ` : currentUser.kycStatus === 'approved' ? `
                        <div class="kyc-status approved">
                            <i class="fas fa-check-circle"></i>
                            <h3>KYC Approved</h3>
                            <p>Your account has been verified successfully.</p>
                        </div>
                    ` : `
                        <div class="kyc-status pending">
                            <i class="fas fa-clock"></i>
                            <h3>KYC Under Review</h3>
                            <p>Your verification is being processed. This usually takes 1-2 business days.</p>
                        </div>
                    `}
                </div>
                
                <div id="customer-transactions" class="dashboard-section">
                    <div class="section-header">
                        <h2>Transaction History</h2>
                        <p>Your recent transactions</p>
                    </div>
                    
                    <div id="customer-transactions-list"></div>
                </div>
                
                <div id="customer-withdrawal" class="dashboard-section">
                    <div class="section-header">
                        <h2>Withdraw Funds</h2>
                        <p>Transfer funds to your bank account</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-wallet"></i></div>
                            <div class="value">$${currentUser.mainBalance.toFixed(2)}</div>
                            <div class="label">Main Balance</div>
                        </div>
                        <div class="stat-card">
                            <div class="icon"><i class="fas fa-chart-line"></i></div>
                            <div class="value">$${currentUser.profitBalance.toFixed(2)}</div>
                            <div class="label">Profit Balance</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button class="btn btn-primary" onclick="transferProfitToMain()">
                            <i class="fas fa-exchange-alt"></i> Transfer Profit to Main Balance
                        </button>
                    </div>
                    
                    <div class="kyc-form" style="margin-top: 30px;">
                        <h3>Withdrawal Request</h3>
                        <form onsubmit="submitWithdrawal(event)">
                            <div class="form-group">
                                <label>Balance Source</label>
                                <select id="withdraw-source" required>
                                    <option value="main">Main Balance</option>
                                    <option value="profit">Profit Balance</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Amount ($)</label>
                                <input type="number" id="withdraw-amount" min="10" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label>Bank Name</label>
                                <input type="text" id="withdraw-bank-name" required>
                            </div>
                            <div class="form-group">
                                <label>Account Number</label>
                                <input type="text" id="withdraw-account-number" required>
                            </div>
                            <div class="form-group">
                                <label>Account Name</label>
                                <input type="text" id="withdraw-account-name" required>
                            </div>
                            <div class="form-group">
                                <label>Bank Type</label>
                                <select id="withdraw-bank-type" required>
                                    <option value="local">Local Bank</option>
                                    <option value="international">International Bank</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary btn-full">Submit Withdrawal</button>
                        </form>
                    </div>
                </div>
                
                <div id="customer-profile" class="dashboard-section">
                    <div class="section-header">
                        <h2>Profile Settings</h2>
                        <p>Manage your account details</p>
                    </div>
                    
                    <div class="kyc-form">
                        <form onsubmit="updateProfile(event)">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="profile-name" value="${currentUser.name}" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="profile-email" value="${currentUser.email}" required disabled>
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel" id="profile-phone" value="${currentUser.phone}" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-full">Update Profile</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    `;
    
    document.body.innerHTML = dashboardHTML;
    updateCustomerTransactions();
    updateOpenPositions();
}

function showCustomerSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('customer-' + sectionId).classList.add('active');
    
    document.querySelectorAll('.sidebar-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('button').classList.add('active');
    
    if (sectionId === 'trading') {
        updateOpenPositions();
    } else if (sectionId === 'transactions') {
        updateCustomerTransactions();
    }
}

// Trading Functions
function toggleTradingRobot() {
    tradingRobot.active = !tradingRobot.active;
    
    if (tradingRobot.active) {
        startTradingRobot();
    } else {
        stopTradingRobot();
    }
    
    showCustomerSection('overview');
    showToast(`Trading robot ${tradingRobot.active ? 'started' : 'stopped'}!`, 'success');
}

function startTradingRobot() {
    tradingRobot.interval = setInterval(() => {
        executeRobotTrade();
    }, 5000);
}

function stopTradingRobot() {
    if (tradingRobot.interval) {
        clearInterval(tradingRobot.interval);
        tradingRobot.interval = null;
    }
    tradingRobot.active = false;
}

function executeRobotTrade() {
    if (!currentUser || currentUser.mainBalance < 0.01) return;
    
    // Simulate market movement
    const marketChange = (Math.random() - 0.5) * 0.02; // +/- 1%
    const symbol = ['pilgrimCoin', 'bitcoin', 'ethereum', 'gold'][Math.floor(Math.random() * 4)];
    
    const currentPrice = marketData[symbol];
    const newPrice = currentPrice * (1 + marketChange);
    
    // Update market data
    marketData[symbol] = newPrice;
    saveToLocalStorage();
    
    // Execute trade based on market direction
    const lotSize = Math.min(0.001, currentUser.mainBalance / newPrice);
    
    if (marketChange < 0 && currentUser.mainBalance >= lotSize * newPrice) {
        // Market down - Buy
        executeTradeInternal(symbol, 'buy', lotSize, newPrice);
    } else if (marketChange > 0) {
        // Market up - Check for open positions to sell
        const openPositions = trades.filter(t => 
            t.customerId === currentUser.id && 
            t.symbol === symbol && 
            t.status === 'open'
        );
        
        openPositions.forEach(position => {
            closeTrade(position.id, newPrice);
        });
    }
    
    // Update UI if customer dashboard is active
    const priceElement = document.getElementById('price-' + symbol.replace('pilgrimCoin', 'pilgrim'));
    if (priceElement) {
        priceElement.textContent = '$' + newPrice.toFixed(2);
        priceElement.className = 'value ' + (marketChange >= 0 ? 'up' : 'down');
    }
}

function executeTrade(type) {
    const symbol = document.getElementById('trade-symbol').value;
    const lotSize = parseFloat(document.getElementById('trade-lot-size').value);
    const price = marketData[symbol];
    
    if (currentUser.mainBalance < lotSize * price) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    executeTradeInternal(symbol, type, lotSize, price);
}

function executeTradeInternal(symbol, type, lotSize, price) {
    const trade = {
        id: 'trade-' + Date.now(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        symbol: symbol,
        type: type,
        lotSize: lotSize,
        openPrice: price,
        closePrice: null,
        profit: null,
        status: 'open',
        date: new Date().toISOString()
    };
    
    // Deduct from main balance
    currentUser.mainBalance -= lotSize * price;
    
    trades.push(trade);
    saveToLocalStorage();
    
    addTransaction({
        customerId: currentUser.id,
        customerName: currentUser.name,
        type: 'debit',
        amount: lotSize * price,
        method: 'Trading',
        status: 'completed',
        details: `${type.toUpperCase()} ${lotSize} ${symbol} at $${price.toFixed(2)}`
    });
    
    updateOpenPositions();
    showToast(`Trade opened: ${type.toUpperCase()} ${lotSize} ${symbol}`, 'success');
}

function closeTrade(tradeId, closePrice) {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    
    trade.closePrice = closePrice;
    trade.profit = (closePrice - trade.openPrice) * trade.lotSize;
    trade.status = 'closed';
    
    // Add profit to profit balance
    if (trade.profit > 0) {
        currentUser.profitBalance += trade.profit;
    } else {
        currentUser.mainBalance += Math.abs(trade.profit);
    }
    
    // Return principal
    currentUser.mainBalance += trade.lotSize * trade.closePrice;
    
    addTransaction({
        customerId: currentUser.id,
        customerName: currentUser.name,
        type: 'credit',
        amount: trade.lotSize * trade.closePrice,
        method: 'Trading',
        status: 'completed',
        details: `Closed ${trade.symbol} position - Profit: $${trade.profit.toFixed(2)}`
    });
    
    saveToLocalStorage();
    updateOpenPositions();
    
    if (currentUser.id === window.currentUser?.id) {
        window.currentUser = currentUser;
    }
}

function updateOpenPositions() {
    const tbody = document.getElementById('open-positions');
    if (!tbody) return;
    
    const openTrades = trades.filter(t => 
        t.customerId === currentUser.id && 
        t.status === 'open'
    );
    
    tbody.innerHTML = openTrades.map(trade => {
        const currentPrice = marketData[trade.symbol];
        const profit = (currentPrice - trade.openPrice) * trade.lotSize;
        
        return `
            <tr>
                <td>${trade.symbol}</td>
                <td><span class="badge ${trade.type}">${trade.type.toUpperCase()}</span></td>
                <td>${trade.lotSize}</td>
                <td>$${trade.openPrice.toFixed(2)}</td>
                <td>$${currentPrice.toFixed(2)}</td>
                <td class="${profit >= 0 ? 'text-success' : 'text-error'}">$${profit.toFixed(2)}</td>
                <td>
                    <button class="action-btn activate" onclick="closeTrade('${trade.id}', ${currentPrice})">
                        Close
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// KYC Functions
function submitKYC(event) {
    event.preventDefault();
    
    currentUser.kycDocuments = {
        name: document.getElementById('kyc-name').value,
        dob: document.getElementById('kyc-dob').value,
        country: document.getElementById('kyc-country').value,
        idType: document.getElementById('kyc-id-type').value,
        idNumber: document.getElementById('kyc-id-number').value,
        bankName: document.getElementById('kyc-bank-name').value,
        accountNumber: document.getElementById('kyc-account-number').value
    };
    
    currentUser.kycStatus = 'submitted';
    saveToLocalStorage();
    
    showCustomerSection('kyc');
    showToast('KYC submitted successfully!', 'success');
}

// Transaction Functions
function addTransaction(transactionData) {
    const transaction = {
        id: 'tx-' + Date.now(),
        date: new Date().toISOString(),
        ...transactionData
    };
    
    transactions.push(transaction);
    saveToLocalStorage();
}

function updateCustomerTransactions() {
    const container = document.getElementById('customer-transactions-list');
    if (!container) return;
    
    const customerTransactions = transactions.filter(t => t.customerId === currentUser.id);
    
    container.innerHTML = customerTransactions.map(tx => `
        <div class="transaction-item">
            <div>
                <div class="type">${tx.type.toUpperCase()} - ${tx.method}</div>
                <small>${new Date(tx.date).toLocaleString()}</small>
                <p>${tx.details}</p>
            </div>
            <div class="amount ${tx.type}">
                ${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Withdrawal Functions
function transferProfitToMain() {
    if (currentUser.profitBalance <= 0) {
        showToast('No profit balance to transfer', 'error');
        return;
    }
    
    const amount = currentUser.profitBalance;
    currentUser.mainBalance += amount;
    currentUser.profitBalance = 0;
    
    addTransaction({
        customerId: currentUser.id,
        customerName: currentUser.name,
        type: 'credit',
        amount: amount,
        method: 'Transfer',
        status: 'completed',
        details: 'Profit transferred to main balance'
    });
    
    saveToLocalStorage();
    showCustomerSection('withdrawal');
    showToast(`$${amount.toFixed(2)} transferred to main balance!`, 'success');
}

function submitWithdrawal(event) {
    event.preventDefault();
    
    const source = document.getElementById('withdraw-source').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const bankName = document.getElementById('withdraw-bank-name').value;
    const accountNumber = document.getElementById('withdraw-account-number').value;
    const accountName = document.getElementById('withdraw-account-name').value;
    const bankType = document.getElementById('withdraw-bank-type').value;
    
    if (source === 'main' && amount > currentUser.mainBalance) {
        showToast('Insufficient main balance', 'error');
        return;
    }
    
    if (source === 'profit' && amount > currentUser.profitBalance) {
        showToast('Insufficient profit balance', 'error');
        return;
    }
    
    // Deduct from balance
    if (source === 'main') {
        currentUser.mainBalance -= amount;
    } else {
        currentUser.profitBalance -= amount;
    }
    
    addTransaction({
        customerId: currentUser.id,
        customerName: currentUser.name,
        type: 'debit',
        amount: amount,
        method: 'Withdrawal',
        status: 'processing',
        details: `Withdrawal to ${bankType} bank: ${bankName}, Account: ${accountNumber}, Name: ${accountName}`
    });
    
    saveToLocalStorage();
    showCustomerSection('withdrawal');
    showToast('Withdrawal request submitted successfully!', 'success');
}

// Profile Functions
function updateProfile(event) {
    event.preventDefault();
    
    currentUser.name = document.getElementById('profile-name').value;
    currentUser.phone = document.getElementById('profile-phone').value;
    
    saveToLocalStorage();
    showToast('Profile updated successfully!', 'success');
}

// Utility Functions
function getTotalBalance() {
    return users.reduce((total, user) => total + user.mainBalance + user.profitBalance, 0);
}

function updateMarketData() {
    // Simulate market updates
    Object.keys(marketData).forEach(symbol => {
        const change = (Math.random() - 0.5) * 0.01;
        marketData[symbol] = marketData[symbol] * (1 + change);
    });
    
    saveToLocalStorage();
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('active');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize market data updates
setInterval(updateMarketData, 5000);