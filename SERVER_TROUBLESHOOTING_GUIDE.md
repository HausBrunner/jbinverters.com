# Server Troubleshooting Guide for JBInverters

## Problem 1: Server Keeps Crashing on Port 3000

### Root Cause
The server was experiencing a crash loop because PM2 was configured to run in production mode (`npm start`) instead of development mode with nodemon (`npm run dev:nodemon`).

### Symptoms
- Server restarts every second (crash loop)
- PM2 shows high restart count (↺ 453 restarts)
- Error logs only show timestamps without actual error messages
- Output logs show repeated `> jbinverters@0.1.0 start` attempts

## Problem 2: File Changes Not Updating / Hot Reload Not Working

### Root Cause
Multiple issues can prevent hot reload from working:
1. **Nodemon conflict with PM2** - nodemon's file watching doesn't work properly when run inside PM2
2. **Port conflicts** - leftover processes occupying port 3000
3. **Browser caching** - cached content preventing changes from showing

### Symptoms
- File changes don't appear in browser
- Server doesn't restart when files are modified
- Next.js switches to different ports (3001, 3002, etc.)
- Browser shows old content even after changes

### Solution Applied

#### 1. Fixed PM2 Configuration (`ecosystem.config.js`)
**Before:**
```javascript
args: 'start',
env: {
  NODE_ENV: 'production',
  PORT: 3000
}
```

**After:**
```javascript
args: 'run dev',
watch: false,  // Let Next.js handle file watching
env: {
  NODE_ENV: 'development',
  PORT: 3000
}
```

#### 2. Fixed Next.js Configuration Warning (`next.config.ts`)
**Before:**
```typescript
experimental: {
  serverComponentsExternalPackages: [],
},
```

**After:**
```typescript
serverExternalPackages: [],
```

#### 3. Resolved Port Conflicts
**Problem:** Leftover `next-server` processes occupying port 3000
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
netstat -tlnp | grep :3000

# Kill the specific process
kill -9 <PID>

# Or force kill all processes on port 3000
sudo fuser -k 3000/tcp
```

#### 4. Fixed File Watching Issues
**Problem:** Nodemon file watching conflicts with PM2
**Solution:** Use Next.js built-in hot reload instead:
- Set `watch: false` in PM2 config
- Let Next.js handle file watching with Turbopack
- Run development server directly: `npm run dev`

## How to Resolve Similar Issues Yourself

### Step 1: Identify the Problem
```bash
# Check PM2 status and restart count
pm2 status

# Check recent logs
pm2 logs jbinverters --lines 50

# Check if port is in use
lsof -i :3000
netstat -tlnp | grep :3000
```

### Step 2: Stop the Crashing Process
```bash
# Stop PM2 process
pm2 stop jbinverters

# Or delete and restart
pm2 delete jbinverters
```

### Step 3: Test Manual Startup
```bash
# Test the command manually to see actual errors
npm run dev:nodemon

# Or test production build
npm run build
npm start
```

### Step 4: Check Configuration Files
- **PM2 Config**: `ecosystem.config.js` - Ensure correct script and environment
- **Package.json**: Check available scripts (`npm run` shows all scripts)
- **Next.js Config**: `next.config.ts` - Look for deprecated options

### Step 5: Restart with Fixed Configuration
```bash
pm2 start ecosystem.config.js
pm2 status
```

## Development vs Production Setup

### Development Mode (Recommended for Development)
- Uses nodemon for auto-restart on file changes
- Runs `npm run dev:nodemon` → `nodemon` → `npm run dev`
- Environment: `NODE_ENV=development`
- Hot reloading enabled

### Production Mode (For Production Deployment)
- Uses built application
- Runs `npm start` → `next start`
- Environment: `NODE_ENV=production`
- Optimized build

## Common Issues and Solutions

### 1. Port Already in Use / Next.js Switching Ports
```bash
# Find process using port 3000
lsof -i :3000
netstat -tlnp | grep :3000

# Kill specific process by PID
kill -9 <PID>

# Or force kill all processes on port 3000
sudo fuser -k 3000/tcp

# Kill all PM2 processes first
pm2 kill

# Then kill any remaining node processes (use with caution)
pkill -f node
```

### 2. File Changes Not Updating / Hot Reload Issues
```bash
# Check if server is actually running
curl -I http://localhost:3000

# Check for port conflicts
lsof -i :3000

# Try incognito/private browsing to bypass cache
# Or hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

# If using PM2, check logs for restart loops
pm2 logs jbinverters --lines 20

# For development, consider running directly instead of PM2
npm run dev
```

### 3. PM2 Process Not Starting
```bash
# Check PM2 logs
pm2 logs jbinverters

# Check if PM2 is running
pm2 status

# Restart PM2 daemon
pm2 kill
pm2 start ecosystem.config.js
```

### 4. Next.js Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### 5. Database Connection Issues
```bash
# Check if database exists
ls -la prisma/

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 6. Environment Variables Missing
```bash
# Check environment files
ls -la .env*

# Verify required variables are set
cat .env.local
```

## Monitoring and Maintenance

### Regular Health Checks
```bash
# Check server status
curl -I http://localhost:3000

# Check PM2 status
pm2 status

# Monitor logs
pm2 logs jbinverters --lines 20
```

### Log Rotation
PM2 automatically rotates logs, but you can manually clean them:
```bash
# Clean old logs
pm2 flush jbinverters

# Or delete log files directly
rm logs/*.log
```

### Performance Monitoring
```bash
# Monitor resource usage
pm2 monit

# Check memory usage
pm2 show jbinverters
```

## Emergency Recovery

### If Server Won't Start at All
1. **Stop all processes:**
   ```bash
   pm2 kill
   pkill -f node
   ```

2. **Clean everything:**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   ```

3. **Test manual startup:**
   ```bash
   npm run dev:nodemon
   ```

4. **Restart PM2:**
   ```bash
   pm2 start ecosystem.config.js
   ```

### If Database Issues
1. **Reset database:**
   ```bash
   npx prisma migrate reset
   npx prisma db seed
   ```

2. **Check database connection:**
   ```bash
   npx prisma studio
   ```

## Prevention Tips

1. **Always test changes locally** before deploying
2. **Use version control** to track configuration changes
3. **Monitor logs regularly** for early warning signs
4. **Keep dependencies updated** but test thoroughly
5. **Use environment-specific configurations** for dev/prod

## Quick Reference Commands

```bash
# PM2 Management
pm2 start ecosystem.config.js    # Start app
pm2 stop jbinverters             # Stop app
pm2 restart jbinverters          # Restart app
pm2 delete jbinverters           # Delete app
pm2 status                       # Show status
pm2 logs jbinverters             # Show logs

# Development
npm run dev                      # Start development server (recommended)
npm run dev:nodemon              # Start with nodemon (if needed)
npm run build                    # Build for production
npm start                        # Start production build

# Database
npx prisma migrate dev           # Run migrations
npx prisma generate              # Generate client
npx prisma db seed               # Seed database
```

---

**Last Updated:** October 8, 2025  
**Issues Fixed:** 
- Server crash loop due to incorrect PM2 configuration  
- File watching/hot reload issues with nodemon + PM2 conflicts
- Port conflicts preventing proper development server startup
**Status:** ✅ Resolved

## Recent Issues Resolved (October 8, 2025)

### Issue: Development Server Not Reflecting File Changes
**Symptoms:**
- File changes not appearing in browser
- Next.js switching to ports 3001, 3002 instead of 3000
- PM2 logs showing crash loops with repeated restarts

**Root Causes:**
1. Leftover `next-server` process occupying port 3000
2. Nodemon file watching conflicts with PM2
3. Browser caching preventing change visibility

**Final Solution:**
- Killed leftover processes: `sudo fuser -k 3000/tcp`
- Switched to direct Next.js development: `npm run dev`
- Let Next.js Turbopack handle file watching instead of nodemon
- Used incognito mode to bypass browser cache during testing

**Result:** ✅ Development server now running on port 3000 with proper hot reload
