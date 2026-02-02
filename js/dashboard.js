document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirection should be relative to the dashboard location
        window.location.href = '../login.html';
        return;
    }

    // Update User Info
    const userNameEls = document.querySelectorAll('.user-name');
    userNameEls.forEach(el => el.textContent = currentUser.name);

    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) userEmailEl.textContent = currentUser.email;

    // Remove dummy placeholders from User Dashboard if they exist
    const userStatus = document.getElementById('user-status');
    if (userStatus) {
        userStatus.textContent = currentUser.role === 'admin' ? 'System Administrator' : 'Production Client';
    }

    const userLocation = document.getElementById('user-location');
    if (userLocation) {
        // Since we don't collect location yet, we hide it or show "Active Session"
        userLocation.innerHTML = `<i class="fas fa-circle" style="color: #4ade80; font-size: 0.6rem; margin-right: 10px;"></i> Active Session`;
    }

    // Role-based Access Control
    const isEditingAdmin = window.location.pathname.includes('admin-dashboard');
    const isEditingUser = window.location.pathname.includes('user-dashboard');

    if (isEditingAdmin && currentUser.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
    if (isEditingUser && currentUser.role !== 'user') {
        window.location.href = '../login.html';
        return;
    }

    if (currentUser.role === 'admin' && isEditingAdmin) {
        loadAdminStats();
        loadUsersTable();
    } else if (currentUser.role === 'user' && isEditingUser) {
        loadUserActivities();
        loadUserBookings();
    }


});

function loadAdminStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    // Calculate stats
    const totalUsers = users.length;
    const totalBookings = bookings.length;

    // Get upcoming events (events with date >= today)
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = bookings.filter(b => b.date >= today).length;

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.revenue || 0), 0);
    const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(totalRevenue);

    const container = document.getElementById('stats-grid');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <p style="color: var(--text-muted); font-size: 0.9rem;">Total Users</p>
                <h2 style="font-size: 2rem;">${totalUsers}</h2>
            </div>
            <div class="card">
                <p style="color: var(--text-muted); font-size: 0.9rem;">Total Bookings</p>
                <h2 style="font-size: 2rem;">${totalBookings}</h2>
            </div>
            <div class="card">
                <p style="color: var(--text-muted); font-size: 0.9rem;">Upcoming Events</p>
                <h2 style="font-size: 2rem;">${upcomingEvents}</h2>
            </div>
            <div class="card">
                <p style="color: var(--text-muted); font-size: 0.9rem;">Estimated Revenue</p>
                <h2 style="font-size: 2rem; color: var(--electric-purple);">${formattedRevenue}</h2>
            </div>
        `;
    }
}

function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tableBody = document.getElementById('users-table-body');
    if (tableBody) {
        tableBody.innerHTML = users.map(user => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 15px;">${user.name}</td>
                <td style="padding: 15px;">${user.email}</td>
                <td style="padding: 15px;"><span style="background: ${user.role === 'admin' ? 'var(--electric-purple)' : 'var(--glass-bg)'}; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem;">${user.role}</span></td>
                <td style="padding: 15px;">Active</td>
            </tr>
        `).join('');
    }
}

function loadUserActivities() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');

    if (!currentUser) return;

    // Filter for current user's data
    const userBookings = bookings.filter(b => b.email === currentUser.email).map(b => ({
        type: 'Booking',
        title: `${b.attendees || 'N/A'} PAX - ${b.date || 'TBD'}`,
        date: b.date || 'N/A',
        status: b.status || 'Pending'
    }));

    const userInquiries = contacts.filter(c => c.email === currentUser.email).map(c => ({
        type: 'Inquiry',
        title: (c.type || 'General').toUpperCase(),
        date: c.date ? new Date(c.date).toLocaleDateString() : 'N/A',
        status: 'Sent'
    }));

    const activities = [...userBookings, ...userInquiries];

    const container = document.getElementById('activity-list');
    if (container) {
        if (activities.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No recent activity found.</p>`;
            return;
        }

        container.innerHTML = activities.map(act => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: var(--glass-bg); border-radius: 12px; margin-bottom: 10px; border: 1px solid var(--glass-border);">
                <div>
                    <h4 style="font-size: 1rem;">${act.title}</h4>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">${act.type} • ${act.date}</p>
                </div>
                <span style="font-size: 0.8rem; font-weight: 700; color: ${act.status === 'Confirmed' || act.status === 'Sent' ? '#4ade80' : 'var(--neon-pink)'}">${act.status}</span>
            </div>
        `).join('');
    }
}



function loadUserBookings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let bookings = [];
    try {
        const rawBookings = localStorage.getItem('bookings');
        bookings = rawBookings ? JSON.parse(rawBookings) : [];
        if (!Array.isArray(bookings)) bookings = [];
    } catch (e) {
        console.error('Error parsing bookings:', e);
        bookings = [];
    }

    if (!currentUser) return;

    // Filter for current user's bookings
    const userBookings = bookings.filter(b => b && b.email === currentUser.email);
    const container = document.getElementById('user-bookings-list');

    if (container) {
        if (userBookings.length === 0) {
            container.innerHTML = `
                <div class="card-glass" style="text-align: center; padding: 60px; border: 2px dashed var(--glass-border); background: transparent;">
                    <i class="fas fa-calendar-plus" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 24px; opacity: 0.5;"></i>
                    <h4 style="margin-bottom: 12px; font-size: 1.25rem;">No Bookings Found</h4>
                    <p style="color: var(--text-muted); max-width: 300px; margin: 0 auto 30px;">You haven't initialized any cinematic production sequences yet.</p>
                    <a href="../../booking.html" class="btn btn-secondary btn-sm" style="display: inline-flex;">Initialize First Booking</a>
                </div>
            `;
            return;
        }

        container.innerHTML = userBookings.map(booking => `
            <div class="card-glass" style="padding: 30px; border-left: 4px solid var(--electric-purple); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <h4 style="font-size: 1.25rem;">${booking.name || 'Private Event'}</h4>
                        <p style="color: var(--text-muted); font-size: 0.8rem; letter-spacing: 1px;">ID: #${booking.id || 'N/A'}</p>
                    </div>
                    <span style="background: var(--electric-purple); padding: 5px 15px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; letter-spacing: 1px;">${(booking.status || 'CONFIRMED').toUpperCase()}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div>
                        <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 1px;">Event Date</p>
                        <p style="font-weight: 600; font-size: 1.1rem;">${booking.date || 'TBD'}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 1px;">Scale</p>
                        <p style="font-weight: 600; font-size: 1.1rem;">${booking.attendees || 'N/A'} PAX</p>
                    </div>
                    <div>
                        <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 1px;">Project Value</p>
                        <p style="font-weight: 600; font-size: 1.1rem; color: var(--neon-pink);">$${(Number(booking.revenue) || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--glass-border);">
                    <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; margin-bottom: 12px; letter-spacing: 1px;">Production Specs</p>
                    <p style="font-size: 0.95rem; color: var(--soft-white); line-height: 1.6; opacity: 0.8;">${booking.specs || 'Standard cinematic production architecture requested.'}</p>
                </div>
            </div>
        `).join('');
    }
}


