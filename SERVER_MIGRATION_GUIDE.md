# JB Inverters - Server Migration Guide

## 🎯 Overview
This guide will help you move your JB Inverters project from your current server to a fresh Linux server with the same OS.

---

## 📋 Prerequisites

### On Your Current Server
- [ ] Project is working and tested
- [ ] Database has been backed up
- [ ] Environment variables are documented
- [ ] All dependencies are installed

### On Your New Server
- [ ] Linux server with same OS (Ubuntu/Debian/CentOS)
- [ ] Root or sudo access
- [ ] Internet connection
- [ ] Basic server setup completed

---

## 🚀 Step 1: Prepare Your Current Server

### 1.1 Backup Your Database
```bash
# Navigate to your project directory
cd /home/jason/webdev/jbinverters

# Create a backup of your SQLite database
cp prisma/dev.db prisma/dev.db.backup

# Optional: Export data to SQL dump
sqlite3 prisma/dev.db .dump > database_backup.sql
```

### 1.2 Document Environment Variables
```bash
# Copy your current .env file for reference
cp .env .env.backup

# Note down any custom configurations
cat .env
```

### 1.3 Create Project Archive
```bash
# Create a compressed archive of your project
tar -czf jbinverters-backup.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=prisma/dev.db \
  --exclude=.env \
  /home/jason/webdev/jbinverters

# Verify the archive was created
ls -lh jbinverters-backup.tar.gz
```

---

## 📦 Step 2: Transfer Files to New Server

### Method 1: SCP (Secure Copy)
```bash
# From your current server, copy to new server
scp jbinverters-backup.tar.gz username@new-server-ip:/home/username/

# Example:
scp jbinverters-backup.tar.gz jason@192.168.1.100:/home/jason/
```

### Method 2: rsync (Recommended)
```bash
# Sync the entire project directory (excluding node_modules)
rsync -avz --exclude=node_modules \
  --exclude=.next \
  --exclude=prisma/dev.db \
  /home/jason/webdev/jbinverters/ \
  username@new-server-ip:/home/username/jbinverters/
```

### Method 3: Git (If using version control)
```bash
# On new server, clone from your repository
git clone https://github.com/yourusername/jbinverters.git
cd jbinverters
```

---

## 🛠️ Step 3: Setup New Server

### 3.1 Install Node.js
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 3.3 Install Additional Dependencies
```bash
# Install build tools (if needed)
sudo apt-get install -y build-essential

# Install Git (if not already installed)
sudo apt-get install -y git
```

---

## 📁 Step 4: Restore Project on New Server

### 4.1 Extract Project Files
```bash
# Navigate to your home directory
cd /home/username

# Extract the archive (if using tar method)
tar -xzf jbinverters-backup.tar.gz

# Or if using rsync, the files should already be in place
cd jbinverters
```

### 4.2 Install Dependencies
```bash
# Install all project dependencies
npm install

# This will install all packages from package.json
```

### 4.3 Setup Environment Variables
```bash
# Create .env file
cp .env.example .env

# Edit with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_URL="http://your-server-ip:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Configuration (if using contact form)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@jbinverters.com"

# Venmo Configuration
VENMO_USERNAME="jbinverters"
```

### 4.4 Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Restore your database backup
cp prisma/dev.db.backup prisma/dev.db

# Or restore from SQL dump
sqlite3 prisma/dev.db < database_backup.sql

# Seed database (optional)
npm run db:seed
```

---

## 🔧 Step 5: Configure Production Settings

### 5.1 Update PM2 Configuration
```bash
# Edit ecosystem.config.js
nano ecosystem.config.js
```

Update the file paths:
```javascript
module.exports = {
  apps: [{
    name: 'jbinverters',
    script: 'npm',
    args: 'start',
    cwd: '/home/username/jbinverters', // Update this path
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### 5.2 Create Logs Directory
```bash
# Create logs directory
mkdir -p logs

# Set proper permissions
chmod 755 logs
```

### 5.3 Build Production Version
```bash
# Build the application for production
npm run build

# Verify build was successful
ls -la .next
```

---

## 🚀 Step 6: Start the Application

### 6.1 Test the Application
```bash
# Start in development mode first to test
npm run dev

# Test in browser: http://your-server-ip:3000
# Test admin login: http://your-server-ip:3000/admin/login
```

### 6.2 Start with PM2
```bash
# Start the application with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs jbinverters

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## 🔒 Step 7: Security & Firewall

### 7.1 Configure Firewall
```bash
# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Allow HTTP traffic
sudo ufw allow 3000

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 7.2 Update Admin Credentials
```bash
# Change default admin password
# Access admin dashboard and update credentials
# Or use Prisma Studio to update directly
npx prisma studio
```

---

## 🌐 Step 8: Domain & Reverse Proxy (Optional)

### 8.1 Install Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 8.2 Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/jbinverters
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/jbinverters /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## ✅ Step 9: Verification Checklist

### 9.1 Application Tests
- [ ] Homepage loads correctly
- [ ] Product catalog displays
- [ ] Shopping cart works
- [ ] Contact form submits
- [ ] Admin login works
- [ ] Admin dashboard functions
- [ ] Database operations work
- [ ] Email notifications work (if configured)

### 9.2 Performance Tests
- [ ] Page load times are acceptable
- [ ] No console errors
- [ ] Mobile responsiveness works
- [ ] PM2 process is stable

### 9.3 Security Tests
- [ ] Admin routes are protected
- [ ] Environment variables are secure
- [ ] Firewall is configured
- [ ] Default passwords changed

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database file permissions
ls -la prisma/dev.db

# Fix permissions if needed
chmod 644 prisma/dev.db
```

#### 2. Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 PID_NUMBER
```

#### 3. PM2 Issues
```bash
# Restart PM2
pm2 restart jbinverters

# Reload PM2 configuration
pm2 reload ecosystem.config.js

# Delete and restart
pm2 delete jbinverters
pm2 start ecosystem.config.js
```

#### 4. Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📊 Monitoring & Maintenance

### 7.1 Monitor Application
```bash
# Check PM2 status
pm2 status

# View real-time logs
pm2 logs jbinverters --lines 100

# Monitor system resources
pm2 monit
```

### 7.2 Backup Strategy
```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/username/backups"
PROJECT_DIR="/home/username/jbinverters"

mkdir -p $BACKUP_DIR

# Backup database
cp $PROJECT_DIR/prisma/dev.db $BACKUP_DIR/database_$DATE.db

# Backup project files
tar -czf $BACKUP_DIR/project_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  $PROJECT_DIR

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/username/jbinverters/backup.sh
```

---

## 🎉 Migration Complete!

Your JB Inverters project should now be running on the new server. The application will be accessible at:
- **Direct access**: `http://your-server-ip:3000`
- **With domain**: `http://your-domain.com` (if configured)

### Next Steps
1. Update DNS records to point to new server
2. Setup SSL certificate (Let's Encrypt)
3. Configure automated backups
4. Setup monitoring and alerts
5. Update any external references to the old server

### Support
If you encounter any issues during migration, check the troubleshooting section or review the application logs for specific error messages.
