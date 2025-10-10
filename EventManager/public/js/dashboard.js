// Dashboard funkcionalnost za EventManager

let currentUser = null;
let allEvents = [];
let myEvents = [];
let myRegistrations = [];

// Inicializacija dashboarda
document.addEventListener('DOMContentLoaded', async function() {
    // Preveri avtentikacijo
    currentUser = await checkAuthentication();
    if (!currentUser) return;
    
    // Nastavi event listenere
    setupEventListeners();
    
    // Naloži podatke
    await loadAllData();
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
    
    // Iskanje
    const searchBtn = document.getElementById('searchBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const searchInputs = ['searchQuery', 'searchLocation', 'searchDate'];
    
    searchBtn.addEventListener('click', performSearch);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Iskanje ob tipkanju (debounced)
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce(performSearch, 500));
        }
    });
    
    // Gumb za nov dogodek
    document.getElementById('createEventBtn').addEventListener('click', () => openEventModal());
    
    // Modal eventi
    document.getElementById('cancelEventBtn').addEventListener('click', closeEventModal);
    document.querySelector('.modal-close').addEventListener('click', closeEventModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeEventModal);
    document.getElementById('eventForm').addEventListener('submit', saveEvent);
}

// Preklopi med zavihki
function switchTab(tabName) {
    // Posodobi gumbе
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
        case 'myEvents':
            if (myEvents.length === 0) loadMyEvents();
            break;
        case 'myRegistrations':
                // Vedno osveži moje prijave ob preklopu
                loadMyRegistrations();
            break;
    }
}

// Naloži vse podatke
async function loadAllData() {
    // Najprej naložimo registracije, da lahko pravilno prikažemo stanje dogodkov
    await loadMyRegistrations();
    await loadAllEvents();
}

// Naloži vse dogodke
async function loadAllEvents() {
    try {
        const events = await api.get('/api/events');
        allEvents = events;
        displayAllEvents(events);
    } catch (error) {
        console.error('Napaka pri nalaganju dogodkov:', error);
        document.getElementById('allEventsList').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju dogodkov.</p>';
    }
}

// Naloži moje dogodke
async function loadMyEvents() {
    try {
        const events = await api.get('/api/events/my/events');
        myEvents = events;
        displayMyEvents(events);
    } catch (error) {
        console.error('Napaka pri nalaganju mojih dogodkov:', error);
        document.getElementById('myEventsList').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju dogodkov.</p>';
    }
}

// Naloži moje prijave
async function loadMyRegistrations() {
    try {
        const registrations = await api.get('/api/events/my/registrations');
        myRegistrations = registrations;
        // Samo prikaži, če je zavihek aktiven
        if (!document.getElementById('myRegistrations').classList.contains('hidden')) {
            displayMyRegistrations(registrations);
        }
    } catch (error) {
        console.error('Napaka pri nalaganju prijav:', error);
        if (!document.getElementById('myRegistrations').classList.contains('hidden')) {
            document.getElementById('myRegistrationsList').innerHTML = 
                '<p style="text-align: center; color: #dc3545;">Napaka pri nalaganju prijav.</p>';
        }
    }
}

// Prikaži vse dogodke
function displayAllEvents(events) {
    const container = document.getElementById('allEventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Ni dogodkov za prikaz.</p>';
        return;
    }
    
    container.innerHTML = events.map(event => createEventCard(event, 'all')).join('');
}

// Prikaži moje dogodke
function displayMyEvents(events) {
    const container = document.getElementById('myEventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Še niste ustvarili nobenih dogodkov.</p>';
        return;
    }
    
    container.innerHTML = events.map(event => createEventCard(event, 'my')).join('');
}

// Prikaži moje prijave
function displayMyRegistrations(registrations) {
    const container = document.getElementById('myRegistrationsList');
    
    if (registrations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">Niste prijavljeni na nobene dogodke.</p>';
        return;
    }
    
    container.innerHTML = registrations.map(reg => createRegistrationCard(reg)).join('');
}

// Ustvari kartico dogodka
function createEventCard(event, type) {
    const isFuture = isFutureDate(event.datum, event.cas);
    const isMyEvent = type === 'my';
    
    // Preverimo, če je uporabnik že prijavljen na ta dogodek
    const isRegistered = myRegistrations.some(reg => reg.event_id === event.id);
    const canRegister = isFuture && !isMyEvent && !isRegistered;
    const canUnregister = isFuture && !isMyEvent && isRegistered;
    
    return `
        <div class="card" data-event-id="${event.id}">
            <h3>${escapeHtml(event.ime)}</h3>
            <div class="card-meta">
                📅 ${formatDateTime(event.datum, event.cas)}<br>
                📍 ${escapeHtml(event.lokacija)}<br>
                ${!isMyEvent ? `👤 ${escapeHtml(event.organizator_ime)} ${escapeHtml(event.organizator_priimek)}<br>` : ''}
                👥 Prijavljenih: ${event.stevilo_prijavljenih}${event.maxUdelezenci ? '/' + event.maxUdelezenci : ''}<br>
                ${!isFuture ? '<span style="color: #dc3545;">⏰ Dogodek je potekel</span>' : ''}
                ${isRegistered ? '<span style="color: #28a745;">✅ Prijavljeni</span>' : ''}
            </div>
            ${event.opis ? `<p>${escapeHtml(event.opis)}</p>` : ''}
            <div class="card-actions">
                ${canRegister ? `<button class="btn btn-success btn-small" onclick="registerForEvent(${event.id})">Prijavite se</button>` : ''}
                ${canUnregister ? `<button class="btn btn-danger btn-small" onclick="unregisterFromEvent(${event.id})">Odjavi se</button>` : ''}
                ${isMyEvent ? `
                    <button class="btn btn-primary btn-small" onclick="editEvent(${event.id})">Uredi</button>
                    <button class="btn btn-secondary btn-small" onclick="viewRegistrations(${event.id})">Prijave (${event.stevilo_prijavljenih})</button>
                    <button class="btn btn-danger btn-small" onclick="deleteEvent(${event.id})">Izbriši</button>
                ` : ''}
            </div>
        </div>
    `;
}

// Ustvari kartico prijave
function createRegistrationCard(registration) {
    const isFuture = isFutureDate(registration.datum, registration.cas);
    
    return `
        <div class="card">
            <h3>${escapeHtml(registration.ime)}</h3>
            <div class="card-meta">
                📅 ${formatDateTime(registration.datum, registration.cas)}<br>
                📍 ${escapeHtml(registration.lokacija)}<br>
                👤 Organizator: ${escapeHtml(registration.organizator_ime)} ${escapeHtml(registration.organizator_priimek)}<br>
                ✅ Prijavljen: ${formatDate(registration.prijavljen)}<br>
                ${!isFuture ? '<span style="color: #dc3545;">⏰ Dogodek je potekel</span>' : ''}
            </div>
            ${registration.opis ? `<p>${escapeHtml(registration.opis)}</p>` : ''}
            <div class="card-actions">
                ${isFuture ? `<button class="btn btn-danger btn-small" onclick="unregisterFromEvent(${registration.event_id})">Odjavi se</button>` : ''}
            </div>
        </div>
    `;
}

// Iskanje dogodkov
async function performSearch() {
    const query = document.getElementById('searchQuery').value;
    const location = document.getElementById('searchLocation').value;
    const date = document.getElementById('searchDate').value;
    
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (location) params.append('lokacija', location);
    if (date) params.append('datum', date);
    
    try {
        const events = await api.get(`/api/events?${params.toString()}`);
        displayAllEvents(events);
    } catch (error) {
        console.error('Napaka pri iskanju:', error);
        showAlert('Napaka pri iskanju dogodkov', 'error');
    }
}

// Počisti iskalne filtre
async function clearFilters() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('searchLocation').value = '';
    document.getElementById('searchDate').value = '';
    
    // Naloži vse dogodke brez filtrov
    try {
        const events = await api.get('/api/events');
        displayAllEvents(events);
        showAlert('Filtri počiščeni', 'success');
    } catch (error) {
        console.error('Napaka pri nalaganju dogodkov:', error);
        showAlert('Napaka pri nalaganju dogodkov', 'error');
    }
}

// Prijava na dogodek
async function registerForEvent(eventId) {
    try {
        const result = await api.post(`/api/events/${eventId}/register`);
        
        if (result.success) {
            showAlert(result.message, 'success');
            
            // Najprej osveži moje prijave (vir resnice za stanje gumbov)
            await loadMyRegistrations();
            // Nato osveži vse dogodke, da se takoj pokaže gumb Odjavi se in posodobljeno štetje
            await loadAllEvents();
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri prijavi:', error);
        showAlert('Napaka pri prijavi na dogodek', 'error');
    }
}

// Odjava z dogodka
async function unregisterFromEvent(eventId) {
    if (!confirm('Ste prepričani, da se želite odjaviti z tega dogodka?')) {
        return;
    }
    
    try {
        const result = await api.delete(`/api/events/${eventId}/register`);
        
        if (result.success) {
            showAlert(result.message, 'success');
            
            // Osveži vse sezname
            await loadMyRegistrations();
            await loadAllEvents();
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri odjavi:', error);
        showAlert('Napaka pri odjavi z dogodka', 'error');
    }
}

// Odpri modal za dogodek
function openEventModal(event = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.getElementById('modalTitle');
    
    // Počisti form
    form.reset();
    
    if (event) {
        // Urejanje dogodka
        title.textContent = 'Uredi dogodek';
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventName').value = event.ime;
        document.getElementById('eventDescription').value = event.opis || '';
        document.getElementById('eventDate').value = event.datum;
        document.getElementById('eventTime').value = event.cas || '';
        document.getElementById('eventLocation').value = event.lokacija;
        document.getElementById('eventMaxParticipants').value = event.maxUdelezenci || '';
    } else {
        // Nov dogodek
        title.textContent = 'Nov dogodek';
        document.getElementById('eventId').value = '';
        
        // Nastavi minimalni datum na danes
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').min = today;
    }
    
    modal.classList.remove('hidden');
}

// Zapri modal
function closeEventModal() {
    document.getElementById('eventModal').classList.add('hidden');
}

// Shrani dogodek
async function saveEvent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Odstrani prazne vrednosti
    Object.keys(data).forEach(key => {
        if (data[key] === '') {
            delete data[key];
        }
    });
    
    const eventId = data.eventId;
    delete data.eventId;
    
    try {
        let result;
        if (eventId) {
            // Posodobi dogodek
            result = await api.put(`/api/events/${eventId}`, data);
        } else {
            // Ustvari nov dogodek
            result = await api.post('/api/events', data);
        }
        
        if (result.success) {
            showAlert(result.message, 'success');
            closeEventModal();
            
            // Resetiraj cache in osveži podatke
            allEvents = [];
            myEvents = [];
            
            await loadAllEvents();
            
            // Če je zavihek "Moji dogodki" aktiven, ga osveži
            if (!document.getElementById('myEvents').classList.contains('hidden')) {
                await loadMyEvents();
            }
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri shranjevanju:', error);
        showAlert('Napaka pri shranjevanju dogodka', 'error');
    }
}

// Uredi dogodek
async function editEvent(eventId) {
    try {
        const event = await api.get(`/api/events/${eventId}`);
        openEventModal(event);
    } catch (error) {
        console.error('Napaka pri nalaganju dogodka:', error);
        showAlert('Napaka pri nalaganju podatkov dogodka', 'error');
    }
}

// Izbriši dogodek
async function deleteEvent(eventId) {
    if (!confirm('Ste prepričani, da želite izbrisati ta dogodek? Vsi prijavljeni uporabniki bodo obveščeni.')) {
        return;
    }
    
    try {
        const result = await api.delete(`/api/events/${eventId}`);
        
        if (result.success) {
            showAlert(result.message, 'success');
            
            // Osveži vse sezname
            await loadMyEvents();
            await loadAllEvents();
            
            // Resetiraj cache
            myEvents = [];
            allEvents = [];
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Napaka pri brisanju:', error);
        showAlert('Napaka pri brisanju dogodka', 'error');
    }
}

// Prikaži prijave na dogodek
async function viewRegistrations(eventId) {
    try {
        const registrations = await api.get(`/api/events/${eventId}/registrations`);
        
        let content = '<h3>Seznam prijavljenih uporabnikov</h3>';
        
        if (registrations.length === 0) {
            content += '<p>Ni prijavljenih uporabnikov.</p>';
        } else {
            content += '<table class="table"><thead><tr><th>Ime</th><th>Email</th><th>Prijavljen</th></tr></thead><tbody>';
            registrations.forEach(reg => {
                content += `
                    <tr>
                        <td>${escapeHtml(reg.ime)} ${escapeHtml(reg.priimek)}</td>
                        <td>${escapeHtml(reg.email)}</td>
                        <td>${formatDate(reg.prijavljen)}</td>
                    </tr>
                `;
            });
            content += '</tbody></table>';
        }
        
        // Prikaži v alert-u ali modal-u
        showAlert(content, 'info');
        
    } catch (error) {
        console.error('Napaka pri nalaganju prijav:', error);
        showAlert('Napaka pri nalaganju seznama prijav', 'error');
    }
}