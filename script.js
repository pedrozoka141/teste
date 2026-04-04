/**
 * JOGO DE EXPLORAÇÃO SIMPLES - JS
 * Foco: Movimentação, Colisão AABB e Interação por proximidade.
 */

// --- 1. CONFIGURAÇÕES INICIAIS ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const modal = document.getElementById("noteModal");

// Gerenciador de carregamento de imagens
let imagesLoaded = 0;
const totalImages = 4;

function checkLoad() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop(); // Só inicia o loop quando todas as texturas estiverem prontas
    }
}

// Definição das Texturas
const playerImg = new Image(); 
playerImg.src = 'assets/personagem.jpg';
playerImg.onload = checkLoad;

const wallImg = new Image(); 
wallImg.src = 'assets/tijolo.jpg';
wallImg.onload = checkLoad;

const backgroundImg = new Image(); 
backgroundImg.src = 'assets/fundo.jpg';
backgroundImg.onload = checkLoad;

const paperImg = new Image(); 
paperImg.src = 'assets/folha.jpg';
paperImg.onload = checkLoad;

// --- 2. ENTIDADES DO JOGO (OBJETOS) ---

// Jogador
const player = {
    x: 50,
    y: 50,
    size: 30,
    speed: 3,
    reading: false // Estado: impede movimento se estiver lendo
};

// Objeto Interativo (Folha de Papel)
const paperObj = {
    x: 700,
    y: 100,
    w: 25,
    h: 30
};

// Paredes (Obstáculos)
const walls = [
    { x: 150, y: 0, w: 30, h: 200 },
    { x: 150, y: 350, w: 30, h: 250 },
    { x: 450, y: 350, w: 30, h: 200 },
    { x: 150, y: 200, w: 400, h: 30 },
    { x: 40, y: 320, w: 140, h: 30 },
    { x: 230, y: 320, w: 370, h: 30 }
];

// --- 3. INPUT (CONTROLES) ---

const keys = {}; // Armazena o estado das teclas (true = pressionada)

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    // Interação: Tecla 'E'
    if (key === 'e' && isNear() && !player.reading) {
        toggleModal(true);
    }
    // Interação: Tecla 'ESC'
    if (e.key === 'Escape') {
        toggleModal(false);
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// --- 4. FUNÇÕES DE SUPORTE (UTILITÁRIOS) ---

/**
 * Verifica colisão entre dois retângulos (AABB)
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w &&
           rect1.x + player.size > rect2.x &&
           rect1.y < rect2.y + rect2.h &&
           rect1.y + player.size > rect2.y;
}

/**
 * Calcula a distância euclidiana para saber se o player está perto do objeto
 */
function isNear() {
    const dx = (player.x + player.size/2) - (paperObj.x + paperObj.w/2);
    const dy = (player.y + player.size/2) - (paperObj.y + paperObj.h/2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 65; // Raio de ativação
}

/**
 * Abre ou fecha a janela de texto
 */
function toggleModal(show) {
    player.reading = show;
    if (show) {
        modal.classList.remove("hidden");
    } else {
        modal.classList.add("hidden");
    }
}

// --- 5. LÓGICA E ATUALIZAÇÃO (UPDATE) ---

function update() {
    if (player.reading) return; // Se estiver lendo, pula a atualização de movimento

    let oldX = player.x;
    let oldY = player.y;

    // Movimento Horizontal
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;
    // Checa colisão horizontal
    for (let wall of walls) {
        if (checkCollision(player, wall)) player.x = oldX;
    }

    // Movimento Vertical
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    // Checa colisão vertical
    for (let wall of walls) {
        if (checkCollision(player, wall)) player.y = oldY;
    }

    // Limites das bordas do Canvas
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

    // Feedback visual de interface
    updateUI();
}

function updateUI() {
    if (isNear() && !player.reading) {
        statusText.innerText = "Aperte 'E' para ler a folha";
        statusText.style.color = "#f1c40f";
    } else if (!player.reading) {
        statusText.innerText = "Explore o labirinto...";
        statusText.style.color = "white";
    }
}

// --- 6. RENDERIZAÇÃO (DRAW) ---

function draw() {
    // Camada 1: Fundo
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Camada 2: Objetos Interativos
    ctx.drawImage(paperImg, paperObj.x, paperObj.y, paperObj.w, paperObj.h);

    // Camada 3: Paredes
    for (let wall of walls) {
        ctx.drawImage(wallImg, wall.x, wall.y, wall.w, wall.h);
    }

    // Camada 4: Jogador (sempre por cima)
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

// --- 7. LOOP PRINCIPAL ---

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}