module.exports = {
  apps: [
    {
      name: "ponder",
      cwd: "./packages/ponder",
      script: "bun",
      args: "dev",
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
