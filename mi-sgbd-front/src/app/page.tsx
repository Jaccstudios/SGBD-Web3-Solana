'use client';

import { useState, useEffect, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Idl, BN } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import idl from '../idl.json';

// El ID de tu Smart Contract en Solana Devnet
const PROGRAM_ID = new PublicKey("HFZem2x9kmBtxNmAxHWb6MigiHjGEKV8maGYsMtgiSm9");

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  
  const [history, setHistory] = useState<string[]>([
    "SGBD_WEB3 [Versión 3.0.0 - Devnet]",
    "(c) WayLearn Hackathon 2026. Todos los derechos reservados.",
    "Inicializando motor híbrido on-chain...",
    "",
    "Escribe 'HELP' para ver la lista de comandos disponibles."
  ]);
  const [input, setInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll para que la terminal siempre muestre la línea más reciente
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const printLine = (line: string) => {
    setHistory((prev) => [...prev, line]);
  };

  const procesarComando = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    printLine(`root@sgbd:~# ${cmd}`);
    setInput('');

    const args = cmd.split(/\s+/);
    const comando = args[0].toUpperCase();

    // Comandos Locales (No requieren Solana)
    if (comando === 'CLEAR') {
      setHistory([]);
      return;
    }

    if (comando === 'HELP') {
      printLine("Comandos soportados:");
      printLine("  CREATE <coleccion>               - Crea una nueva Base de Datos.");
      printLine("  INSERT <coleccion> <hash>        - Inserta un nuevo registro.");
      printLine("  READ   <coleccion> <id>          - Lee un registro por su ID.");
      printLine("  UPDATE <coleccion> <id> <hash>   - Actualiza el hash de un registro.");
      printLine("  DELETE <coleccion> <id>          - Elimina un registro individual.");
      printLine("  DROP   <coleccion>               - Destruye TODA la BD y sus registros.");
      printLine("  CLEAR                            - Limpia la consola.");
      return;
    }

    // Validación de Wallet para comandos On-Chain
    if (!wallet) {
      printLine("[!] Error: Conecta tu Phantom Wallet primero.");
      return;
    }

    try {
      const provider = new AnchorProvider(connection, wallet, { 
        preflightCommitment: "confirmed",
        commitment: "confirmed"
      });
      const program = new Program(idl as Idl, PROGRAM_ID, provider);
      
      const coleccionNombre = args[1];
      if (!coleccionNombre) throw new Error("Falta el nombre de la colección.");

      // PDA principal de la Colección
      const [collectionPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("collection"), wallet.publicKey.toBuffer(), Buffer.from(coleccionNombre)],
        PROGRAM_ID
      );

      switch (comando) {
        case 'CREATE': {
          printLine(`[>] Creando colección '${coleccionNombre}' en Devnet...`);
          const tx = await program.methods.createCollection(coleccionNombre)
            .accounts({ 
              collection: collectionPda, 
              authority: wallet.publicKey, 
              systemProgram: web3.SystemProgram.programId 
            })
            .rpc();
          printLine(`[OK] Colección creada. TX: ${tx}`);
          break;
        }

        case 'INSERT': {
          const hash = args[2];
          if (!hash) throw new Error("Falta el hash de contenido.");
          
          printLine("[>] Consultando índice...");
          const colAccount: any = await program.account.collection.fetch(collectionPda);
          const currentCount: BN = colAccount.recordCount;
          const idBuffer = currentCount.toArrayLike(Buffer, "le", 8);

          const [recordPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("record"), collectionPda.toBuffer(), idBuffer],
            PROGRAM_ID
          );

          printLine(`[>] Insertando registro...`);
          const tx = await program.methods.insertRecord(hash)
            .accounts({ 
              collection: collectionPda, 
              dbRecord: recordPda, 
              authority: wallet.publicKey, 
              systemProgram: web3.SystemProgram.programId 
            })
            .rpc();
          printLine(`[OK] Insertado exitosamente. ID Asignado: ${currentCount.toString()}`);
          break;
        }

        case 'READ': {
          const idStr = args[2];
          if (!idStr) throw new Error("Falta el ID del registro.");
          
          const idBuffer = new BN(idStr).toArrayLike(Buffer, "le", 8);
          const [recordPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("record"), collectionPda.toBuffer(), idBuffer],
            PROGRAM_ID
          );

          printLine(`[>] Consultando bloque...`);
          const recAccount: any = await program.account.dbRecord.fetch(recordPda);
          printLine(`====================================`);
          printLine(` ID:         ${recAccount.id.toString()}`);
          printLine(` Colección:  ${coleccionNombre}`);
          printLine(` Hash:       ${recAccount.contentHash}`);
          printLine(`====================================`);
          break;
        }

        case 'UPDATE': {
          const idStr = args[2];
          const newHash = args[3];
          if (!idStr || !newHash) throw new Error("Faltan parámetros (ID o Hash).");

          const idBuffer = new BN(idStr).toArrayLike(Buffer, "le", 8);
          const [recordPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("record"), collectionPda.toBuffer(), idBuffer],
            PROGRAM_ID
          );

          printLine(`[>] Sobrescribiendo memoria on-chain...`);
          const tx = await program.methods.updateRecord(newHash)
            .accounts({ 
              dbRecord: recordPda, 
              authority: wallet.publicKey 
            })
            .rpc();
          printLine(`[OK] Actualizado. TX: ${tx}`);
          break;
        }

        case 'DELETE': {
          const idStr = args[2];
          if (!idStr) throw new Error("Falta el ID.");

          const idBuffer = new BN(idStr).toArrayLike(Buffer, "le", 8);
          const [recordPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("record"), collectionPda.toBuffer(), idBuffer],
            PROGRAM_ID
          );

          printLine(`[>] Destruyendo registro ${idStr}...`);
          const tx = await program.methods.deleteRecord()
            .accounts({ 
              dbRecord: recordPda, 
              authority: wallet.publicKey 
            })
            .rpc();
          printLine(`[OK] Registro eliminado. (Renta recuperada).`);
          break;
        }

        case 'DROP': {
          printLine(`[!] INICIANDO PROTOCOLO DE DESTRUCCIÓN PARA '${coleccionNombre}'...`);
          printLine(`[>] Escaneando blockchain por registros huérfanos...`);
          
          // Buscar todos los registros asociados usando el offset de 8 bytes (discriminador de Anchor)
          const recordsHuerfanos = await program.account.dbRecord.all([
            { memcmp: { offset: 8, bytes: collectionPda.toBase58() } }
          ]);

          printLine(`[i] Se encontraron ${recordsHuerfanos.length} registros. Ejecutando limpieza en lote...`);

          // Bucle para destruir registros individuales
          for (let i = 0; i < recordsHuerfanos.length; i++) {
            const rec = recordsHuerfanos[i];
            printLine(`  -> Borrando registro: ${rec.publicKey.toBase58().substring(0,8)}...`);
            await program.methods.deleteRecord()
              .accounts({ 
                dbRecord: rec.publicKey, 
                authority: wallet.publicKey 
              })
              .rpc();
          }

          printLine(`[>] Destruyendo contenedor principal (Collection)...`);
          const tx = await program.methods.deleteCollection()
            .accounts({ 
              collection: collectionPda, 
              authority: wallet.publicKey 
            })
            .rpc();
          
          printLine(`[OK] ¡DROP DATABASE EJECUTADO CON ÉXITO!`);
          printLine(`[i] Toda la renta de SOL fue devuelta a tu wallet.`);
          break;
        }

        default:
          printLine(`[!] Comando '${comando}' no reconocido. Usa HELP.`);
      }

    } catch (err: any) {
      if (err.message.includes("Account does not exist") || err.message.includes("AccountNotInitialized")) {
        printLine("[!] Error: La cuenta no existe en la blockchain (Asegúrate de haberla creado).");
      } else if (err.message.includes("rejected")) {
        printLine("[!] Operación cancelada por el usuario.");
      } else {
        printLine(`[!] Error del Sistema: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-cyan-500 font-mono p-4 sm:p-8 flex flex-col selection:bg-cyan-900 selection:text-white">
      
      {/* Panel Superior */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-cyan-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-950 flex items-center justify-center rounded border border-cyan-800 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-cyan-50">SGBD_CLI</h1>
            <p className="text-xs text-cyan-600 uppercase tracking-widest">Decentralized Database Protocol</p>
          </div>
        </div>
        <div>
          {isMounted && <WalletMultiButton className="!bg-cyan-950 !text-cyan-400 border border-cyan-800 hover:!bg-cyan-900 !rounded !h-10 transition-colors shadow-lg" />}
        </div>
      </header>

      {/* Ventana de Terminal */}
      <main className="flex-1 bg-[#0a0a0a] rounded shadow-[0_0_30px_rgba(6,182,212,0.05)] border border-cyan-900/50 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-8 bg-cyan-950/20 border-b border-cyan-900/50 flex items-center px-4 gap-2 backdrop-blur-sm">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[11px] text-cyan-700 ml-3 tracking-widest font-semibold">bash - web3-engine</span>
        </div>
        
        <div className="flex-1 p-6 pt-12 overflow-y-auto text-sm leading-relaxed custom-scrollbar">
          {history.map((line, i) => (
            <div key={i} className={`whitespace-pre-wrap break-all ${line.startsWith('[!]') ? 'text-red-400' : line.startsWith('[OK]') ? 'text-green-400' : line.startsWith('[>]') ? 'text-blue-300' : 'text-cyan-400'}`}>
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Formulario de Entrada */}
        <form onSubmit={procesarComando} className="flex items-center px-6 py-4 bg-cyan-950/20 border-t border-cyan-900/50 backdrop-blur-sm">
          <span className="text-cyan-500 mr-3 font-bold">root@sgbd:~#</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-cyan-200 placeholder-cyan-800/70 font-mono text-base"
            placeholder="Escribe tu comando..."
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </main>
    </div>
  );
}