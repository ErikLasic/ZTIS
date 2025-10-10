// Skupne funkcije za EventManager aplikacijo

// Prikaz sporočil
function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
    `;
    
    container.appendChild(alert);
    
    // Samodejno odstrani po 5 sekundah
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Formatiranje datuma
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('sl-SI', options);
}

// Formatiranje časa
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

// Formatiranje datuma in časa skupaj
function formatDateTime(date, time) {
    const formattedDate = formatDate(date);
    if (time) {
        return `${formattedDate} ob ${formatTime(time)}`;
    }
    return formattedDate;
}

// Preveri, če je datum v prihodnosti
function isFutureDate(date, time = null) {
    const eventDateTime = new Date(date + (time ? ` ${time}` : ''));
    return eventDateTime > new Date();
}

// Preverjanje prijavljenosti uporabnika
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            updateUserInterface(data.user);
            return data.user;
        } else {
            // Preusmeri na prijavo, če ni prijavljen
            if (window.location.pathname !== '/' && 
                window.location.pathname !== '/login' && 
                window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
            return null;
        }
    } catch (error) {
        console.error('Napaka pri preverjanju avtentikacije:', error);
        return null;
    }
}

// Posodobi uporabniški vmesnik glede na prijavljenega uporabnika
function updateUserInterface(user) {
    // Posodobi navigacijo
    const nav = document.querySelector('.nav ul');
    if (nav) {
        const currentPath = window.location.pathname;
        
        if (user) {
            // Prijavljen uporabnik
            nav.innerHTML = `
                <li><a href="/" ${currentPath === '/' ? 'class="active"' : ''}>Domov</a></li>
                <li><a href="/dashboard" ${currentPath === '/dashboard' ? 'class="active"' : ''}>Dogodki</a></li>
                ${user.isAdmin ? `<li><a href="/admin" ${currentPath === '/admin' ? 'class="active"' : ''}>Admin</a></li>` : ''}
            `;
        } else {
            // Ni prijavljen
            nav.innerHTML = `
                <li><a href="/" ${currentPath === '/' ? 'class="active"' : ''}>Domov</a></li>
                <li><a href="/login" ${currentPath === '/login' ? 'class="active"' : ''}>Prijava</a></li>
                <li><a href="/register" ${currentPath === '/register' ? 'class="active"' : ''}>Registracija</a></li>
            `;
        }
    }
    
    // Posodobi uporabniško ime v header-ju
    const userName = document.getElementById('userName');
    if (userName && user) {
        userName.textContent = `${user.ime} ${user.priimek}`;
    }
    
    // Prikaži admin link, če je potreben
    const adminLink = document.getElementById('adminLink');
    if (adminLink && user && user.isAdmin) {
        adminLink.classList.remove('hidden');
        adminLink.href = '/admin';
    }
}

// Odjava uporabnika
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Uspešno ste se odjavili', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    } catch (error) {
        console.error('Napaka pri odjavi:', error);
        showAlert('Napaka pri odjavi', 'error');
    }
}

// Event listener za odjavo
document.addEventListener('DOMContentLoaded', async function() {
    // Vedno preveri avtentikacijo in posodobi vmesnik
    const user = await checkAuthentication();
    
    // Nastavi event listener za odjavo
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Helpers za API klice
const api = {
    async get(url) {
        const response = await fetch(url, { credentials: 'same-origin' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const msg = data && data.error ? data.error : `Napaka (${response.status})`;
            throw new Error(msg);
        }
        return data;
    },
    
    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        const res = await response.json().catch(() => ({}));
        if (!response.ok) {
            const msg = res && res.error ? res.error : `Napaka (${response.status})`;
            throw new Error(msg);
        }
        return res;
    },
    
    async put(url, data) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        const res = await response.json().catch(() => ({}));
        if (!response.ok) {
            const msg = res && res.error ? res.error : `Napaka (${response.status})`;
            throw new Error(msg);
        }
        return res;
    },
    
    async delete(url) {
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const res = await response.json().catch(() => ({}));
        if (!response.ok) {
            const msg = res && res.error ? res.error : `Napaka (${response.status})`;
            throw new Error(msg);
        }
        return res;
    }
};

// Debounce funkcija za iskanje
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}