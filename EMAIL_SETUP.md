# Email Setup for Order Status Notifications

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Add to .env.local**:
```bash
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="noreply@jbinverters.com"
```

## Other Email Providers

### Outlook/Hotmail
```bash
EMAIL_SERVER_HOST="smtp-mail.outlook.com"
EMAIL_SERVER_PORT="587"
```

### Yahoo
```bash
EMAIL_SERVER_HOST="smtp.mail.yahoo.com"
EMAIL_SERVER_PORT="587"
```

## Testing

1. Login to admin dashboard
2. Go to Orders tab
3. Click on any order status
4. Select new status
5. Choose "Update + Email customer"
6. Check customer's email for notification

## Troubleshooting

- **"No customer email available"** - Customer didn't provide email during checkout
- **Email fails** - Check SMTP credentials and app password
- **Status updates but no email** - Check server logs for email errors
