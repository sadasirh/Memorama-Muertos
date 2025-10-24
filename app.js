// ==========================
// CONFIGURACIÓN DEL JUEGO
// ==========================

const cartasData = [
  "carta1.jpg",
  "carta2.jpg",
  "carta3.jpg",
  "carta4.jpg",
  "carta5.jpg",
  "carta6.jpg",
];

let cartas = [...cartasData, ...cartasData].sort(() => 0.5 - Math.random());

const tablero = document.getElementById("tablero");
const intentosTxt = document.getElementById("intentos");
const btnReiniciar = document.getElementById("reiniciar");

let cartaVolteada = null;
let bloqueo = false;
let aciertos = 0;
let intentos = 0;
let inicioTiempo = new Date(); // para medir duración

// ==========================
// CREAR CARTAS EN EL TABLERO
// ==========================

function crearTablero() {
  tablero.innerHTML = "";
  cartas.forEach((img) => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.innerHTML = `
      <div class="cara frente">
        <img src="img/${img}" alt="">
      </div>
      <div class="cara reverso">
        <img src="img/reverso.jpg" alt="">
      </div>
    `;
    carta.addEventListener("click", () => voltearCarta(carta, img));
    tablero.appendChild(carta);
  });
}

crearTablero();

// ==========================
// LÓGICA DEL MEMORAMA
// ==========================

function voltearCarta(carta, img) {
  if (bloqueo || carta.classList.contains("volteada")) return;

  carta.classList.add("volteada");

  if (!cartaVolteada) {
    cartaVolteada = { carta, img };
  } else {
    intentos++;
    intentosTxt.textContent = intentos;
    if (img === cartaVolteada.img) {
      aciertos++;
      cartaVolteada = null;
      if (aciertos === cartasData.length) {
        setTimeout(ganar, 500);
      }
    } else {
      bloqueo = true;
      setTimeout(() => {
        carta.classList.remove("volteada");
        cartaVolteada.carta.classList.remove("volteada");
        cartaVolteada = null;
        bloqueo = false;
      }, 800);
    }
  }
}

btnReiniciar.addEventListener("click", reiniciar);

function reiniciar() {
  inicioTiempo = new Date(); // reiniciamos el tiempo
  cartas = [...cartasData, ...cartasData].sort(() => 0.5 - Math.random());
  aciertos = 0;
  intentos = 0;
  intentosTxt.textContent = 0;
  crearTablero();
}

// ==========================
// GANAR Y ENVIAR PUNTAJE
// ==========================

async function ganar() {
  const nombre = prompt("🎉 ¡Ganaste! Ingresa tu nombre para guardar tu puntaje:");
  if (!nombre) return;

  const finTiempo = new Date();
  const tiempoTotalSegundos = Math.floor((finTiempo - inicioTiempo) / 1000);

  const data = {
    name: nombre,
    score: aciertos,             // número
    intentos: intentos,          // número
    tiempo: tiempoTotalSegundos  // número, se enviará como texto en FormData
  };

  await enviarPuntuacion(data);

  alert(`Puntaje guardado ✅\nIntentos: ${intentos}\nTiempo: ${tiempoTotalSegundos} seg`);
  reiniciar();
}

// ==========================
// CONEXIÓN CON GOOGLE SHEETS
// ==========================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDUSM7k3jQtk7XiMkndZD80bubewy_-L1P2Wd5NXwBVJ9BvLKu2FSEd07rgv_BkAiNpg/exec";

async function enviarPuntuacion(data) {
  try {
    // Enviamos como FormData para que Apps Script reciba correctamente todos los campos
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("score", data.score);
    formData.append("intentos", data.intentos);
    formData.append("tiempo", data.tiempo);

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData
    });
  } catch (err) {
    console.error("Error al enviar puntaje:", err);
  }
}
