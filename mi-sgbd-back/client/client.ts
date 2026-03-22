console.log("Iniciando el cliente del SGBD...");

const collectionName = "UsuariosApp";
const recordHash = "QmTzQ1...IPFS_Hash_Simulado"; 

const [collectionPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("collection"), pg.wallet.publicKey.toBuffer(), Buffer.from(collectionName)],
  pg.program.programId
);

console.log("PDA de la Colección:", collectionPda.toBase58());

async function main() {
  try {
    console.log("Creando la colección...");
    const txHash = await pg.program.methods
      .createCollection(collectionName)
      .accounts({
        collection: collectionPda,
        authority: pg.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("✅ Colección creada. Tx:", txHash);
  } catch (e) {
    console.log("⚠️ La colección ya existe (ignoramos).");
  }

  const collectionAccount = await pg.program.account.collection.fetch(collectionPda);
  const currentCount = collectionAccount.recordCount;
  
  // Convertimos el ID a un formato que Rust entienda
  const idBuffer = currentCount.toArrayLike(Buffer, "le", 8);

  const [recordPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("record"), collectionPda.toBuffer(), idBuffer],
    pg.program.programId
  );

  try {
    console.log(`Insertando registro con ID: ${currentCount.toString()}...`);
    const txRec = await pg.program.methods
      .insertRecord(recordHash)
      .accounts({
        collection: collectionPda,
        dbRecord: recordPda,
        authority: pg.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("✅ Registro insertado. Tx:", txRec);
    
    const recAccount = await pg.program.account.dbRecord.fetch(recordPda);
    console.log("📚 Datos en Blockchain -> Hash:", recAccount.contentHash);
  } catch (e) {
    console.error("❌ Error al insertar el registro:", e);
  }
}

main();