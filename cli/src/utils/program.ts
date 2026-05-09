import * as anchor from "@coral-xyz/anchor";
import { Program, Idl } from "@coral-xyz/anchor";
import * as fs from "fs";

export function getProgram(keypairPath: string, rpcUrl: string): { program: Program, keypair: anchor.web3.Keypair } {
  const secretKeyString = fs.readFileSync(keypairPath, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);

  const connection = new anchor.web3.Connection(rpcUrl, "confirmed");
  const wallet = new anchor.Wallet(keypair);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Note: Needs strictJSON assertions in tsconfig to import JSON modules
  const idlStr = fs.readFileSync(require.resolve("../../../target/idl/dead_man_protocol.json"), "utf8");
  const idl = JSON.parse(idlStr);

  const program = new Program(idl as Idl, provider);
  return { program, keypair };
}
