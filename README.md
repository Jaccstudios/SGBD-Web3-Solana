# 💾 SGBD Web3 - Motor de Almacenamiento Descentralizado

<div align="center">
  
![Solana](https://img.shields.io/badge/Solana-362D59?style=for-the-badge&logo=solana&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Este proyecto es un Producto Mínimo Viable (MVP) de un **Sistema Gestor de Bases de Datos (SGBD) Descentralizado**, construido nativamente sobre la blockchain de Solana para el **WayLearn Latam Hackathon**.
</div>

## 🎥 Demostración del Proyecto (Technical Walkthrough)

[![SGBD Web3 - Demo](https://img.youtube.com/vi/bJQedeN5sG4/maxresdefault.jpg)](https://youtu.be/bJQedeN5sG4)

> 💡 **Nota:** Haz clic en la imagen superior para ver el recorrido técnico completo, la demostración en vivo de la terminal CLI inyectando datos y la auditoría on-chain a través de Solscan.

## 📌 Acerca del Proyecto (Categoría: Blue Sky)

### ¿Qué es?
Es un motor de base de datos NoSQL híbrido basado en blockchain. A diferencia de un SGBD tradicional (como MongoDB o PostgreSQL) que guarda los datos en un servidor centralizado, este motor utiliza la red de Solana como una capa de indexación y control de acceso ultra-segura.

### ¿Qué hace?
Resuelve el problema del alto costo de almacenamiento on-chain. Mediante una arquitectura híbrida, los datos pesados (archivos/JSON) viven fuera de la cadena (IPFS/Arweave), mientras que el Smart Contract en Solana guarda un identificador único (`content_hash`). El sistema valida la firma del usuario y gestiona el Control de Acceso Basado en Roles (RBAC).

### ¿Para qué sirve?
Garantiza la **inmutabilidad, transparencia y alta disponibilidad** de la información crítica. La regla de oro del contrato establece que solo el dueño original (autoridad de la colección) puede insertar registros, previniendo alteraciones por terceros.

---

## 🚀 Casos de Uso

Gracias a su arquitectura, este SGBD es ideal para guardar "el estado crítico" de aplicaciones donde la confianza es absoluta:
1. **Sistemas ERP y CRM:** Trazabilidad inmutable de acciones.
2. **Registro Académico:** Guardar calificaciones o constancias verificables públicamente sin riesgo de falsificación.
3. **DeSci (Ciencia Descentralizada):** Indexación de papers de investigación donde la autoría debe ser irrefutable.
4. **Almacenamiento de metadatos NFT/Gaming:** Gestión de atributos dinámicos de forma segura.

---

## ⚙️ Arquitectura Técnica y Seguridad

El sistema utiliza **PDAs (Program Derived Addresses)** para crear un modelo orientado a documentos sin riesgo de colisiones en la memoria:

* **Collections (Colecciones):** Se derivan usando la semilla `collection`, la *wallet* del creador y el nombre de la BD. Llevan un contador interno seguro (`record_count`).
* **DbRecords (Registros):** Se derivan usando la colección madre y el ID numérico del registro. La macro de Anchor `has_one = authority` blinda el contrato, asegurando que nadie ajeno a la colección pueda inyectar datos basura.

---

## 📂 Estructura del Proyecto (Monorepo)

```text
SGBD-Web3-Solana/
├── mi-sgbd-back/                 # 🦀 BACKEND: Contrato Inteligente (Rust/Anchor)
│   ├── programs/sgbd-web3/src/   
│   │   └── lib.rs                # Lógica central: Collections y DbRecords.
│   ├── client/
│   │   └── client.ts             # Cliente TS con el flujo de inyección de datos.
│   └── Anchor.toml               # Configuración de redes y llaves.
│
└── mi-sgbd-front/                # ⚛️ FRONTEND: Interfaz de Usuario Web3 (Next.js)
    ├── src/app/                  # Vistas y componentes UI.
    └── src/idl.json              # Interface Description Language para conectar con Rust.
```

---

## 🛠️ Ejecución y Pruebas

**1. Clonar el repositorio:**
```bash
git clone [https://github.com/Jaccstudios/SGBD-Web3-Solana.git](https://github.com/Jaccstudios/SGBD-Web3-Solana.git)
cd SGBD-Web3-Solana
```

**2. Probar el motor On-Chain (Cliente TS):**
El Smart Contract está desplegado en la red de pruebas de Solana (Devnet) bajo el ID: `HFZem2x9kmBtxNmAxHWb6MigiHjGEKV8maGYsMtgiSm9`.
Para ejecutar una inserción de prueba:
```bash
cd mi-sgbd-back
yarn install
npx ts-node client/client.ts
```

**3. Frontend (Next.js):**
```bash
cd ../mi-sgbd-front
npm install
npm run dev
```
*Abre `http://localhost:3000`. Requiere Phantom Wallet en modo Devnet.*

---

## 🗺️ Roadmap (Hoja de Ruta)
* **[ ] Soporte JSON Complejo Nativo:** Expandir la serialización directa de bytes.
* **[ ] Función "Close Account":** Implementar el borrado de colecciones liberando la renta (SOL) al usuario.
* **[ ] SDK Oficial:** Empaquetar el cliente en un módulo de `npm`.

---

## 📄 Licencia y Autoría

Distribuido bajo la Licencia MIT.
✒️ **Desarrollado por:** Julio Arturo Córdova Cú - Ingeniería en Sistemas Computacionales.
