# Admin Payment System Guide

## Overview

The admin payment system at `/admin/tutor-payouts` allows PTLC administrators to process payments to tutors after parents have paid for sessions.

## Accessing the Payment System

1. Log in as an admin user
2. Navigate to `/admin/tutor-payouts`
3. View pending payouts and payment history

## Features

### 1. Pending Payouts Tab

Shows all tutors who are awaiting payment from PTLC.

#### What You See:
- **Tutor name and email**
- **Total amount owed** (sum of all pending payments)
- **Number of payments** (sessions to be paid)
- **Detailed breakdown** of each session

#### Actions:
- **Select tutors** using checkboxes for batch processing
- **Pay individual tutor** using "Pay Now" button
- **Batch pay** multiple tutors using "Pay Selected" button

### 2. Payment Modal

When you click "Pay Now", a modal opens with:

#### Payment Details:
- Tutor name and email
- Total amount to pay
- Number of payments included

#### Payment Information:
- **Payment Method**: Choose from:
  - GCash (default)
  - Bank Transfer
  - Cash
- **Reference Number**: Optional field for transaction reference
- **Notes**: Optional field for additional information

#### Actions:
- **Cancel**: Close modal without processing
- **Confirm Payment**: Process the payout

### 3. Payout History Tab

Shows all completed payouts to tutors.

#### Information Displayed:
- Date paid
- Tutor name and email
- Session details (student, subject)
- Amount paid
- Payment method used
- Reference number (if provided)

## How to Process Payouts

### Individual Payout

1. Go to "Pending Payouts" tab
2. Find the tutor you want to pay
3. Click "Pay Now" button
4. In the modal:
   - Select payment method (GCash, Bank Transfer, or Cash)
   - Enter reference number (optional but recommended)
   - Add notes if needed
5. Click "Confirm Payment"
6. Tutor receives notification
7. Tutor sees earnings updated

### Batch Payout

1. Go to "Pending Payouts" tab
2. Select multiple tutors using checkboxes
3. Click "Pay Selected (X)" button at the top
4. System processes all selected tutors
5. All tutors receive notifications
6. All earnings updated

## Payment Methods

### GCash
- Send money to tutor's GCash number
- Enter GCash reference number in the modal
- Most common method

### Bank Transfer
- Transfer to tutor's bank account
- Enter bank reference number
- Good for larger amounts

### Cash
- Hand cash to tutor in person
- Use for local/in-person payments
- Add notes about when/where paid

## Best Practices

### Payout Schedule
- Process payouts during the first week of each month (1st-7th)
- System shows green banner during payout week if there are pending payouts
- System shows blue banner outside payout week with next payout date
- Communicate schedule to tutors

### Documentation
- Always enter reference numbers when available
- Add notes for special circumstances
- Keep records of all transactions

### Verification
- Double-check amounts before confirming
- Verify tutor contact information
- Confirm payment method with tutor if needed

### Communication
- Notify tutors of payout schedule
- Inform tutors when processing payouts
- Respond to payout inquiries promptly

## Statistics Dashboard

At the top of the page, you'll see:

### Total Pending
- Total amount owed to all tutors
- Updates in real-time as payouts are processed

### Tutors Awaiting Payment
- Number of tutors with pending payouts
- Helps prioritize batch processing

### Pending Payments
- Total number of individual session payments
- Shows workload

### Selected Amount
- Amount selected for batch payout
- Updates as you select/deselect tutors

## Notifications

### Tutors Receive:
- Notification when payout is processed
- Message: "You received ₱X from PTLC for your session with [student]"
- Notification appears in their dashboard

### Admins See:
- Success toast when payout completes
- Error toast if payout fails
- Updated statistics immediately

## Financial Breakdown

### Example Payment:
```
Parent paid PTLC:     ₱1,000
Platform fee (10%):   ₱100
Tutor receives:       ₱900
```

### Multiple Sessions:
If tutor has 3 sessions @ ₱1,000 each:
```
Total parent payments: ₱3,000
Platform fees:         ₱300
Tutor payout:          ₱2,700
```

## Troubleshooting

### Tutor Not Showing in Pending List

**Possible Reasons:**
- Parent hasn't paid yet
- Payment not verified by admin
- Already paid to tutor

**Solution:**
1. Check `/admin/payments` to verify parent payment
2. Verify the payment if needed
3. Refresh the payouts page

### Payment Processing Failed

**Possible Reasons:**
- Network connection issue
- Database permission error
- Invalid payment data

**Solution:**
1. Check your internet connection
2. Try again
3. Contact technical support if persists

### Wrong Amount Showing

**Check:**
- Amount shown is 90% of parent payment (10% platform fee)
- Multiple sessions are summed correctly
- No duplicate payments

### Tutor Says They Didn't Receive Payment

**Steps:**
1. Check "Payout History" tab
2. Verify payment was processed
3. Check payment method and reference
4. Confirm with payment provider (GCash, bank)
5. Reprocess if necessary

## Security

### Access Control
- Only admin users can access this page
- All actions are logged
- Payment history is permanent

### Data Protection
- Reference numbers are stored securely
- Payment information is encrypted
- Audit trail maintained

## Reports & Analytics

### Generate Reports:
- Export payout history (future feature)
- Monthly payout summaries (future feature)
- Tutor earnings reports (future feature)

### Current Tracking:
- View all payouts in history tab
- Filter by date (future feature)
- Search by tutor (future feature)

## Integration

### Connected Systems:
- **Payments**: Linked to parent payment verification
- **Notifications**: Sends notifications to tutors
- **Earnings**: Updates tutor earnings in real-time
- **Dashboard**: Reflects in tutor dashboard

### Data Flow:
```
Parent Payment → Admin Verification → Pending Payout → Admin Processes → Tutor Receives → Earnings Updated
```

## Future Enhancements

### Planned Features:
1. **Automated Payouts**: Schedule automatic weekly payouts
2. **Payment Requests**: Tutors can request early payout
3. **Minimum Threshold**: Only payout when balance reaches ₱X
4. **API Integration**: Integrate with GCash/bank APIs
5. **Export Reports**: Download payout reports as CSV/PDF
6. **Advanced Filters**: Filter by date, amount, method
7. **Bulk Upload**: Upload multiple payouts via CSV
8. **Payment Approval**: Multi-step approval process

## Support

### Need Help?
- Check this guide first
- Review `TUTOR_PAYOUT_SYSTEM.md` for technical details
- Contact technical support
- Report bugs or issues

### Common Questions:

**Q: How often should I process payouts?**
A: Weekly or bi-weekly is recommended. Set a consistent schedule.

**Q: Can I undo a payout?**
A: No, payouts are final. Double-check before confirming.

**Q: What if I enter wrong reference number?**
A: Contact technical support to update the record.

**Q: Can tutors see payment history?**
A: Yes, tutors see their payout history in their earnings page.

**Q: What happens if payment fails?**
A: You'll see an error message. Try again or contact support.

## Quick Reference

### Process Individual Payout:
1. Click "Pay Now"
2. Select method
3. Enter reference
4. Confirm

### Process Batch Payout:
1. Select tutors
2. Click "Pay Selected"
3. Confirm batch

### View History:
1. Click "Payout History" tab
2. Browse completed payouts
3. Check details

### Refresh Data:
1. Click "Refresh" button
2. Data updates automatically
