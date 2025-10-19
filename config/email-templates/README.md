# Email Templates Configuration

This directory contains JSON configuration files for email templates used by the JB Inverters application.

## Files

- `product-orders.json` - Email templates for regular product orders
- `repair-orders.json` - Email templates for repair service orders (mail-in service)

## Editing Templates

You can edit these JSON files to customize email content. The application will automatically reload the templates when they are updated.

### Template Variables

The following variables can be used in email templates:

- `[customerName]` - Customer's name
- `[orderNumber]` - Order number
- `[orderDate]` - Formatted order date
- `[customerAddress]` - Customer's shipping address
- `[itemsList]` - Formatted list of ordered items
- `[total]` - Order total
- `[repairQuote]` - Repair quote details (repair orders only)

### File Permissions

The files are owned by `www-data:www-data` with permissions `644` to allow the application service to read them.

## Structure

Each template file contains:

- `orderType` - Type of order (product/repair)
- `description` - Description of the template set
- `initialConfirmation` - Template for initial order confirmation emails
- `statusUpdates` - Templates for status update emails
- `htmlTemplate` - HTML wrapper template for status updates

## Backup

Always backup these files before making changes, as they control all customer-facing email communications.
