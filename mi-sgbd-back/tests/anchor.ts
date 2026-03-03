import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SgbdWeb3 } from "../target/types/sgbd_web3";
import type { SgbdWeb3 } from "../target/types/sgbd_web3";

describe("Pruebas_SGBD", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SgbdWeb3 as anchor.Program<SgbdWeb3>;
  
  // Configuramos la conexión a la red local/devnet que usa Playground
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SgbdWeb3 as Program<SgbdWeb3>;

  it("Inserta un registro en la base de datos", async () => {
    // Los datos que vamos a guardar
    const clave = "temperatura_cpu";
    const valor = "85C";

    // 1. Calculamos el PDA (Dirección única)
    const [registroPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("registro"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(clave),
      ],
      program.programId
    );

    // 2. Ejecutamos la función insertar_registro de Rust
    const tx = await program.methods
      .insertarRegistro(clave, valor)
      .accounts({
        registro: registroPDA,
        usuario: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("¡Transacción exitosa! Firma:", tx);

    // 3. Leemos el dato directamente de la blockchain para confirmar
    const cuenta = await program.account.modeloRegistro.fetch(registroPDA);
    console.log("--- LECTURA DE LA BASE DE DATOS ---");
    console.log("Clave guardada:", cuenta.clave);
    console.log("Valor guardado:", cuenta.valor);
  });
});
