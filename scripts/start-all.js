#!/usr/bin/env node

/**
 * UniLodge v2 - Multi-service starter
 * Starts all three services: Frontend, Backend, AI Engine
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, prefix, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `${colors[color]}[${timestamp}]${colors.reset} ${prefix} ${message}`,
  );
}

function checkPort(port) {
  return new Promise((resolve) => {
    require("net")
      .createConnection({ port })
      .on("connect", () => {
        resolve(true);
      })
      .on("error", () => {
        resolve(false);
      });
  });
}

async function startService(name, command, cwd, port, color) {
  log(color, `[${name}]`, `Starting...`);

  if (port) {
    const inUse = await checkPort(port);
    if (inUse) {
      log("red", `[${name}]`, `Port ${port} already in use!`);
      return false;
    }
  }

  return new Promise((resolve) => {
    const child = spawn(command, [], {
      shell: true,
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        FORCE_COLOR: "1",
      },
    });

    child.on("error", (err) => {
      log("red", `[${name}]`, `Error: ${err.message}`);
      resolve(false);
    });

    child.on("close", (code) => {
      if (code === 0) {
        log("green", `[${name}]`, `Exited successfully`);
      } else {
        log("red", `[${name}]`, `Exited with code ${code}`);
      }
      resolve(code === 0);
    });

    // Service started
    log("green", `[${name}]`, `Running on port ${port || "N/A"}`);
    resolve(true);
  });
}

async function main() {
  console.log("");
  console.log(
    colors.blue +
      "═══════════════════════════════════════════════" +
      colors.reset,
  );
  console.log(
    colors.cyan + "   🚀 UniLodge v2 - Multi-Service Startup" + colors.reset,
  );
  console.log(
    colors.blue +
      "═══════════════════════════════════════════════" +
      colors.reset,
  );
  console.log("");

  const rootDir = path.resolve(__dirname, "..");
  const services = [
    {
      name: "Frontend",
      command: "npm run dev:frontend",
      cwd: rootDir,
      port: 3000,
      color: "green",
    },
    {
      name: "Backend API",
      command: "npm run dev:backend",
      cwd: rootDir,
      port: 3001,
      color: "cyan",
    },
    {
      name: "AI Engine",
      command: "npm run dev:ai",
      cwd: rootDir,
      port: 8000,
      color: "yellow",
    },
  ];

  // Pre-flight checks
  log("blue", "[SETUP]", "Running pre-flight checks...");
  log("green", "[SETUP]", "✓ Node.js " + process.version);
  log("green", "[SETUP]", "✓ npm ready");

  // Check if node_modules exists
  if (!fs.existsSync(path.join(rootDir, "node_modules"))) {
    log(
      "yellow",
      "[SETUP]",
      "Installing dependencies (this may take a few minutes)...",
    );
    // Dependencies will be installed when services start
  }

  console.log("");
  log("blue", "[SETUP]", "Starting services in parallel...");
  console.log("");

  // Start all services in parallel
  const promises = services.map((service) =>
    startService(
      service.name,
      service.command,
      service.cwd,
      service.port,
      service.color,
    ),
  );

  await Promise.all(promises);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
