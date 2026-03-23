module.exports = {
  apps: [
    {
      name: "183-backend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",

      // Environment variables
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        SERVE_FRONTEND: "true",
      },

      // Restart behaviour
      watch: false,
      max_memory_restart: "500M",
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",

      // Logging
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // Node args
      node_args: "--max-http-header-size=80000",
    },
  ],
};
