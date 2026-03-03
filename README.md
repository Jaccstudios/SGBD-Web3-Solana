# 💾 SGBD Web3 - Motor de Almacenamiento Descentralizado

<div align="center">
<p>
  <img height="50x" src="https://images.seeklogo.com/logo-png/42/2/solana-sol-logo-png_seeklogo-423095.png" />
  <img height="50x" src="https://rust-lang.org/logos/rust-logo-512x512.png" />
  <img height="50x" src="https://www.aldeka.net/_app/immutable/assets/cuddlyferris.661f297b.png" />
  <img height="50x" src="https://pbs.twimg.com/media/FVUVaO9XEAAulvK?format=png&name=small" />
  <img height="50x" src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/nextjs-icon.png" />
  <img height="50x" src="https://images.icon-icons.com/2415/PNG/512/typescript_plain_logo_icon_146316.png" />
  <img height="50x" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1280px-Node.js_logo.svg.png" />
  <img height="50x" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/3840px-React-icon.svg.png" />
  <img height="50x" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/CSS3_logo.svg/960px-CSS3_logo.svg.png" />
  <img height="50x" src="https://uxwing.com/wp-content/themes/uxwing/download/file-and-folder-type/file-json-color-green-icon.png" />
  <img height="50x" src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png" />
  <img height="50x" src="https://tumornet.telsip.uniwa.gr/images/github.jpg" />
  <img height="50x" src="https://ih1.redbubble.net/image.5755729574.8108/st,small,507x507-pad,600x600,f8f8f8.jpg" />
</p>

Este proyecto es un Producto Mínimo Viable (MVP) de un **Sistema Gestor de Bases de Datos (SGBD) Descentralizado**, construido nativamente sobre la blockchain de Solana. Permite a los usuarios realizar operaciones de escritura inmutables utilizando la arquitectura clave-valor.
</div>

## 📌 Acerca del Proyecto

### ¿Qué es?
Es una base de datos SQL o NoSQL basada en blockchain. A diferencia de un SGBD tradicional (como MySQL, PostgreSQL MongoDB o Cassandra) que guarda los datos en un servidor centralizado (AWS, Azure o un servidor local), este motor guarda la información de forma distribuida en los nodos de la red de Solana.

### ¿Qué hace?
Permite realizar operaciones de inyección de datos (Create/Update) de forma criptográficamente segura. A través de un Smart Contract programado en Rust, el sistema valida la firma del usuario, reserva un espacio en la memoria (RAM) de la blockchain y guarda un registro que contiene un propietario, una clave primaria y un valor.

### ¿Para qué sirve?
Sirve para garantizar la **inmutabilidad, transparencia y alta disponibilidad** de la información crítica. Los datos guardados aquí no pueden ser borrados ni alterados por terceros; la regla de oro del contrato establece que solo el dueño original (quien posee la llave privada) puede modificar su registro. 

### ¿Quién lo puede utilizar?
Cualquier desarrollador, ingeniero o empresa que necesite un almacenamiento a prueba de manipulaciones para datos críticos. Al ser una herramienta multipropósito, no está limitada a una sola industria.

---

## 🚀 ¿Qué se puede hacer con esta herramienta? (Casos de Uso)

Gracias a su arquitectura de Program Derived Addresses (PDAs), este SGBD es ideal para guardar "el estado crítico" de aplicaciones donde la confianza es absoluta:

1. **Transacciones Bancarias y Financieras:** Necesitan estricta consistencia y fiabilidad (ACID).
2. **Sistemas ERP y CRM:** Donde los datos son altamente estructurados y relacionales.
3. **Aplicaciones de Inventario y Comercio Electrónico:** Cuando la consistencia del stock es crítica.
4. **Registro Académico:** Guardar calificaciones o constancias universitarias que puedan ser verificadas públicamente sin riesgo de falsificación.
5. **Consultas Complejas:**  Ideal para analizar relaciones entre múltiples tablas.
6. **Big Data y análisis en tiempo real:** Manejo de grandes volúmenes de datos no estructurados.
7. **Gestión de contenidos y catálogos:** Flexibilidad de esquema para documentos JSON o XML.
8. **Redes sociales y grafos:** Almacenar relaciones complejas como amigos o sugerencias.
9. **Aplicaciones IoT y telemetría:**  Escritura rápida y alta velocidad (familia de columnas).
10. **Almacenamiento de sesión/caché:** Acceso rápido clave-valor

---

## ⚙️ ¿Cómo funciona? (Arquitectura)

El sistema utiliza **PDAs (Program Derived Addresses)**. En lugar de generar cuentas aleatorias para guardar la información, el contrato genera una dirección única y determinista basada en la "Semilla" de la palabra registro, la "Wallet" del usuario y la "Clave" del dato. Esto actúa como un índice perfecto, permitiendo consultas instantáneas (O(1)) sin necesidad de escanear toda la base de datos.

---

## 📂 Estructura del Proyecto

A continuación, se detalla la anatomía del proyecto y la función de cada archivo clave:

### 1. El Backend (Smart Contract en Rust)
* **`smart_contract/lib.rs`**: Es el "motor" real del SGBD. Contiene la lógica del negocio que vive en la blockchain. Define las instrucciones (`insertar_registro`), valida las firmas de seguridad e instruye a Solana sobre cuánta memoria reservar para cada dato.
* **`smart_contract/anchor.test.ts`**: Script de pruebas automatizadas (Mocha/Chai) que simula interacciones directas con el contrato inteligente para verificar la integridad de la memoria antes de lanzar a producción.

### 2. El Frontend (Interfaz de Usuario en React/Next.js)
* **`src/app/page.tsx`**: Es el panel de control gráfico (DApp). Se encarga de capturar la entrada del usuario, solicitar la firma a través de la Phantom Wallet y enviar la transacción RPC a la red de Solana. Incluye un sistema dinámico multilingüe (ES, EN, PT).
* **`src/idl.json`**: El *Interface Description Language*. Es el "diccionario traductor" fundamental. Le explica al código de JavaScript/TypeScript qué forma tiene el contrato de Rust.

---

## 🛠️ Instalación y Uso Local

Para levantar la interfaz gráfica en tu propia computadora:

**1. Clonar el repositorio:**
```bash
git clone [https://github.com/Jaccstudios/SGBD-Web3-Solana.git](https://github.com/Jaccstudios/SGBD-Web3-Solana.git)
cd sgbd-web3-solana

```

**2. Instalar dependencias:**

```bash
npm install

```

*(Nota: Asegúrate de tener instalado `@coral-xyz/anchor` en su versión 0.29.0).*

**3. Ejecutar el servidor de desarrollo:**

```bash
npm run dev

```

Abre `http://localhost:3000` en tu navegador. Necesitarás la extensión **Phantom Wallet** configurada en la red `Devnet` con algo de saldo (SOL de prueba).

---

## 🔑 Program ID (Devnet)

El Smart Contract está desplegado públicamente en la red de pruebas de Solana bajo la siguiente dirección:
`HFZem2x9kmBtxNmAxHWb6MigiHjGEKV8maGYsMtgiSm9`

---

## 🗺️ Roadmap (Hoja de Ruta)

Este proyecto está en evolución. Las siguientes características están planeadas para futuras versiones:

* **[ ] Función "Read All":** Implementar lógica para recuperar todos los registros (PDAs) asociados a una misma billetera.
* **[ ] Soporte JSON Complejo:** Expandir el modelo de datos para permitir la serialización y almacenamiento de estructuras JSON complejas, no solo *strings*.
* **[ ] Panel de Control Visual (Dashboard):** Desarrollar una vista interactiva de tabla en el frontend para gestionar visualmente los registros (Edición/Eliminación directa).
* **[ ] SDK Oficial:** Empaquetar el cliente de conexión en un paquete de `npm` para facilitar su integración en otras aplicaciones de terceros.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar este SGBD, sigue estos pasos:

1. Haz un *Fork* del proyecto.
2. Crea tu rama de características (`git checkout -b feature/NuevaCaracteristica`).
3. Haz *Commit* a tus cambios (`git commit -m 'Añade una Nueva Caracteristica'`).
4. Haz *Push* a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un *Pull Request*.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Siéntete libre de utilizar y modificar este proyecto para tus propios desarrollos en Web3.

---

✒️ **Desarrollado por:** Julio Arturo Córdova Cú - Ingeniería en Sistemas Computacionales.
