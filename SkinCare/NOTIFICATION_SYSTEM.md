# SkinCare Notification System

This document explains how the notification system works in the SkinCare application and how to trigger notifications for clinic updates and appointment bookings.

## Overview

The notification system provides real-time and stored notifications for users when:
1. **Clinic appointments are booked** - Users get notified when they successfully book an appointment
2. **Clinic information is updated** - Users get notified when clinics update their information, services, or schedules

## How It Works

### Architecture
- **Storage**: Notifications are stored in localStorage for persistence
- **Real-time**: Uses localStorage events to trigger notifications across browser tabs
- **Display**: Notifications appear in the user's profile page under the "Notifications" tab
- **Toast**: Real-time toast notifications appear when new notifications are triggered

### Notification Types
1. **Booking Notifications** (`booking`)
   - Triggered when appointments are confirmed
   - Shows clinic name, date, time, and service
   - Green icon with checkmark

2. **Clinic Update Notifications** (`clinic_update`)
   - Triggered when clinic information changes
   - Shows clinic name and update type
   - Purple icon with location marker

## Usage

### For Developers

#### Triggering Booking Notifications
```javascript
import { triggerBookingNotification } from './notifications.js';

triggerBookingNotification({
  clinicName: 'Glow Skin Clinic',
  date: '2024-01-15',
  time: '2:30 PM',
  service: 'Hydrating Facial Treatment'
});
```

#### Triggering Clinic Update Notifications
```javascript
import { triggerClinicUpdateNotification } from './notifications.js';

triggerClinicUpdateNotification({
  clinicName: 'Radiance Beauty Center',
  updateType: 'New Services Available',
  description: 'Added advanced laser treatments'
});
```

#### Using Static Methods (Alternative)
```javascript
import SkinCareApp from './app.js';

// For booking notifications
SkinCareApp.addBookingNotification({
  clinicName: 'Pure Skin Spa',
  date: '2024-01-20',
  time: '4:15 PM',
  service: 'Acne Treatment Session'
});

// For clinic update notifications
SkinCareApp.addClinicUpdateNotification({
  clinicName: 'Glow Skin Clinic',
  updateType: 'Schedule Update',
  description: 'Extended weekend hours'
});
```

### For Testing

#### Browser Console Testing
The notification system exposes global functions for easy testing:

```javascript
// Trigger a sample booking notification
SkinCareNotifications.examples.sampleBooking();

// Trigger a sample clinic update notification
SkinCareNotifications.examples.sampleClinicUpdate();

// Trigger multiple notifications at once
SkinCareNotifications.examples.sampleBatch();

// Custom booking notification
SkinCareNotifications.triggerBookingNotification({
  clinicName: 'Your Clinic Name',
  date: '2024-01-25',
  time: '11:00 AM',
  service: 'Custom Treatment'
});

// Custom clinic update notification
SkinCareNotifications.triggerClinicUpdateNotification({
  clinicName: 'Your Clinic Name',
  updateType: 'Special Promotion',
  description: '50% off all services'
});
```

#### Demo Buttons
In the profile page notifications tab, there are demo buttons to test the system:
- **"Simulate Booking Notification"** - Creates a random booking notification
- **"Simulate Clinic Update"** - Creates a random clinic update notification

## Implementation Examples

### Real-World Integration

#### 1. When a user books an appointment (clinic-details.html)
```javascript
// After successful booking
const bookingData = {
  clinicName: clinicName,
  date: selectedDate,
  time: selectedTime,
  service: selectedService
};

import('./notifications.js').then(module => {
  module.triggerBookingNotification(bookingData);
});
```

#### 2. When clinic information is updated (admin panel)
```javascript
// After clinic data is updated in database
const clinicData = {
  clinicName: updatedClinic.name,
  updateType: 'Information Updated',
  description: 'Clinic details have been updated'
};

import('./notifications.js').then(module => {
  module.triggerClinicUpdateNotification(clinicData);
});
```

#### 3. When clinic adds new services
```javascript
const clinicData = {
  clinicName: 'Beauty Clinic',
  updateType: 'New Services Available',
  description: 'Added laser therapy and chemical peels'
};

triggerClinicUpdateNotification(clinicData);
```

## File Structure

```
/SkinCare/
├── app.js                 # Main application with notification system
├── notifications.js       # Notification utility functions
├── myProfile.html         # Profile page with notifications tab
├── clinic.html           # Clinic listing (triggers update notifications)
├── clinic-details.html   # Clinic details (triggers booking notifications)
└── modern-styles.css     # Notification styling
```

## Styling

Notification styles are defined in `modern-styles.css`:
- `.notification-icon.booking` - Green booking notifications
- `.notification-icon.clinic-update` - Purple clinic update notifications
- `.notification-icon.reminder` - Yellow reminder notifications
- `.notification-icon.update` - Blue general update notifications

## Browser Support

- Modern browsers with ES6 module support
- localStorage support required
- StorageEvent support for cross-tab notifications

## Future Enhancements

1. **Server-Side Integration**: Connect to real backend for persistent notifications
2. **Push Notifications**: Add browser push notification support
3. **Email Notifications**: Send email notifications for important updates
4. **Notification Preferences**: Allow users to customize notification types
5. **Read/Unread Status**: Better management of notification states
6. **Notification History**: Archive and search old notifications

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check browser console for JavaScript errors
2. **Cross-tab notifications not working**: Ensure localStorage events are supported
3. **Styling issues**: Verify modern-styles.css is loaded correctly

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('skincare-debug', 'true');
```

This will log all notification activities to the browser console.