// Notification utility functions for SkinCare application
// This module provides easy-to-use functions for triggering notifications

/**
 * Triggers a booking confirmation notification
 * @param {Object} bookingData - The booking information
 * @param {string} bookingData.clinicName - Name of the clinic
 * @param {string} bookingData.date - Appointment date
 * @param {string} bookingData.time - Appointment time
 * @param {string} bookingData.service - Service/treatment name
 */
export function triggerBookingNotification(bookingData) {
  try {
    // Store booking data to trigger notification
    localStorage.setItem('skincare-new-booking', JSON.stringify(bookingData));
    
    // Dispatch storage event for same-page updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'skincare-new-booking',
      newValue: JSON.stringify(bookingData)
    }));
    
    console.log('Booking notification triggered:', bookingData);
  } catch (error) {
    console.error('Failed to trigger booking notification:', error);
  }
}

/**
 * Triggers a clinic update notification
 * @param {Object} clinicData - The clinic update information
 * @param {string} clinicData.clinicName - Name of the clinic
 * @param {string} clinicData.updateType - Type of update (e.g., "New Services", "Schedule Update")
 * @param {string} clinicData.description - Optional description of the update
 */
export function triggerClinicUpdateNotification(clinicData) {
  try {
    // Store clinic data to trigger notification
    localStorage.setItem('skincare-clinic-update', JSON.stringify(clinicData));
    
    // Dispatch storage event for same-page updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'skincare-clinic-update',
      newValue: JSON.stringify(clinicData)
    }));
    
    console.log('Clinic update notification triggered:', clinicData);
  } catch (error) {
    console.error('Failed to trigger clinic update notification:', error);
  }
}

/**
 * Simulates a clinic table update (for demonstration purposes)
 * In a real application, this would be called when actual database updates occur
 * @param {string} clinicName - Name of the clinic that was updated
 * @param {string} updateType - Type of update performed
 */
export function simulateClinicTableUpdate(clinicName, updateType = 'Information Updated') {
  const clinicData = {
    clinicName: clinicName,
    updateType: updateType,
    timestamp: new Date().toISOString(),
    description: `${clinicName} has been updated in the system`
  };
  
  triggerClinicUpdateNotification(clinicData);
}

/**
 * Simulates making a clinic appointment (for demonstration purposes)
 * @param {string} clinicName - Name of the clinic
 * @param {string} service - Service/treatment name
 * @param {Date} appointmentDate - Date of the appointment
 * @param {string} appointmentTime - Time of the appointment
 */
export function simulateClinicAppointment(clinicName, service = 'Skincare Consultation', appointmentDate = new Date(), appointmentTime = '2:00 PM') {
  const bookingData = {
    clinicName: clinicName,
    date: appointmentDate.toLocaleDateString(),
    time: appointmentTime,
    service: service,
    timestamp: new Date().toISOString()
  };
  
  triggerBookingNotification(bookingData);
}

/**
 * Batch trigger multiple notifications (useful for testing)
 * @param {Array} notifications - Array of notification objects
 */
export function triggerBatchNotifications(notifications) {
  notifications.forEach((notification, index) => {
    setTimeout(() => {
      if (notification.type === 'booking') {
        triggerBookingNotification(notification.data);
      } else if (notification.type === 'clinic_update') {
        triggerClinicUpdateNotification(notification.data);
      }
    }, index * 1000); // Stagger notifications by 1 second each
  });
}

// Example usage functions for testing
export const examples = {
  /**
   * Trigger a sample booking notification
   */
  sampleBooking() {
    triggerBookingNotification({
      clinicName: 'Glow Skin Clinic',
      date: new Date().toLocaleDateString(),
      time: '3:30 PM',
      service: 'Hydrating Facial Treatment'
    });
  },

  /**
   * Trigger a sample clinic update notification
   */
  sampleClinicUpdate() {
    triggerClinicUpdateNotification({
      clinicName: 'Radiance Beauty Center',
      updateType: 'New Services Available',
      description: 'Added advanced laser treatments and extended weekend hours'
    });
  },

  /**
   * Trigger multiple sample notifications
   */
  sampleBatch() {
    const notifications = [
      {
        type: 'booking',
        data: {
          clinicName: 'Pure Skin Spa',
          date: new Date().toLocaleDateString(),
          time: '10:00 AM',
          service: 'Acne Treatment Session'
        }
      },
      {
        type: 'clinic_update',
        data: {
          clinicName: 'Glow Skin Clinic',
          updateType: 'Special Promotion',
          description: '20% off all treatments this month'
        }
      },
      {
        type: 'booking',
        data: {
          clinicName: 'Radiance Beauty Center',
          date: new Date(Date.now() + 86400000).toLocaleDateString(), // Tomorrow
          time: '2:15 PM',
          service: 'Anti-Aging Consultation'
        }
      }
    ];
    
    triggerBatchNotifications(notifications);
  }
};

// Make functions available globally for easy testing in browser console
if (typeof window !== 'undefined') {
  window.SkinCareNotifications = {
    triggerBookingNotification,
    triggerClinicUpdateNotification,
    simulateClinicTableUpdate,
    simulateClinicAppointment,
    triggerBatchNotifications,
    examples
  };
}