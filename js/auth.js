// Authentication Simulation logic
function signup(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Set role automatically based on email
    let role = 'user';
    if (email === 'admin@gmail.com' && password === 'admin123') {
        role = 'admin';
    }

    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('User already exists');
        return;
    }

    const newUser = { name, email, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful! Please login.');
    window.location.href = 'login.html';
}

function login(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Special check for hardcoded admin
    if (email === 'admin@gmail.com' && password === 'admin123') {
        const adminUser = { name: 'Admin', email: 'admin@gmail.com', role: 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        window.location.href = 'admin/admin-dashboard.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.role === 'admin') {
            window.location.href = 'admin/admin-dashboard.html';
        } else {
            window.location.href = 'user/user-dashboard.html';
        }
    } else {
        alert('Invalid credentials');
    }
}

// System initialization and Legacy Purge
// Final Pulse Purge & Init
(function () {
    const dummyNames = ['TechCorp Gala', 'Neon Nights', 'Sky High Festival', 'Private Birthday', 'John Doe', 'Alice Smith', 'Bob Johnson', 'Admin User', 'James Wilson', 'Sarah Jenkins', 'Michael Ross'];
    const dummyEmails = ['user@gmail.com', 'alice@gmail.com', 'bob@gmail.com', 'james@techcorp.com', 'sarah@festival.com', 'bob@bobevents.com', 'john@gmail.com'];

    const clean = (key, fn) => {
        try { let d = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(d)) localStorage.setItem(key, JSON.stringify(d.filter(fn))); } catch (e) { }
    };

    clean('users', u => u && !dummyEmails.includes(u.email));
    clean('bookings', b => b && !dummyEmails.includes(b.email) && !dummyNames.includes(b.name));
    clean('contacts', c => c && !dummyEmails.includes(c.email));

    if (!localStorage.getItem('users')) localStorage.setItem('users', '[]');
    if (!localStorage.getItem('bookings')) localStorage.setItem('bookings', '[]');
    if (!localStorage.getItem('contacts')) localStorage.setItem('contacts', '[]');

    const curr = JSON.parse(localStorage.getItem('currentUser'));
    if (curr && dummyEmails.includes(curr.email)) { localStorage.removeItem('currentUser'); window.location.reload(); }
})();




