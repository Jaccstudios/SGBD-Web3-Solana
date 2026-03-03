'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Idl } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Importamos el archivo JSON de traducción (IDL)
import idl from '../idl.json';

// --- CONFIGURACIÓN DE TU SMART CONTRACT ---
const PROGRAM_ID = new PublicKey("HFZem2x9kmBtxNmAxHWb6MigiHjGEKV8maGYsMtgiSm9");

// --- DICCIONARIO DE IDIOMAS Y EJEMPLOS DINÁMICOS ---
const traducciones = {
  es: {
    title: "SGBD_WEB3",
    subtitle: "Motor de Almacenamiento Descentralizado Multipropósito",
    insert: "INSERTAR REGISTRO",
    keyLabel: "Clave Primaria (Key)",
    valLabel: "Valor (Value)",
    btn: "EJECUTAR QUERY",
    logsHeader: "logs de transacción",
    logsWaiting: "Esperando instrucciones...",
    errWallet: "Error: Conecta tu wallet primero usando el botón superior.",
    errEmpty: "Error: La clave y el valor no pueden estar vacíos.",
    initTx: "Iniciando transacción criptográfica hacia Devnet...",
    success: "¡Éxito! Registro inyectado en la blockchain de Solana.\nFirma (Hash): ",
    examples: [
      { k: "producto_pos_001", v: "Sistema de Punto de Venta" },
      { k: "os_smart_tv", v: "Tizen / WebOS" },
      { k: "materia_universidad", v: "Ecuaciones Diferenciales" },
      { k: "pasatiempo_fin_semana", v: "Pesca deportiva" },
      { k: "inventario_cables", v: "150 unidades" },
      { k: "cliente_empresa", v: "Tech Solutions S.A." },
      { k: "estado_servidor", v: "Activo (Uptime 99.9%)" }
    ]
  },
  en: {
    title: "DBMS_WEB3",
    subtitle: "Multi-purpose Decentralized Storage Engine",
    insert: "INSERT RECORD",
    keyLabel: "Primary Key",
    valLabel: "Value",
    btn: "EXECUTE QUERY",
    logsHeader: "transaction logs",
    logsWaiting: "Waiting for instructions...",
    errWallet: "Error: Please connect your wallet first using the top button.",
    errEmpty: "Error: Key and value cannot be empty.",
    initTx: "Initiating cryptographic transaction to Devnet...",
    success: "Success! Record injected into the Solana blockchain.\nSignature (Hash): ",
    examples: [
      { k: "pos_product_001", v: "Point of Sale System" },
      { k: "smart_tv_os", v: "Tizen / WebOS" },
      { k: "university_subject", v: "Differential Equations" },
      { k: "weekend_hobby", v: "Sport Fishing" },
      { k: "cable_inventory", v: "150 units" },
      { k: "enterprise_client", v: "Tech Solutions Inc." },
      { k: "server_status", v: "Active (Uptime 99.9%)" }
    ]
  },
  pt: {
    title: "SGBD_WEB3",
    subtitle: "Motor de Armazenamento Descentralizado Multiuso",
    insert: "INSERIR REGISTRO",
    keyLabel: "Chave Primária (Key)",
    valLabel: "Valor (Value)",
    btn: "EXECUTAR QUERY",
    logsHeader: "logs de transação",
    logsWaiting: "Aguardando instruções...",
    errWallet: "Erro: Conecte sua carteira primeiro usando o botão superior.",
    errEmpty: "Erro: A chave e o valor não podem estar vazios.",
    initTx: "Iniciando transação criptográfica para Devnet...",
    success: "Sucesso! Registro injetado na blockchain da Solana.\nAssinatura (Hash): ",
    examples: [
      { k: "produto_pos_001", v: "Sistema de Ponto de Venda" },
      { k: "os_smart_tv", v: "Tizen / WebOS" },
      { k: "materia_universidade", v: "Equações Diferenciais" },
      { k: "hobby_fim_de_semana", v: "Pesca esportiva" },
      { k: "inventario_cabos", v: "150 unidades" },
      { k: "cliente_empresa", v: "Tech Solutions Ltda." },
      { k: "status_servidor", v: "Ativo (Uptime 99.9%)" }
    ]
  }
};

type Lang = 'es' | 'en' | 'pt';

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  
  const [lang, setLang] = useState<Lang>('es');
  const t = traducciones[lang];

  const [clave, setClave] = useState('');
  const [valor, setValor] = useState('');
  const [logs, setLogs] = useState(t.logsWaiting);

  const [isMounted, setIsMounted] = useState(false);
  const [ejemploIndex, setEjemploIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const intervalo = setInterval(() => {
      setEjemploIndex((prev) => (prev + 1) % t.examples.length);
    }, 2500);
    return () => clearInterval(intervalo);
  }, [lang, t.examples.length]);

  const guardarRegistro = async () => {
    if (!wallet) {
      setLogs(t.errWallet);
      return;
    }
    if (!clave || !valor) {
      setLogs(t.errEmpty);
      return;
    }

    try {
      setLogs(t.initTx);
      const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
      
      // Al usar Anchor 0.29, la inicialización es limpia y directa
      const program = new Program(idl as Idl, PROGRAM_ID, provider);

      const [registroPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("registro"), wallet.publicKey.toBuffer(), Buffer.from(clave)],
        PROGRAM_ID
      );

      const tx = await program.methods
        .insertarRegistro(clave, valor)
        .accounts({
          registro: registroPDA,
          usuario: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setLogs(`${t.success}${tx}`);
    } catch (error: any) {
      console.error(error);
      setLogs(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono flex flex-col items-center p-10 transition-colors duration-300">
      
      <header className="w-full max-w-3xl flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-wider transition-colors">{t.title}</h1>
          <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-200 dark:bg-gray-800 rounded overflow-hidden border border-gray-300 dark:border-gray-700 transition-colors">
            <button onClick={() => setLang('es')} className={`px-2 py-1 text-xs font-bold ${lang === 'es' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>ES</button>
            <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs font-bold ${lang === 'en' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>EN</button>
            <button onClick={() => setLang('pt')} className={`px-2 py-1 text-xs font-bold ${lang === 'pt' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>PT</button>
          </div>
          {isMounted && <WalletMultiButton className="!bg-emerald-600 hover:!bg-emerald-500 transition-colors rounded-none" />}
        </div>
      </header>

      <main className="w-full max-w-3xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-xl p-8 rounded-sm transition-colors duration-300">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-emerald-500">_</span> {t.insert}
        </h2>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2 font-semibold">{t.keyLabel}</label>
            <input 
              type="text" 
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-600 p-3 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all rounded-sm placeholder-gray-400 dark:placeholder-gray-600"
              placeholder={`ej. ${t.examples[ejemploIndex]?.k || 'clave'}`}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2 font-semibold">{t.valLabel}</label>
            <input 
              type="text" 
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-600 p-3 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all rounded-sm placeholder-gray-400 dark:placeholder-gray-600"
              placeholder={`ej. ${t.examples[ejemploIndex]?.v || 'valor'}`}
            />
          </div>

          <button 
            onClick={guardarRegistro}
            className="mt-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:text-white font-bold py-3 px-4 transition-all w-48 rounded-sm"
          >
            {t.btn}
          </button>
        </div>

        <div className="mt-10 bg-gray-100 dark:bg-black p-4 border border-gray-300 dark:border-gray-800 min-h-[120px] rounded-sm transition-colors">
          <p className="text-gray-500 text-xs mb-2 font-semibold">root@sgbd:~# {t.logsHeader}</p>
          <pre className="text-sm text-emerald-600 dark:text-emerald-500 whitespace-pre-wrap break-all">{logs}</pre>
        </div>
      </main>
    </div>
  );
}