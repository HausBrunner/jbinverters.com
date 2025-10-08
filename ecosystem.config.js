module.exports = {
  apps: [{
    name: 'jbinverters',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/jason/jbinverters',
    instances: 1,
    autorestart: true,
    watch: false,  // Let Next.js handle file watching
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}