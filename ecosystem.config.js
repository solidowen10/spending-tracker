module.exports = {
  apps: [
    {
      name: "spending-tracker",
      cwd: __dirname,
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
      },
      // Restart on crash, but don't loop forever if something is fundamentally broken
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
