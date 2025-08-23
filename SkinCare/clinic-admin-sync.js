// Clinic Admin Synchronization Script
// This script enables real-time synchronization between admin panel and main clinic page

class ClinicAdminSync {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8085/api';
        this.clinics = [];
        this.init();
    }

    init() {
        console.log('🔄 Initializing Clinic Admin Sync...');
        
        // Listen for admin panel updates
        this.setupAdminUpdateListener();
        
        // Load clinics from backend
        this.loadClinicsFromAPI();
        
        // Setup periodic refresh
        this.setupPeriodicRefresh();
        
        console.log('✅ Clinic Admin Sync initialized');
    }

    setupAdminUpdateListener() {
        // Listen for localStorage changes from admin panel
        window.addEventListener('storage', (e) => {
            if (e.key === 'admin_clinic_update') {
                console.log('📢 Received admin panel update notification');
                this.handleAdminUpdate(JSON.parse(e.newValue));
            }
        });

        // Also listen for same-page updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'admin_clinic_update') {
                this.handleAdminUpdate(JSON.parse(e.newValue));
            }
        });
    }

    async loadClinicsFromAPI() {
        try {
            console.log('📋 Loading clinics from API...');
            const response = await fetch(`${this.apiBaseUrl}/clinics`);
            const data = await response.json();
            
            if (data.success) {
                this.clinics = data.clinics;
                this.updateClinicDisplay();
                console.log('✅ Loaded', this.clinics.length, 'clinics from API');
            } else {
                console.error('Failed to load clinics:', data.error);
                this.fallbackToStaticClinics();
            }
        } catch (error) {
            console.error('Error loading clinics from API:', error);
            this.fallbackToStaticClinics();
        }
    }

    handleAdminUpdate(updateData) {
        if (updateData && updateData.type === 'clinic_update') {
            console.log('🔄 Processing admin update...');
            
            // Reload clinics from API to get latest data
            this.loadClinicsFromAPI();
            
            // Show notification to user
            this.showUpdateNotification('Clinic information has been updated');
        }
    }

    updateClinicDisplay() {
        const clinicList = document.getElementById('clinic-list');
        if (!clinicList) {
            console.log('Clinic list container not found');
            return;
        }

        // Clear existing clinics
        clinicList.innerHTML = '';

        // Generate clinic cards from API data
        this.clinics.forEach(clinic => {
            if (clinic.status === 'active') { // Only show active clinics
                const clinicCard = this.createClinicCard(clinic);
                clinicList.appendChild(clinicCard);
            }
        });

        console.log('✅ Updated clinic display with', this.clinics.length, 'clinics');
    }

    createClinicCard(clinic) {
        const card = document.createElement('div');
        card.className = 'clinic-card animate-on-scroll';
        card.onclick = () => this.goToClinicDetails(clinic.id);
        
        const stars = '★'.repeat(Math.floor(clinic.rating || 4.5)) + 
                     '☆'.repeat(5 - Math.floor(clinic.rating || 4.5));
        
        card.innerHTML = `
            <img src="${clinic.imageUrl || 'Pics/photo_2025-07-02_23-55-49.jpg'}" 
                 alt="Clinic Image" class="clinic-image" />
            <div class="clinic-info">
                <h2 class="clinic-name">${clinic.name}</h2>
                <div class="clinic-detail">
                    <strong>Location:</strong>
                    <span class="clinic-location">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        ${clinic.city}
                    </span>
                </div>
                <div class="clinic-detail">
                    <strong>Popular Treatment:</strong> ${clinic.popularTreatment || 'Acne Removal'}
                </div>
                <div class="clinic-detail">
                    <strong>Price Range:</strong> <span class="clinic-price">${clinic.priceRange || '$$'}</span>
                </div>
                <div class="clinic-detail">
                    <strong>Rating:</strong> 
                    <span class="stars">${stars}</span>
                    <span class="rating-number">(${clinic.rating || 4.5})</span>
                </div>
                <div class="clinic-detail">
                    <strong>Hours:</strong> ${clinic.openingHours || 'Contact for hours'}
                </div>
                <div class="clinic-detail">
                    <strong>Phone:</strong> ${clinic.phone}
                </div>
            </div>
        `;
        
        return card;
    }

    goToClinicDetails(clinicId) {
        // Find clinic by ID to get slug
        const clinic = this.clinics.find(c => c.id === clinicId);
        if (clinic) {
            const slug = clinic.name.toLowerCase()
                                   .replace(/[^a-z0-9\s]/g, '')
                                   .replace(/\s+/g, '-')
                                   .replace(/^-|-$/g, '');
            window.location.href = `clinic-details.html?clinic=${slug}&id=${clinicId}`;
        }
    }

    fallbackToStaticClinics() {
        console.log('📋 Falling back to static clinic display');
        // Keep existing static clinic cards if API fails
        // This ensures the page still works even if backend is down
    }

    setupPeriodicRefresh() {
        // Refresh clinic data every 5 minutes
        setInterval(() => {
            this.loadClinicsFromAPI();
        }, 5 * 60 * 1000);
    }

    showUpdateNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'clinic-update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                          fill="currentColor"/>
                </svg>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a clinic page
    if (document.getElementById('clinic-list')) {
        window.clinicAdminSync = new ClinicAdminSync();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClinicAdminSync;
}
