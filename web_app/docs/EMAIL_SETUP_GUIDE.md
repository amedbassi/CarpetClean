# Email Setup Guide - Automatic Estimate Sending

## Overview
Both "Send Cleaning" and "Send Repair" buttons now automatically send emails to clients using the SMTP settings configured in the application.

---

## Prerequisites

### 1. Run Settings Table Migration
**IMPORTANT:** You must create the Settings table first!

Run this in Supabase SQL Editor:
```sql
-- Copy and run the entire content from:
prisma/migrations/update_settings_pricing.sql
```

### 2. Configure SMTP Settings
Click the Settings icon (⚙️) in the top right corner and fill in:

#### For Gmail:
- **From Email:** your-email@gmail.com
- **SMTP Host:** smtp.gmail.com
- **SMTP Port:** 587
- **Username:** your-email@gmail.com
- **Password:** Your App Password (not your regular password!)
- **Use secure connection:** ✓ Checked

#### How to get Gmail App Password:
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new
4. Copy the 16-character password
5. Use this in the settings

#### For Other Email Providers:
- **Outlook/Hotmail:** smtp-mail.outlook.com, port 587
- **Yahoo:** smtp.mail.yahoo.com, port 587
- **Custom SMTP:** Contact your email provider

### 3. Set App URL
In production, update `.env`:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## How It Works

### When You Click "Send Cleaning" or "Send Repair":

1. **Validates** that client has an email address
2. **Updates** order status to "pending"
3. **Sends email** with:
   - Professional HTML template
   - Order details and totals
   - Clickable approval link
   - Plain text fallback
4. **Shows confirmation** with recipient email

### Email Content Includes:
- Order ID
- Estimate total (cleaning or repair)
- Approval link button
- Company branding
- Contact information

---

## Testing

### 1. Configure Settings
- Open Settings (⚙️ icon)
- Fill in SMTP details
- Click "Save Settings"

### 2. Create Test Order
- Add an order with a client that has an email
- Measure carpets (for cleaning) or add repair costs (for repair)
- Enable "Approval Flow" checkbox

### 3. Send Estimate
- Click "Send Cleaning" or "Send Repair"
- Check for success message
- Verify email received

### 4. Test Approval Link
- Open email
- Click "Review Estimate" button
- Approve or reject the estimate

---

## Troubleshooting

### Error: "Email settings not configured"
**Solution:** Configure SMTP settings in Settings dropdown

### Error: "Client does not have an email address"
**Solution:** Add email to client in Data page

### Error: "Failed to send email"
**Possible causes:**
- Wrong SMTP credentials
- Gmail App Password not generated
- Firewall blocking port 587
- SMTP server down

**Check:**
1. Verify SMTP settings are correct
2. Test with a different email provider
3. Check browser console for detailed error

### Email not received
**Check:**
1. Spam/Junk folder
2. Email address is correct
3. SMTP settings are valid
4. Try sending to a different email

---

## Security Notes

- SMTP passwords are stored encrypted in database
- Never commit `.env` file with credentials
- Use App Passwords, not regular passwords
- Rotate passwords regularly

---

## Production Deployment

### Environment Variables:
```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Vercel/Hosting:
1. Add `NEXT_PUBLIC_APP_URL` to environment variables
2. Configure SMTP settings via UI after deployment
3. Test email sending in production

---

## Email Template Customization

To customize the email template, edit:
`src/app/api/send-estimate/route.ts`

Look for the `html` section in the `transporter.sendMail()` call.

---

**Created:** February 26, 2026  
**Feature:** Automatic Email Sending for Estimates
