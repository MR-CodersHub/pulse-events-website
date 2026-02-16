document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initAnimations();
    checkAuthState();
    initFloatingElements();
});

// Navbar Logic
function initNavbar() {
    const nav = document.querySelector('.navbar');
    const profileTrigger = document.querySelector('.profile-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Profile Dropdown Toggle
    if (profileTrigger && dropdownMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });
    }

    // Hamburger Menu Toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Helper to get relative path based on page depth
function getPathPrefix() {
    const path = window.location.pathname;
    // Current structure:
    // /index.html (0)
    // /auth/login.html (1)
    // /auth/admin/admin-dashboard.html (2)

    // Check if we are in admin/user folder (level 2)
    if (path.includes('/admin/') || path.includes('/user/')) {
        return '../../';
    }
    // Check if we are in auth folder (level 1)
    if (path.includes('/auth/')) {
        return '../';
    }
    // Root level
    return '';
}

// Auth State Management
function checkAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dropdownMenu = document.getElementById('dropdown-menu-content');

    if (!dropdownMenu) return;

    const prefix = getPathPrefix();

    if (currentUser) {
        // User is logged in
        let dashboardLink = currentUser.role === 'admin'
            ? prefix + 'auth/admin/admin-dashboard.html'
            : prefix + 'auth/user/user-dashboard.html';

        dropdownMenu.innerHTML = `
            <div style="padding: 10px 16px; border-bottom: 1px solid var(--glass-border); margin-bottom: 8px;">
                <p style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Account</p>
                <p style="font-weight: 600; font-size: 0.95rem;">${currentUser.name}</p>
            </div>
            <a href="${dashboardLink}" class="dropdown-item">
                <i class="fas fa-th-large"></i> Dashboard
            </a>
            <a href="#" class="dropdown-item">
                <i class="fas fa-user-edit"></i> Edit Profile
            </a>
            <div style="height: 1px; background: var(--glass-border); margin: 8px 0;"></div>
            <a href="javascript:void(0)" onclick="logout()" class="dropdown-item" style="color: var(--neon-pink);">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        `;
    } else {
        // User is not logged in
        dropdownMenu.innerHTML = `
            <a href="${prefix}auth/login.html" class="dropdown-item">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
            <a href="${prefix}auth/signup.html" class="dropdown-item">
                <i class="fas fa-user-plus"></i> Sign Up
            </a>
        `;

        // Block dashboard access if on a dashboard page
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = prefix + 'auth/login.html';
        }
    }
}

// Logout Function
function logout() {
    const prefix = getPathPrefix();
    localStorage.removeItem('currentUser');
    window.location.href = prefix + 'index.html';
}

// Reveal Animations
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-reveal').forEach(el => observer.observe(el));
}

// Dynamic Floating Glows
function initFloatingElements() {
    const container = document.body;
    for (let i = 0; i < 3; i++) {
        const glow = document.createElement('div');
        glow.className = 'bg-glow';
        glow.style.top = Math.random() * 100 + '%';
        glow.style.left = Math.random() * 100 + '%';
        glow.style.background = i % 2 === 0 ? 'var(--electric-purple)' : 'var(--neon-pink)';
        container.appendChild(glow);
    }
}

// Global Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    let isValid = true;
    form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--neon-pink)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--glass-border)';
        }
    });
    return isValid;
}
