const config = {
  apps: [
    {
      name: "ponder",
      script: "bun",
      args: "run dev",
      interpreter: "bash",
      cwd: "./",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};

export default config;
