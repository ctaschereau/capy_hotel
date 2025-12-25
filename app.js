// 🏨 Hôtel des Animaux Mignons - Application JavaScript

// Prix des chambres
const roomPrices = {
    royal: 50,
    confort: 30,
    cosy: 20,
    aqua: 35
};

const roomNames = {
    royal: '🏰 Suite Royale',
    confort: '🏠 Chambre Confort',
    cosy: '🏕️ Nid Cosy',
    aqua: '🐠 Suite Aquatique'
};

// Stockage des réservations
let reservations = JSON.parse(localStorage.getItem('hotelAnimaux_reservations')) || [];
let nextId = parseInt(localStorage.getItem('hotelAnimaux_nextId')) || 1;

// Éléments du DOM
const bookingForm = document.getElementById('booking-form');
const reservationsList = document.getElementById('reservations-list');
const totalPriceEl = document.getElementById('total-price');
const roomTypeSelect = document.getElementById('room-type');
const nightsInput = document.getElementById('nights');
const checkInInput = document.getElementById('check-in');
const modal = document.getElementById('confirmation-modal');
const confirmationDetails = document.getElementById('confirmation-details');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Définir la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    checkInInput.setAttribute('min', today);
    checkInInput.value = today;
    
    // Afficher les réservations existantes
    renderReservations();
    
    // Mettre à jour le prix
    updatePrice();
    
    // Ajouter effet de clic sur les cartes de chambre
    document.querySelectorAll('.room-card').forEach(card => {
        card.addEventListener('click', () => {
            const roomType = card.dataset.room;
            roomTypeSelect.value = roomType;
            updatePrice();
            
            // Scroll vers le formulaire
            document.querySelector('.booking-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Animation de sélection
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        });
    });
});

// Mise à jour du prix en temps réel
roomTypeSelect.addEventListener('change', updatePrice);
nightsInput.addEventListener('input', updatePrice);

function updatePrice() {
    const roomType = roomTypeSelect.value;
    const nights = parseInt(nightsInput.value) || 1;
    
    if (roomType && roomPrices[roomType]) {
        const total = roomPrices[roomType] * nights;
        totalPriceEl.textContent = `${total} ⭐`;
        totalPriceEl.parentElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            totalPriceEl.parentElement.style.transform = 'scale(1)';
        }, 200);
    } else {
        totalPriceEl.textContent = '0 ⭐';
    }
}

// Soumission du formulaire
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const petName = document.getElementById('pet-name').value.trim();
    const ownerName = document.getElementById('owner-name').value.trim();
    const petType = document.getElementById('pet-type').value;
    const roomType = roomTypeSelect.value;
    const checkIn = checkInInput.value;
    const nights = parseInt(nightsInput.value);
    const specialRequests = document.getElementById('special-requests').value.trim();
    
    const totalPrice = roomPrices[roomType] * nights;
    
    // Créer la réservation
    const reservation = {
        id: nextId++,
        petName,
        ownerName,
        petType,
        roomType,
        roomName: roomNames[roomType],
        checkIn,
        nights,
        totalPrice,
        specialRequests,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    // Ajouter aux réservations
    reservations.push(reservation);
    saveData();
    
    // Afficher la confirmation
    showConfirmation(reservation);
    
    // Rafraîchir la liste
    renderReservations();
    
    // Réinitialiser le formulaire
    bookingForm.reset();
    checkInInput.value = new Date().toISOString().split('T')[0];
    nightsInput.value = 1;
    updatePrice();
    
    // Effet confetti
    document.body.classList.add('confetti-active');
    setTimeout(() => {
        document.body.classList.remove('confetti-active');
    }, 1000);
});

// Afficher la confirmation
function showConfirmation(reservation) {
    confirmationDetails.innerHTML = `
        <p><strong>🐾 Animal:</strong> ${reservation.petName} (${reservation.petType})</p>
        <p><strong>👤 Propriétaire:</strong> ${reservation.ownerName}</p>
        <p><strong>🏨 Chambre:</strong> ${reservation.roomName}</p>
        <p><strong>📅 Arrivée:</strong> ${formatDate(reservation.checkIn)}</p>
        <p><strong>🌙 Durée:</strong> ${reservation.nights} nuit${reservation.nights > 1 ? 's' : ''}</p>
        <p><strong>💰 Total:</strong> ${reservation.totalPrice} ⭐</p>
        ${reservation.specialRequests ? `<p><strong>💝 Notes:</strong> ${reservation.specialRequests}</p>` : ''}
    `;
    
    modal.classList.add('active');
    
    // Jouer un son de célébration (si disponible)
    playSound('celebration');
}

// Fermer le modal
document.querySelector('.modal-close').addEventListener('click', closeModal);
document.querySelector('.btn-close-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

function closeModal() {
    modal.classList.remove('active');
}

// Afficher les réservations
function renderReservations() {
    const activeReservations = reservations.filter(r => r.status === 'active');
    
    if (activeReservations.length === 0) {
        reservationsList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🐾</span>
                <p>Aucune réservation pour le moment...</p>
                <p>Soyez les premiers à réserver!</p>
            </div>
        `;
        return;
    }
    
    reservationsList.innerHTML = activeReservations.map((reservation, index) => `
        <div class="reservation-card ${index === activeReservations.length - 1 ? 'new' : ''}" data-id="${reservation.id}">
            <div class="reservation-pet-icon">${getAnimalEmoji(reservation.petType)}</div>
            <div class="reservation-info">
                <h3>${reservation.petName}</h3>
                <p><strong>Type:</strong> ${reservation.petType}</p>
                <p><strong>Propriétaire:</strong> ${reservation.ownerName}</p>
                <p><strong>Chambre:</strong> ${reservation.roomName}</p>
                <p><strong>Du:</strong> ${formatDate(reservation.checkIn)} <strong>•</strong> ${reservation.nights} nuit${reservation.nights > 1 ? 's' : ''}</p>
                <p><strong>Prix:</strong> ${reservation.totalPrice} ⭐</p>
                ${reservation.specialRequests ? `<p><strong>Notes:</strong> ${reservation.specialRequests}</p>` : ''}
            </div>
            <div class="reservation-actions">
                <button class="btn-checkout" onclick="checkoutPet(${reservation.id})">✅ Check-out</button>
                <button class="btn-cancel" onclick="cancelReservation(${reservation.id})">❌ Annuler</button>
            </div>
        </div>
    `).join('');
}

// Extraire l'emoji de l'animal
function getAnimalEmoji(petType) {
    const match = petType.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}])/u);
    return match ? match[0] : '🐾';
}

// Formater la date
function formatDate(dateString) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Check-out d'un animal
function checkoutPet(id) {
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
        reservation.status = 'completed';
        saveData();
        renderReservations();
        
        // Message de au revoir
        showCheckoutMessage(reservation);
    }
}

// Annuler une réservation
function cancelReservation(id) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation? 😢')) {
        const reservation = reservations.find(r => r.id === id);
        if (reservation) {
            reservation.status = 'cancelled';
            saveData();
            renderReservations();
        }
    }
}

// Message de check-out
function showCheckoutMessage(reservation) {
    confirmationDetails.innerHTML = `
        <p style="font-size: 1.3rem; text-align: center;">
            👋 Au revoir <strong>${reservation.petName}</strong>!
        </p>
        <p style="text-align: center; margin-top: 15px;">
            Merci d'avoir séjourné à l'Hôtel des Animaux Mignons!<br>
            On espère te revoir bientôt! 🌟
        </p>
    `;
    
    document.querySelector('.modal-icon').textContent = '👋';
    document.querySelector('.modal-content h2').textContent = 'À bientôt!';
    
    modal.classList.add('active');
    
    // Remettre les valeurs par défaut après fermeture
    setTimeout(() => {
        document.querySelector('.modal-icon').textContent = '🎊';
        document.querySelector('.modal-content h2').textContent = 'Réservation Confirmée!';
    }, 500);
}

// Sauvegarder les données
function saveData() {
    localStorage.setItem('hotelAnimaux_reservations', JSON.stringify(reservations));
    localStorage.setItem('hotelAnimaux_nextId', nextId.toString());
}

// Fonction pour jouer un son (optionnel)
function playSound(type) {
    // On pourrait ajouter des sons ici plus tard
    console.log(`🔊 Son: ${type}`);
}

// Easter egg: Konami code pour afficher tous les animaux
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.innerHTML += `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        display: flex; justify-content: center; align-items: center;
                        background: rgba(0,0,0,0.8); z-index: 9999; font-size: 5rem;
                        animation: fadeIn 0.5s ease;" onclick="this.remove()">
                <div style="animation: bounce 1s infinite;">
                    🐕🐈🐰🐹🦜🐢🐠🦎🦔🐷🦄🐉
                </div>
            </div>
        `;
        konamiCode = [];
    }
});

// Ajouter quelques réservations de démonstration au premier lancement
if (reservations.length === 0) {
    const demoReservations = [
        {
            id: nextId++,
            petName: 'Moustache',
            ownerName: 'Marie',
            petType: '🐈 Chat',
            roomType: 'confort',
            roomName: '🏠 Chambre Confort',
            checkIn: new Date().toISOString().split('T')[0],
            nights: 3,
            totalPrice: 90,
            specialRequests: 'Adore les câlins et les croquettes au saumon!',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: nextId++,
            petName: 'Rex',
            ownerName: 'Thomas',
            petType: '🐕 Chien',
            roomType: 'royal',
            roomName: '🏰 Suite Royale',
            checkIn: new Date().toISOString().split('T')[0],
            nights: 5,
            totalPrice: 250,
            specialRequests: 'A besoin de 3 promenades par jour!',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
    
    reservations = demoReservations;
    saveData();
    renderReservations();
}

console.log('🏨 Bienvenue à l\'Hôtel des Animaux Mignons!');
console.log('🎮 Astuce secrète: Tape le code Konami pour une surprise!');

