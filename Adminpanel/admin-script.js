// Admin Panel JavaScript - InsightCare Admin System

class AdminPanel {
    constructor() {
        console.log('AdminPanel constructor called'); // Debug log

        this.currentSection = 'dashboard';
        this.users = [];
        this.clinics = [];
        this.bookings = [];
        this.currentEditId = null;
        this.currentEditType = null;
        this.apiBaseUrl = 'http://localhost:8085/api';

        this.init();
        this.loadSampleData();
        this.loadRealClinics(); // Load real clinics from backend

        console.log('AdminPanel initialized with', this.users.length, 'users'); // Debug log
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.updateStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-link, .quick-action-btn').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Profile dropdown navigation
        document.querySelectorAll('.dropdown-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Modal controls
        this.setupModalControls();
        
        // Form submissions
        this.setupFormSubmissions();
        
        // Search and filters
        this.setupSearchAndFilters();
        
        // Settings
        this.setupSettings();
        
        // Profile settings
        this.setupProfileSettings();
    }

    setupNavigation() {
        // Profile dropdown
        const profileBtn = document.querySelector('.profile-btn');
        const profileDropdown = document.querySelector('.profile-dropdown');
        
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.style.opacity = profileDropdown.style.opacity === '1' ? '0' : '1';
                profileDropdown.style.visibility = profileDropdown.style.visibility === 'visible' ? 'hidden' : 'visible';
            });

            document.addEventListener('click', () => {
                profileDropdown.style.opacity = '0';
                profileDropdown.style.visibility = 'hidden';
            });
        }
    }

    setupModalControls() {
        // User modal
        const userModal = document.getElementById('user-modal');
        const addUserBtn = document.getElementById('add-user-btn');
        const userModalClose = document.getElementById('user-modal-close');
        const userCancelBtn = document.getElementById('user-cancel-btn');

        addUserBtn?.addEventListener('click', () => this.openUserModal());
        userModalClose?.addEventListener('click', () => this.closeModal('user-modal'));
        userCancelBtn?.addEventListener('click', () => this.closeModal('user-modal'));

        // Clinic modal
        const clinicModal = document.getElementById('clinic-modal');
        const addClinicBtn = document.getElementById('add-clinic-btn');
        const clinicModalClose = document.getElementById('clinic-modal-close');
        const clinicCancelBtn = document.getElementById('clinic-cancel-btn');

        console.log('Add clinic button found:', !!addClinicBtn); // Debug log
        console.log('Clinic modal found:', !!clinicModal); // Debug log

        addClinicBtn?.addEventListener('click', () => {
            console.log('Add clinic button clicked'); // Debug log
            this.openClinicModal();
        });
        clinicModalClose?.addEventListener('click', () => this.closeModal('clinic-modal'));
        clinicCancelBtn?.addEventListener('click', () => this.closeModal('clinic-modal'));



        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupFormSubmissions() {
        // User form
        const userForm = document.getElementById('user-form');
        console.log('User form found:', !!userForm); // Debug log
        userForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('User form submitted'); // Debug log
            this.saveUser();
        });

        // Clinic form
        const clinicForm = document.getElementById('clinic-form');
        console.log('Clinic form found:', !!clinicForm); // Debug log
        clinicForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Clinic form submitted'); // Debug log
            this.saveClinic();
        });


    }

    setupSearchAndFilters() {
        // User search and filters
        const userSearch = document.getElementById('user-search');
        const userRoleFilter = document.getElementById('user-role-filter');
        
        userSearch?.addEventListener('input', () => this.filterUsers());
        userRoleFilter?.addEventListener('change', () => this.filterUsers());

        // Clinic search
        const clinicSearch = document.getElementById('clinic-search');
        clinicSearch?.addEventListener('input', () => this.filterClinics());



        // Booking search and filters
        const bookingSearch = document.getElementById('booking-search');
        const bookingStatusFilter = document.getElementById('booking-status-filter');
        
        bookingSearch?.addEventListener('input', () => this.filterBookings());
        bookingStatusFilter?.addEventListener('change', () => this.filterBookings());
    }

    setupSettings() {
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        const resetSettingsBtn = document.getElementById('reset-settings-btn');

        saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
        resetSettingsBtn?.addEventListener('click', () => this.resetSettings());
    }

    setupProfileSettings() {
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const cancelProfileBtn = document.getElementById('cancel-profile-btn');
        const saveProfileBtn = document.getElementById('save-profile-btn');
        const profileEditActions = document.getElementById('profile-edit-actions');
        const profileForm = document.getElementById('admin-profile-form');

        // Edit button functionality
        editProfileBtn?.addEventListener('click', () => {
            this.toggleProfileEditMode(true);
        });

        // Cancel button functionality
        cancelProfileBtn?.addEventListener('click', () => {
            this.toggleProfileEditMode(false);
            this.resetProfileForm();
        });

        // Save button functionality
        saveProfileBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveProfileSettings();
        });
    }

    toggleProfileEditMode(isEditing) {
        const editBtn = document.getElementById('edit-profile-btn');
        const editActions = document.getElementById('profile-edit-actions');
        const formInputs = document.querySelectorAll('#admin-profile-form input, #admin-profile-form select');

        if (isEditing) {
            editBtn.style.display = 'none';
            editActions.style.display = 'flex';
            
            formInputs.forEach(input => {
                if (input.id !== 'admin-role') { // Keep role readonly
                    input.removeAttribute('readonly');
                    input.removeAttribute('disabled');
                }
            });
        } else {
            editBtn.style.display = 'inline-flex';
            editActions.style.display = 'none';
            
            formInputs.forEach(input => {
                input.setAttribute('readonly', 'readonly');
                if (input.tagName === 'SELECT') {
                    input.setAttribute('disabled', 'disabled');
                }
            });
        }
    }

    resetProfileForm() {
        // Reset form to original values
        document.getElementById('admin-first-name').value = 'Admin';
        document.getElementById('admin-last-name').value = 'User';
        document.getElementById('admin-email').value = 'admin@insightcare.com';
        document.getElementById('admin-phone').value = '+1-555-0123';
        document.getElementById('admin-birthdate').value = '1990-01-01';
        document.getElementById('admin-address').value = '123 Admin Street';
        document.getElementById('admin-city').value = 'Admin City';
        document.getElementById('admin-zip').value = '12345';
        document.getElementById('admin-state').value = 'admin-state';
        document.getElementById('admin-country').value = 'us';
    }

    saveProfileSettings() {
        const formData = new FormData(document.getElementById('admin-profile-form'));
        const profileData = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Saving profile data:', profileData);
        
        // Show success message
        this.showNotification('Profile updated successfully!', 'success');
        
        // Exit edit mode
        this.toggleProfileEditMode(false);
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        // Show section
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`)?.classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'users':
                this.renderUsers();
                break;
            case 'clinics':
                this.renderClinics();
                break;
            case 'bookings':
                this.renderBookings();
                break;
        }
    }

    // Modal Management
    openUserModal(userId = null) {
        console.log('Opening user modal for userId:', userId); // Debug log
        
        this.currentEditId = userId;
        this.currentEditType = 'user';
        
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        
        if (!modal) {
            console.error('User modal not found!');
            return;
        }
        
        if (userId) {
            title.textContent = 'Edit User';
            const user = this.users.find(u => u.id === userId);
            if (user) {
                console.log('Found user to edit:', user);
                this.populateUserForm(user);
            } else {
                console.error('User not found with ID:', userId);
            }
        } else {
            title.textContent = 'Add New User';
            form.reset();
        }
        
        modal.classList.add('active');
        console.log('Modal should now be visible');
    }

    openClinicModal(clinicId = null) {
        console.log('Opening clinic modal for clinicId:', clinicId); // Debug log
        
        this.currentEditId = clinicId;
        this.currentEditType = 'clinic';
        
        const modal = document.getElementById('clinic-modal');
        const title = document.getElementById('clinic-modal-title');
        const form = document.getElementById('clinic-form');
        
        if (!modal) {
            console.error('Clinic modal not found!');
            return;
        }
        
        if (clinicId) {
            title.textContent = 'Edit Clinic';
            const clinic = this.clinics.find(c => c.id === clinicId);
            if (clinic) {
                console.log('Found clinic to edit:', clinic);
                this.populateClinicForm(clinic);
            } else {
                console.error('Clinic not found with ID:', clinicId);
            }
        } else {
            title.textContent = 'Add New Clinic';
            form.reset();
        }
        
        modal.classList.add('active');
        console.log('Clinic modal should now be visible');
    }



    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        this.currentEditId = null;
        this.currentEditType = null;
    }

    // Data Management
    saveUser() {
        const form = document.getElementById('user-form');
        const formData = new FormData(form);
        
        const userData = {
            id: this.currentEditId || this.generateId(),
            firstName: document.getElementById('user-first-name').value,
            lastName: document.getElementById('user-last-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            address: document.getElementById('user-address').value,
            city: document.getElementById('user-city').value,
            postCode: document.getElementById('user-postcode').value,
            country: document.getElementById('user-country').value,
            role: document.getElementById('user-role').value,
            isOnline: Math.random() > 0.5,
            avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=40&h=40&fit=crop&crop=face`
        };

        if (this.currentEditId) {
            const index = this.users.findIndex(u => u.id === this.currentEditId);
            this.users[index] = userData;
        } else {
            this.users.push(userData);
        }

        this.closeModal('user-modal');
        this.renderUsers();
        this.updateStats();
        this.showNotification('User saved successfully!', 'success');
    }

    async saveClinic() {
        console.log('Saving clinic...'); // Debug log

        const clinicData = {
            name: document.getElementById('clinic-name').value,
            description: document.getElementById('clinic-description').value,
            address: document.getElementById('clinic-address').value,
            city: document.getElementById('clinic-city').value,
            postCode: document.getElementById('clinic-postcode').value,
            phone: document.getElementById('clinic-phone').value,
            email: document.getElementById('clinic-email').value,
            openingHours: document.getElementById('clinic-opening-hours').value,
            status: document.getElementById('clinic-status').value,
            popularTreatment: document.getElementById('clinic-popular-treatment').value,
            priceRange: document.getElementById('clinic-price-range').value,
            imageUrl: document.getElementById('clinic-image-url').value,
            rating: parseFloat(document.getElementById('clinic-rating').value) || 4.5
        };

        console.log('Clinic data to save:', clinicData); // Debug log

        try {
            let response;
            if (this.currentEditId) {
                console.log('Updating existing clinic');
                response = await this.updateClinicAPI(this.currentEditId, clinicData);
            } else {
                console.log('Adding new clinic');
                response = await this.createClinicAPI(clinicData);
            }

            if (response.success) {
                this.closeModal('clinic-modal');
                await this.loadRealClinics(); // Reload clinics from backend
                this.renderClinics();
                this.updateStats();
                this.showNotification('Clinic saved successfully!', 'success');
                this.notifyMainPageUpdate(); // Notify main page of changes
                console.log('Clinic saved successfully');
            } else {
                this.showNotification('Error saving clinic: ' + response.error, 'error');
            }
        } catch (error) {
            console.error('Error saving clinic:', error);
            this.showNotification('Error saving clinic: ' + error.message, 'error');
        }
    }



    deleteUser(userId) {
        console.log('Attempting to delete user with ID:', userId); // Debug log
        
        if (confirm('Are you sure you want to delete this user?')) {
            const userExists = this.users.find(u => u.id === userId);
            if (!userExists) {
                console.error('User not found with ID:', userId);
                return;
            }
            
            console.log('Deleting user:', userExists);
            this.users = this.users.filter(u => u.id !== userId);
            this.renderUsers();
            this.updateStats();
            this.showNotification('User deleted successfully!', 'success');
            console.log('User deleted successfully');
        }
    }

    async deleteClinic(clinicId) {
        console.log('Attempting to delete clinic with ID:', clinicId); // Debug log

        if (confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
            try {
                const response = await this.deleteClinicAPI(clinicId);

                if (response.success) {
                    await this.loadRealClinics(); // Reload clinics from backend
                    this.renderClinics();
                    this.updateStats();
                    this.showNotification('Clinic deleted successfully!', 'success');
                    this.notifyMainPageUpdate(); // Notify main page of changes
                    console.log('Clinic deleted successfully');
                } else {
                    this.showNotification('Error deleting clinic: ' + response.error, 'error');
                }
            } catch (error) {
                console.error('Error deleting clinic:', error);
                this.showNotification('Error deleting clinic: ' + error.message, 'error');
            }
        }
    }



    // Rendering Methods
    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${user.avatar}" alt="${user.firstName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="font-weight: 500; color: var(--text-primary);">${user.firstName} ${user.lastName}</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td><span class="status-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.isOnline ? 'active' : 'inactive'}">${user.isOnline ? 'Online' : 'Offline'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-user-id="${user.id}" data-action="edit" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" data-user-id="${user.id}" data-action="delete" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to the newly created buttons
        this.attachUserActionListeners();
    }

    attachUserActionListeners() {
        // Remove existing listeners to prevent duplicates
        document.querySelectorAll('.action-btn[data-user-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const userId = btn.getAttribute('data-user-id');
                const action = btn.getAttribute('data-action');
                
                console.log('Button clicked:', action, 'for user:', userId); // Debug log
                
                if (action === 'edit') {
                    this.openUserModal(userId);
                } else if (action === 'delete') {
                    this.deleteUser(userId);
                }
            });
        });
    }

    renderClinics() {
        const tbody = document.getElementById('clinics-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.clinics.map(clinic => `
            <tr>
                <td>
                    <div>
                        <div style="font-weight: 500; color: var(--text-primary);">${clinic.name}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${clinic.description || 'No description'}</div>
                    </div>
                </td>
                <td>${clinic.city}, ${clinic.postCode}</td>
                <td>${clinic.phone}</td>
                <td><span class="status-badge ${clinic.status}">${clinic.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-clinic-id="${clinic.id}" data-action="edit" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" data-clinic-id="${clinic.id}" data-action="delete" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to the newly created buttons
        this.attachClinicActionListeners();
    }

    attachClinicActionListeners() {
        // Remove existing listeners to prevent duplicates
        document.querySelectorAll('.action-btn[data-clinic-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const clinicId = btn.getAttribute('data-clinic-id');
                const action = btn.getAttribute('data-action');
                
                console.log('Clinic button clicked:', action, 'for clinic:', clinicId); // Debug log
                
                if (action === 'edit') {
                    this.openClinicModal(clinicId);
                } else if (action === 'delete') {
                    this.deleteClinic(clinicId);
                }
            });
        });
    }

    renderBookings() {
        const tbody = document.getElementById('bookings-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.bookings.map(booking => {
            const user = this.users.find(u => u.id === booking.userId);
            const clinic = this.clinics.find(c => c.id === booking.clinicId);
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500; color: var(--text-primary);">#${booking.id}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${booking.service}</div>
                    </td>
                    <td>${user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}</td>
                    <td>${clinic ? clinic.name : 'Unknown Clinic'}</td>
                    <td>
                        <div>${booking.date}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${booking.time}</div>
                    </td>
                    <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" title="View Details">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Form Population Methods
    populateUserForm(user) {
        document.getElementById('user-first-name').value = user.firstName;
        document.getElementById('user-last-name').value = user.lastName;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-phone').value = user.phone;
        document.getElementById('user-address').value = user.address;
        document.getElementById('user-city').value = user.city;
        document.getElementById('user-postcode').value = user.postCode;
        document.getElementById('user-country').value = user.country;
        document.getElementById('user-role').value = user.role;
    }

    populateClinicForm(clinic) {
        document.getElementById('clinic-name').value = clinic.name;
        document.getElementById('clinic-description').value = clinic.description || '';
        document.getElementById('clinic-address').value = clinic.address;
        document.getElementById('clinic-city').value = clinic.city;
        document.getElementById('clinic-postcode').value = clinic.postCode;
        document.getElementById('clinic-phone').value = clinic.phone;
        document.getElementById('clinic-email').value = clinic.email;
        document.getElementById('clinic-opening-hours').value = clinic.openingHours || '';
        document.getElementById('clinic-status').value = clinic.status;
        document.getElementById('clinic-popular-treatment').value = clinic.popularTreatment || '';
        document.getElementById('clinic-price-range').value = clinic.priceRange || '$$';
        document.getElementById('clinic-image-url').value = clinic.imageUrl || '';
        document.getElementById('clinic-rating').value = clinic.rating || 4.5;
    }





    // Filter Methods
    filterUsers() {
        const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('user-role-filter')?.value || '';

        const filteredUsers = this.users.filter(user => {
            const matchesSearch = !searchTerm || 
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
            
            const matchesRole = !roleFilter || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });

        this.renderFilteredUsers(filteredUsers);
    }

    filterClinics() {
        const searchTerm = document.getElementById('clinic-search')?.value.toLowerCase() || '';

        const filteredClinics = this.clinics.filter(clinic => {
            return !searchTerm || 
                clinic.name.toLowerCase().includes(searchTerm) ||
                clinic.city.toLowerCase().includes(searchTerm);
        });

        this.renderFilteredClinics(filteredClinics);
    }



    filterBookings() {
        const searchTerm = document.getElementById('booking-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('booking-status-filter')?.value || '';

        const filteredBookings = this.bookings.filter(booking => {
            const user = this.users.find(u => u.id === booking.userId);
            const clinic = this.clinics.find(c => c.id === booking.clinicId);
            
            const matchesSearch = !searchTerm || 
                booking.id.toLowerCase().includes(searchTerm) ||
                booking.service.toLowerCase().includes(searchTerm) ||
                (user && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)) ||
                (clinic && clinic.name.toLowerCase().includes(searchTerm));
            
            const matchesStatus = !statusFilter || booking.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderFilteredBookings(filteredBookings);
    }

    // Render filtered results (similar to main render methods but with filtered data)
    renderFilteredUsers(users) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${user.avatar}" alt="${user.firstName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="font-weight: 500; color: var(--text-primary);">${user.firstName} ${user.lastName}</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td><span class="status-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.isOnline ? 'active' : 'inactive'}">${user.isOnline ? 'Online' : 'Offline'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-user-id="${user.id}" data-action="edit" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" data-user-id="${user.id}" data-action="delete" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to the newly created buttons
        this.attachUserActionListeners();
    }

    renderFilteredClinics(clinics) {
        const tbody = document.getElementById('clinics-table-body');
        if (!tbody) return;

        tbody.innerHTML = clinics.map(clinic => `
            <tr>
                <td>
                    <div>
                        <div style="font-weight: 500; color: var(--text-primary);">${clinic.name}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${clinic.description || 'No description'}</div>
                    </div>
                </td>
                <td>${clinic.city}, ${clinic.postCode}</td>
                <td>${clinic.phone}</td>
                <td><span class="status-badge ${clinic.status}">${clinic.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-clinic-id="${clinic.id}" data-action="edit" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" data-clinic-id="${clinic.id}" data-action="delete" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to the newly created buttons
        this.attachClinicActionListeners();
    }

    renderFilteredRooms(rooms) {
        const tbody = document.getElementById('rooms-table-body');
        if (!tbody) return;

        tbody.innerHTML = rooms.map(room => {
            const clinic = this.clinics.find(c => c.id === room.clinicId);
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500; color: var(--text-primary);">${room.number}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${room.description || 'No description'}</div>
                    </td>
                    <td>${clinic ? clinic.name : 'Unknown Clinic'}</td>
                    <td>${room.type}</td>
                    <td>${room.capacity}</td>
                    <td><span class="status-badge ${room.status}">${room.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="adminPanel.openRoomModal('${room.id}')" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <button class="action-btn delete" onclick="adminPanel.deleteRoom('${room.id}')" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    }

    renderFilteredBookings(bookings) {
        const tbody = document.getElementById('bookings-table-body');
        if (!tbody) return;

        tbody.innerHTML = bookings.map(booking => {
            const user = this.users.find(u => u.id === booking.userId);
            const clinic = this.clinics.find(c => c.id === booking.clinicId);
            const room = this.rooms.find(r => r.id === booking.roomId);
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500; color: var(--text-primary);">#${booking.id}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${booking.service}</div>
                    </td>
                    <td>${user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}</td>
                    <td>${clinic ? clinic.name : 'Unknown Clinic'}</td>
                    <td>${room ? room.number : 'N/A'}</td>
                    <td>
                        <div>${booking.date}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${booking.time}</div>
                    </td>
                    <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" title="View Details">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Settings Management
    saveSettings() {
        const settings = {
            siteName: document.getElementById('site-name').value,
            siteDescription: document.getElementById('site-description').value,
            contactEmail: document.getElementById('contact-email').value,
            bookingAdvanceDays: document.getElementById('booking-advance-days').value,
            bookingCancellationHours: document.getElementById('booking-cancellation-hours').value,
            autoConfirmBookings: document.getElementById('auto-confirm-bookings').checked
        };

        localStorage.setItem('adminSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            document.getElementById('site-name').value = 'InsightCare';
            document.getElementById('site-description').value = 'Premium Beauty & Wellness Platform';
            document.getElementById('contact-email').value = 'admin@insightcare.com';
            document.getElementById('booking-advance-days').value = '30';
            document.getElementById('booking-cancellation-hours').value = '24';
            document.getElementById('auto-confirm-bookings').checked = false;
            
            localStorage.removeItem('adminSettings');
            this.showNotification('Settings reset to default!', 'success');
        }
    }

    // Utility Methods
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    updateStats() {
        document.getElementById('total-users').textContent = this.users.length;
        document.getElementById('total-clinics').textContent = this.clinics.filter(c => c.status === 'active').length;
        document.getElementById('total-rooms').textContent = this.rooms.filter(r => r.status === 'available').length;
        document.getElementById('total-bookings').textContent = this.bookings.length;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--info)'};
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform var(--transition);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // API Methods for Clinic Management
    async loadRealClinics() {
        try {
            console.log('Loading real clinics from backend...');
            const response = await fetch(`${this.apiBaseUrl}/clinics`);
            const data = await response.json();

            if (data.success) {
                this.clinics = data.clinics.map(clinic => ({
                    id: clinic.id,
                    name: clinic.name,
                    description: clinic.description,
                    address: clinic.address,
                    city: clinic.city,
                    postCode: clinic.postCode,
                    phone: clinic.phone,
                    email: clinic.email,
                    openingHours: clinic.openingHours,
                    status: clinic.status,
                    imageUrl: clinic.imageUrl,
                    popularTreatment: clinic.popularTreatment,
                    priceRange: clinic.priceRange,
                    rating: clinic.rating
                }));
                console.log('✅ Loaded', this.clinics.length, 'clinics from backend');
            } else {
                console.error('Failed to load clinics:', data.error);
                this.showNotification('Failed to load clinics: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading clinics:', error);
            this.showNotification('Error loading clinics: ' + error.message, 'error');
            // Fall back to sample data if backend is not available
            this.loadSampleClinics();
        }
    }

    async createClinicAPI(clinicData) {
        const formData = new URLSearchParams();
        Object.keys(clinicData).forEach(key => {
            if (clinicData[key] !== null && clinicData[key] !== undefined) {
                formData.append(key, clinicData[key]);
            }
        });

        const response = await fetch(`${this.apiBaseUrl}/clinics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        return await response.json();
    }

    async updateClinicAPI(clinicId, clinicData) {
        const formData = new URLSearchParams();
        Object.keys(clinicData).forEach(key => {
            if (clinicData[key] !== null && clinicData[key] !== undefined) {
                formData.append(key, clinicData[key]);
            }
        });

        const response = await fetch(`${this.apiBaseUrl}/clinics/${clinicId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        return await response.json();
    }

    async deleteClinicAPI(clinicId) {
        const response = await fetch(`${this.apiBaseUrl}/clinics/${clinicId}`, {
            method: 'DELETE'
        });

        return await response.json();
    }

    // Notify main page of clinic updates
    notifyMainPageUpdate() {
        // Use localStorage to communicate with main page
        const updateData = {
            type: 'clinic_update',
            timestamp: Date.now(),
            clinics: this.clinics
        };

        localStorage.setItem('admin_clinic_update', JSON.stringify(updateData));

        // Dispatch storage event for same-page updates
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'admin_clinic_update',
            newValue: JSON.stringify(updateData)
        }));

        console.log('✅ Notified main page of clinic updates');
    }

    loadSampleData() {
        // Sample Users
        this.users = [
            {
                id: 'user_001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1 234 567 8901',
                address: '123 Main Street',
                city: 'New York',
                postCode: '10001',
                country: 'USA',
                role: 'user',
                isOnline: true,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
            },
            {
                id: 'user_002',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1 234 567 8902',
                address: '456 Oak Avenue',
                city: 'Los Angeles',
                postCode: '90001',
                country: 'USA',
                role: 'staff',
                isOnline: false,
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
            },
            {
                id: 'user_003',
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.johnson@example.com',
                phone: '+1 234 567 8903',
                address: '789 Pine Road',
                city: 'Chicago',
                postCode: '60601',
                country: 'USA',
                role: 'admin',
                isOnline: true,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            }
        ];

        this.loadSampleClinics();
    }

    loadSampleClinics() {
        // Sample Clinics (fallback when backend is not available)
        this.clinics = [
            {
                id: 'clinic_001',
                name: 'Downtown Beauty Center',
                description: 'Premium skincare and beauty treatments in the heart of the city',
                address: '100 Beauty Boulevard',
                city: 'New York',
                postCode: '10002',
                phone: '+1 234 567 9001',
                email: 'info@downtownbeauty.com',
                openingHours: 'Mon-Fri 9:00-18:00, Sat 10:00-16:00',
                status: 'active',
                imageUrl: 'Pics/photo_2025-07-02_23-55-49.jpg',
                popularTreatment: 'Acne Removal',
                priceRange: '$$',
                rating: 4.5
            },
            {
                id: 'clinic_002',
                name: 'Wellness Spa & Clinic',
                description: 'Holistic wellness and advanced skincare treatments',
                address: '200 Wellness Way',
                city: 'Los Angeles',
                postCode: '90002',
                phone: '+1 234 567 9002',
                email: 'contact@wellnessspa.com',
                openingHours: 'Mon-Sun 8:00-20:00',
                status: 'active',
                imageUrl: 'Pics/photo_2025-07-02_23-55-49.jpg',
                popularTreatment: 'Facial Treatment',
                priceRange: '$$$',
                rating: 4.7
            },
            {
                id: 'clinic_003',
                name: 'Elite Dermatology',
                description: 'Advanced dermatological treatments and procedures',
                address: '300 Medical Plaza',
                city: 'Chicago',
                postCode: '60602',
                phone: '+1 234 567 9003',
                email: 'appointments@elitederma.com',
                openingHours: 'Mon-Fri 8:00-17:00',
                status: 'maintenance',
                imageUrl: 'Pics/photo_2025-07-02_23-55-49.jpg',
                popularTreatment: 'Laser Treatment',
                priceRange: '$$$$',
                rating: 4.8
            }
        ];

        // Sample Rooms
        this.rooms = [
            {
                id: 'room_001',
                number: 'R101',
                clinicId: 'clinic_001',
                type: 'consultation',
                capacity: 2,
                description: 'Private consultation room with modern equipment',
                equipment: 'Examination chair, LED lighting, computer workstation',
                status: 'available'
            },
            {
                id: 'room_002',
                number: 'R102',
                clinicId: 'clinic_001',
                type: 'treatment',
                capacity: 1,
                description: 'Facial treatment room with relaxing ambiance',
                equipment: 'Treatment bed, steamer, LED therapy device',
                status: 'occupied'
            },
            {
                id: 'room_003',
                number: 'R201',
                clinicId: 'clinic_002',
                type: 'procedure',
                capacity: 1,
                description: 'Advanced procedure room for laser treatments',
                equipment: 'Laser equipment, cooling system, monitoring devices',
                status: 'available'
            },
            {
                id: 'room_004',
                number: 'R202',
                clinicId: 'clinic_002',
                type: 'recovery',
                capacity: 3,
                description: 'Comfortable recovery room for post-treatment care',
                equipment: 'Reclining chairs, monitoring equipment, refreshment station',
                status: 'available'
            },
            {
                id: 'room_005',
                number: 'R301',
                clinicId: 'clinic_003',
                type: 'consultation',
                capacity: 2,
                description: 'Dermatology consultation room',
                equipment: 'Dermatoscope, examination tools, documentation system',
                status: 'maintenance'
            }
        ];

        // Sample Bookings
        this.bookings = [
            {
                id: 'BK001',
                userId: 'user_001',
                clinicId: 'clinic_001',
                roomId: 'room_001',
                service: 'Facial Consultation',
                date: '2024-01-15',
                time: '10:00 AM',
                status: 'confirmed'
            },
            {
                id: 'BK002',
                userId: 'user_002',
                clinicId: 'clinic_002',
                roomId: 'room_003',
                service: 'Laser Treatment',
                date: '2024-01-16',
                time: '2:00 PM',
                status: 'pending'
            },
            {
                id: 'BK003',
                userId: 'user_003',
                clinicId: 'clinic_001',
                roomId: 'room_002',
                service: 'Anti-Aging Facial',
                date: '2024-01-14',
                time: '11:30 AM',
                status: 'completed'
            },
            {
                id: 'BK004',
                userId: 'user_001',
                clinicId: 'clinic_003',
                roomId: 'room_005',
                service: 'Skin Analysis',
                date: '2024-01-17',
                time: '9:00 AM',
                status: 'cancelled'
            }
        ];

        this.updateStats();
    }
}

// Initialize the admin panel when the page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    // Make adminPanel globally accessible for onclick handlers
    window.adminPanel = adminPanel;
});