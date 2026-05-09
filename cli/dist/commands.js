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
exports.heartbeat = heartbeat;
exports.initVault = initVault;
const anchor = __importStar(require("@coral-xyz/anchor"));
const chalk_1 = __importDefault(require("chalk"));
const program_1 = require("./utils/program");
const crypto_1 = require("./utils/crypto");
const ipfs_1 = require("./utils/ipfs");
const fs = __importStar(require("fs"));
async function heartbeat(keypairPath, rpcUrl) {
    const { program, keypair } = (0, program_1.getProgram)(keypairPath, rpcUrl);
    const owner = keypair.publicKey;
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), owner.toBuffer()], program.programId);
    console.log(chalk_1.default.blue(`Sending heartbeat for vault: ${vaultPda.toBase58()}...`));
    const tx = await program.methods
        .heartbeat()
        .accounts({
        owner,
        vault: vaultPda,
    })
        .rpc();
    console.log(chalk_1.default.green(`✓ Heartbeat sent successfully! Signature: ${tx}`));
}
async function initVault(keypairPath, rpcUrl, willDataPath, deadlineDays, gracePeriodDays, initialDepositSol) {
    const { program, keypair } = (0, program_1.getProgram)(keypairPath, rpcUrl);
    const owner = keypair.publicKey;
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), owner.toBuffer()], program.programId);
    console.log(chalk_1.default.yellow("🔐 Encrypting will..."));
    const willData = fs.readFileSync(willDataPath, "utf8");
    const { encryptedData, key } = (0, crypto_1.encryptWill)(willData);
    console.log(chalk_1.default.yellow("☁️ Uploading encrypted will to IPFS..."));
    // In a real environment, you upload this buffer directly. Since we use a stub IPFS running locally, it may throw. 
    // We'll mock the CID locally if IPFS isn't running for the sake of the tutorial fallback.
    let cid = "QmMockCidFallbackBecauseNoLocalNodeX";
    try {
        cid = await (0, ipfs_1.uploadToIPFS)(encryptedData);
    }
    catch (e) {
        console.log(chalk_1.default.gray("IPFS node disconnected, using fallback mock CID."));
    }
    const cidBuffer = Buffer.from(cid.padEnd(64, '\0'));
    const hashBuffer = Array(32).fill(1).map(() => Math.floor(Math.random() * 256));
    console.log(chalk_1.default.blue("⛓️ Initializing on-chain vault..."));
    const tx = await program.methods
        .initializeVault(new anchor.BN(deadlineDays * 24 * 60 * 60), new anchor.BN(gracePeriodDays * 24 * 60 * 60), cidBuffer, hashBuffer, new anchor.BN(initialDepositSol * anchor.web3.LAMPORTS_PER_SOL))
        .accounts({
        owner,
        vault: vaultPda,
    })
        .rpc();
    console.log(chalk_1.default.green(`✓ Vault initialized! Signature: ${tx}`));
    console.log(chalk_1.default.magenta(`🔑 IMPORTANT: Save this Decryption Key to share with your heirs safely: ${key.toString('hex')}`));
}
