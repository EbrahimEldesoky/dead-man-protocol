#!/usr/bin/env node
import { Command } from "commander";
import * as commands from "./commands";
import chalk from "chalk";

const program = new Command();

program
  .name("deadman")
  .description("CLI to manage the DeadMan Digital Inheritance Protocol")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new inheritance vault")
  .requiredOption("-k, --keypair <path>", "Path to wallet keypair")
  .requiredOption("-r, --rpc <url>", "RPC URL", "http://127.0.0.1:8899")
  .requiredOption("-w, --will <path>", "Path to the will file (plaintext)")
  .requiredOption("-d, --deadline <days>", "Deadline in days", parseFloat)
  .requiredOption("-g, --grace <days>", "Grace period in days", parseFloat)
  .requiredOption("-s, --sol <amount>", "Initial SOL deposit", parseFloat)
  .action(async (options) => {
    try {
      await commands.initVault(options.keypair, options.rpc, options.will, options.deadline, options.grace, options.sol);
    } catch (e: any) {
      console.error(chalk.red(`Error: ${e.message}`));
    }
  });

program
  .command("heartbeat")
  .description("Send a heartbeat to your vault to postpone the deadline")
  .requiredOption("-k, --keypair <path>", "Path to wallet keypair")
  .requiredOption("-r, --rpc <url>", "RPC URL", "http://127.0.0.1:8899")
  .action(async (options) => {
    try {
      await commands.heartbeat(options.keypair, options.rpc);
    } catch (e: any) {
      console.error(chalk.red(`Error: ${e.message}`));
    }
  });

program.parseAsync(process.argv);
