module.exports = {
  apps: [
    {
      name: "ponder",
      cwd: "./packages/ponder",
      script: "dev",
      interpreter: "bun",
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
