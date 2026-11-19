// PM2 process file for the Ubuntu server: `pm2 start ecosystem.config.cjs`
module.exports = {
  apps: [
    {
      name: 'trainee_sc-api',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001 -H 127.0.0.1',
      cwd: __dirname,
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
    },
  ],
};
