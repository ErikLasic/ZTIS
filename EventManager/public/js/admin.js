// Admin funkcionalnost za EventManager

let currentUser = null;
let allUsers = [];
let allEvents = [];
let allRegistrations = [];
let stats = {};

// Inicializacija admin strani
document.addEventListener('DOMContentLoaded', async function() {
    // Preveri avtentikacijo in admin pravice
    currentUser = await checkAuthentication();
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = '/dashboard';
        return;
    }
    
    // Nastavi event listenere
    setupEventListeners();
    
    // Naloži podatke
    await loadStats();
    await loadUsers();
});

// Nastavi event listenere
function setupEventListeners() {
    // Zavihki
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Preklopi med zavihki
function switchTab(tabName) {
    // Posodobi gumbe
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Prikaži vsebino zavihka
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(tabName);
    activeTab.classList.remove('hidden');
    activeTab.classList.add('active');
    
    // Naloži podatke za zavihek, če še niso naloženi
    switch(tabName) {
        case 'events':
            if (allEvents.length === 0) loadEvents();
            break;
        case 'registrations':
            if (allRegistrations.length === 0) loadRegistrations();
            break;
        case 'activity':
            loadActivity();
            break;
    }
}

// Naloži statistike
async function loadStats() {
    try {
        const response = await api.get('/api/admin/stats');
        stats = response;
        displayStats(response);
    } catch (error) {
        console.error('Napaka pri nalaganju statistik:', error);
        document.getElementById('statsContainer').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju statistik.</p>';
    }
}

// Prikaži statistike
function displayStats(data) {
    const container = document.getElementById('statsContainer');
    
    container.innerHTML = `
        <div class="stat-card">
            <span class="stat-number">${data.totalUsers || 0}</span>
            <div class="stat-label">Skupaj uporabnikov</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${data.totalEvents || 0}</span>
            <div class="stat-label">Skupaj dogodkov</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${data.activeEvents || 0}</span>
            <div class="stat-label">Aktivnih dogodkov</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${data.totalRegistrations || 0}</span>
            <div class="stat-label">Skupaj prijav</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${data.pastEvents || 0}</span>
            <div class="stat-label">Preteklih dogodkov</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${data.avgRegistrationsPerEvent || 0}</span>
            <div class="stat-label">Povprečje prijav/dogodek</div>
        </div>
    `;
}

// Naloži uporabnike
async function loadUsers() {
    try {
        const users = await api.get('/api/admin/users');
        allUsers = users;
        displayUsers(users);
    } catch (error) {
        console.error('Napaka pri nalaganju uporabnikov:', error);
        document.getElementById('usersContainer').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju uporabnikov.</p>';
    }
}

// Prikaži uporabnike
function displayUsers(users) {
    const container = document.getElementById('usersContainer');
    
    if (users.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Ni uporabnikov.</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Uporabnik</th>
                    <th>Email</th>
                    <th>Registriran</th>
                    <th>Dogodkov</th>
                    <th>Prijav</th>
                    <th>Admin</th>
                    <th>Akcije</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${escapeHtml(user.ime)} ${escapeHtml(user.priimek)}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>${formatDate(user.ustvarjen)}</td>
                        <td>${user.stevilo_dogodkov}</td>
                        <td>${user.stevilo_prijav}</td>
                        <td>
                            <span class="btn btn-small ${user.isAdmin ? 'btn-success' : 'btn-secondary'}">
                                ${user.isAdmin ? 'Da' : 'Ne'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-small btn-primary" onclick="toggleAdmin(${user.id}, ${!user.isAdmin})">
                                ${user.isAdmin ? 'Odvzemi admin' : 'Dodeli admin'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Naloži dogodke
async function loadEvents() {
    try {
        const events = await api.get('/api/admin/events');
        allEvents = events;
        displayEvents(events);
    } catch (error) {
        console.error('Napaka pri nalaganju dogodkov:', error);
        document.getElementById('eventsContainer').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju dogodkov.</p>';
    }
}

// Prikaži dogodke
function displayEvents(events) {
    const container = document.getElementById('eventsContainer');
    
    if (events.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Ni dogodkov.</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Dogodek</th>
                    <th>Organizator</th>
                    <th>Datum</th>
                    <th>Lokacija</th>
                    <th>Prijavljenih</th>
                    <th>Ustvarjen</th>
                    <th>Akcije</th>
                </tr>
            </thead>
            <tbody>
                ${events.map(event => `
                    <tr>
                        <td>
                            <strong>${escapeHtml(event.ime)}</strong>
                            ${event.opis ? `<br><small>${escapeHtml(event.opis.substring(0, 50))}${event.opis.length > 50 ? '...' : ''}</small>` : ''}
                        </td>
                        <td>${escapeHtml(event.organizator_ime)} ${escapeHtml(event.organizator_priimek)}<br>
                            <small>${escapeHtml(event.organizator_email)}</small>
                        </td>
                        <td>${formatDateTime(event.datum, event.cas)}</td>
                        <td>${escapeHtml(event.lokacija)}</td>
                        <td>${event.stevilo_prijavljenih}${event.maxUdelezenci ? '/' + event.maxUdelezenci : ''}</td>
                        <td>${formatDate(event.ustvarjen)}</td>
                        <td>
                            <button class="btn btn-small btn-primary" onclick="sendNotifications(${event.id})">
                                Pošlji obvestila
                            </button>
                            <button class="btn btn-small btn-danger" onclick="deleteEventAdmin(${event.id})">
                                Izbriši
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Naloži prijave
async function loadRegistrations() {
    try {
        const registrations = await api.get('/api/admin/registrations');
        allRegistrations = registrations;
        displayRegistrations(registrations);
    } catch (error) {
        console.error('Napaka pri nalaganju prijav:', error);
        document.getElementById('registrationsContainer').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju prijav.</p>';
    }
}

// Prikaži prijave
function displayRegistrations(registrations) {
    const container = document.getElementById('registrationsContainer');
    
    if (registrations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Ni prijav.</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Uporabnik</th>
                    <th>Dogodek</th>
                    <th>Organizator</th>
                    <th>Datum dogodka</th>
                    <th>Prijavljen</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${registrations.map(reg => `
                    <tr>
                        <td>${escapeHtml(reg.uporabnik_ime)} ${escapeHtml(reg.uporabnik_priimek)}<br>
                            <small>${escapeHtml(reg.uporabnik_email)}</small>
                        </td>
                        <td>
                            <strong>${escapeHtml(reg.dogodek_ime)}</strong><br>
                            <small>${escapeHtml(reg.lokacija)}</small>
                        </td>
                        <td>${escapeHtml(reg.organizator_ime)} ${escapeHtml(reg.organizator_priimek)}</td>
                        <td>${formatDateTime(reg.datum, reg.cas)}</td>
                        <td>${formatDate(reg.prijavljen)}</td>
                        <td>
                            <span class="btn btn-small btn-success">
                                ${escapeHtml(reg.status)}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Naloži aktivnost
async function loadActivity() {
    const container = document.getElementById('activityContainer');
    
    if (stats.recentActivity && stats.recentActivity.length > 0) {
        container.innerHTML = `
            <div class="grid grid-2">
                <div class="card">
                    <h3>Top organizatorji</h3>
                    ${stats.topOrganizers && stats.topOrganizers.length > 0 ? `
                        <table class="table">
                            <thead>
                                <tr><th>Organizator</th><th>Dogodkov</th></tr>
                            </thead>
                            <tbody>
                                ${stats.topOrganizers.map(org => `
                                    <tr>
                                        <td>${escapeHtml(org.ime)} ${escapeHtml(org.priimek)}<br>
                                            <small>${escapeHtml(org.email)}</small>
                                        </td>
                                        <td><strong>${org.stevilo_dogodkov}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>Ni podatkov.</p>'}
                </div>
                
                <div class="card">
                    <h3>Nedavna aktivnost</h3>
                    ${stats.recentActivity.map(activity => `
                        <div style="padding: 0.5rem 0; border-bottom: 1px solid #e9ecef;">
                            <strong>${activity.tip === 'event' ? '📅 Nov dogodek' : '✅ Prijava'}</strong><br>
                            <small>
                                ${escapeHtml(activity.uporabnik)} 
                                ${activity.tip === 'event' ? 'je ustvaril' : 'se je prijavil na'} 
                                "${escapeHtml(activity.dogodek)}"<br>
                                ${formatDate(activity.datum)}
                            </small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Ni nedavne aktivnosti.</p>';
    }
}

// Preklopi admin pravice
async function toggleAdmin(userId, makeAdmin) {
    const action = makeAdmin ? 'dodelitev' : 'odvzem';
    
    if (!confirm(`Ste prepričani, da želite ${action} admin pravic temu uporabniku?`)) {
        return;
    }
    
    try {
        const result = await api.put(`/api/admin/users/${userId}/admin`, {
            isAdmin: makeAdmin
        });
        
        if (result.success) {
            showAlert(result.message, 'success');
            await loadUsers(); // Osveži seznam
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri posodabljanju pravic:', error);
        showAlert('Napaka pri posodabljanju uporabniških pravic', 'error');
    }
}

// Pošlji obvestila
async function sendNotifications(eventId) {
    if (!confirm('Pošljem obvestila vsem prijavljenim uporabnikom za ta dogodek?')) {
        return;
    }
    
    try {
        const result = await api.post(`/api/admin/send-notifications/${eventId}`);
        
        if (result.success) {
            showAlert(`${result.message}. Poslano ${result.notifications.length} obvestil.`, 'success');
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri pošiljanju obvestil:', error);
        showAlert('Napaka pri pošiljanju obvestil', 'error');
    }
}

// Izbriši dogodek (admin)
async function deleteEventAdmin(eventId) {
    if (!confirm('Ste prepričani, da želite izbrisati ta dogodek? To bo izbrisalo tudi vse prijave na dogodek.')) {
        return;
    }
    
    try {
        const result = await api.delete(`/api/admin/events/${eventId}`);
        
        if (result.success) {
            showAlert(result.message, 'success');
            await loadEvents(); // Osveži seznam
            await loadStats(); // Osveži statistike
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri brisanju dogodka:', error);
        showAlert('Napaka pri brisanju dogodka', 'error');
    }
}