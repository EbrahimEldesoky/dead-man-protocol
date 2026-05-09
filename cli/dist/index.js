#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const commands = __importStar(require("./commands"));
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
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
    }
    catch (e) {
        console.error(chalk_1.default.red(`Error: ${e.message}`));
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
    }
    catch (e) {
        console.error(chalk_1.default.red(`Error: ${e.message}`));
    }
});
program.parseAsync(process.argv);
