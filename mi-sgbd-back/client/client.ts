console.log("Iniciando Pruebas SGBD_WEB3 (CRUD Total)...");

const collectionName = "DB_Drop_Test_1";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const [collectionPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("collection"), pg.wallet.publicKey.toBuffer(), Buffer.from(collectionName)],
  pg.program.programId
);

async function main() {
  try {
    // 1. CREATE COLLECTION
    console.log(`\n[1] Creando la colección '${collectionName}'...`);
    try {
      await pg.program.methods.createCollection(collectionName)
        .accounts({ collection: collectionPda, authority: pg.wallet.publicKey, systemProgram: anchor.web3.SystemProgram.programId })
        .rpc();
      console.log("✅ Colección creada.");
    } catch (e) {
      console.log("⚠️ La colección ya existe.");
    }

    // 2. INSERT MULTIPLES REGISTROS (Simulando actividad)
    console.log("\n[2] Insertando 2 registros de prueba...");
    for (let i = 0; i < 2; i++) {
      let colData = await pg.program.account.collection.fetch(collectionPda);
      let idBuffer = colData.recordCount.toArrayLike(Buffer, "le", 8);
      
      let [recordPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("record"), collectionPda.toBuffer(), idBuffer],
        pg.program.programId
      );

      await pg.program.methods.insertRecord(`Hash_Prueba_Nro_${i}`)
        .accounts({ collection: collectionPda, dbRecord: recordPda, authority: pg.wallet.publicKey, systemProgram: anchor.web3.SystemProgram.programId })
        .rpc();
      console.log(`✅ Registro ID ${i} insertado.`);
    }

    await sleep(2000);

    // 3. EL BUCLE DE DESTRUCCIÓN (DROP DATABASE)
    console.log("\n[3] Iniciando DROP COLLECTION (Borrando registros huérfanos)...");
    
    // a) Buscamos TODOS los registros que pertenezcan a esta colección en la blockchain
    // El offset 8 salta el discriminador de Anchor, y leemos la pubkey de la colección
    const recordsHuerfanos = await pg.program.account.dbRecord.all([
      {
        memcmp: {
          offset: 8,
          bytes: collectionPda.toBase58(),
        },
      },
    ]);

    console.log(`🔍 Se encontraron ${recordsHuerfanos.length} registros. Borrando en bucle...`);

    // b) Borramos cada registro en un bucle
    for (let rec of recordsHuerfanos) {
      await pg.program.methods.deleteRecord()
        .accounts({ dbRecord: rec.publicKey, authority: pg.wallet.publicKey })
        .rpc();
      console.log(`💀 Registro cerrado: ${rec.publicKey.toBase58().substring(0,8)}...`);
    }

    await sleep(2000);

    // c) Borramos la colección madre
    console.log("\n[4] Destruyendo la Colección Madre...");
    await pg.program.methods.deleteCollection()
      .accounts({ collection: collectionPda, authority: pg.wallet.publicKey })
      .rpc();
    
    console.log("✅ ¡DROP DATABASE EJECUTADO CON ÉXITO! Todos los SOL recuperados.");

  } catch (e) {
    console.error("❌ Error Crítico:", e);
  }
}

main();