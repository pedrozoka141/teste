// 1. ESTADO GLOBAL
let mochila = [];
let salaAtual = "corredor";

// 2. O MAPA DO JOGO
const salas = {
    "corredor": {
        fundo: "assets/corredor.jpg",
        texto: "O corredor parece infinito.",
        conexoes: [
            { direcao: "esquerda", destino: "quarto1", rotulo: "Quarto 1" },
            { direcao: "direita", destino: "quarto2", rotulo: "Quarto 2" },
            { direcao: "frente", destino: "corredor2", rotulo: "Seguir em frente" }
        ]
    },
    "corredor2": {
        fundo: "assets/corredor2.jpg",
        texto: "Uma porta de metal trancada bloqueia o caminho.",
        precisaItem: "chave_principal", // Só passa se tiver a chave do Nenê
        msgErro: "A porta de saída está trancada. Talvez alguém tenha a chave.",
        conexoes: [
            { direcao: "voltar", destino: "corredor", rotulo: "Voltar" },
            { direcao: "frente", destino: "vitoria", rotulo: "USAR CHAVE E SAIR" }
        ]
    },
    "quarto1": {
        fundo: "assets/quarto1.jpg",
        texto: "Você encontrou o estoque de suprimentos.",
        objetos: [
            { id: "monster", nome: "Monster Mango", top: "65%", left: "40%", img: "assets/monster.png" }
        ],
        conexoes: [{ direcao: "voltar", destino: "corredor", rotulo: "Voltar" }]
    },
    "quarto2": {
        fundo: "assets/quarto2.jpg",
        texto: "Nenê parece estar com muita sede.",
        npc: {
            nome: "Nenê",
            img: "assets/nene.webp",
            falaPadrao: "O Vasco nos prendeu aqui... não consigo pensar direito com sede.",
            falaAgradecido: "Aí sim! Me sinto um Gigante! Toma aqui a chave da saída.",
            itemDesejado: "monster",
            recompensa: "chave_principal"
        },
        conexoes: [{ direcao: "voltar", destino: "corredor", rotulo: "Voltar" }]
    },
    "vitoria": {
        fundo: "assets/vitoria.jpg",
        texto: "VOCÊ ESCAPOU! LEVEL 1 CONCLUÍDO.",
        conexoes: [] // Fim de jogo
    }
};

function carregarSala(nomeDaSala) {
    const sala = salas[nomeDaSala];
    const caixaTexto = document.getElementById("caixa-texto");

    // Bloqueio de porta
    if (sala.precisaItem && !mochila.includes(sala.precisaItem)) {
        caixaTexto.innerText = sala.msgErro;
        return; 
    }

    salaAtual = nomeDaSala;
    caixaTexto.innerText = "";
    const cenario = document.getElementById("cenario");
    const controles = document.getElementById("controles");

    cenario.innerHTML = "";
    cenario.style.backgroundImage = `url('${sala.fundo}')`;
    controles.innerHTML = `<h3>${sala.texto}</h3>`;

    // CRIAR NPC
    if (sala.npc) {
        const imgNpc = document.createElement("img");
        imgNpc.src = sala.npc.img;
        imgNpc.classList.add("personagem");
        cenario.appendChild(imgNpc);

        const btnFala = document.createElement("button");
        btnFala.innerText = `Falar com ${sala.npc.nome}`;
        btnFala.classList.add("botao-fala");
        
        btnFala.onclick = () => {
            // Lógica de Troca: Se o jogador tem o Monster
            if (mochila.includes(sala.npc.itemDesejado)) {
                caixaTexto.innerText = `${sala.npc.nome}: "${sala.npc.falaAgradecido}"`;
                
                // Remove o Monster e dá a Chave se ele ainda não tiver a chave
                if (!mochila.includes(sala.npc.recompensa)) {
                    removerDoInventario(sala.npc.itemDesejado);
                    mochila.push(sala.npc.recompensa);
                    atualizarVisualInventario();
                }
            } else {
                caixaTexto.innerText = `${sala.npc.nome}: "${sala.npc.falaPadrao}"`;
            }
        };
        controles.appendChild(btnFala);
    }

    // CRIAR OBJETOS
    if (sala.objetos) {
        sala.objetos.forEach(obj => {
            if (!mochila.includes(obj.id)) {
                const img = document.createElement("img");
                img.src = obj.img;
                img.classList.add("objeto-interativo");
                img.style.top = obj.top;
                img.style.left = obj.left;
                img.style.width = "40px";
                img.onclick = () => coletarItem(obj);
                cenario.appendChild(img);
            }
        });
    }

    // CRIAR SETAS
    sala.conexoes.forEach(conexao => {
        const btn = document.createElement("button");
        btn.innerText = conexao.rotulo;
        btn.classList.add("seta", `seta-${conexao.direcao}`);
        btn.onclick = () => carregarSala(conexao.destino);
        controles.appendChild(btn);
    });
}

function coletarItem(obj) {
    mochila.push(obj.id);
    document.getElementById("caixa-texto").innerText = `Você pegou: ${obj.nome}!`;
    atualizarVisualInventario();
    carregarSala(salaAtual); 
}

function removerDoInventario(idItem) {
    mochila = mochila.filter(id => id !== idItem);
    atualizarVisualInventario();
}

function atualizarVisualInventario() {
    const lista = document.getElementById("lista-itens");
    lista.innerHTML = "";
    mochila.forEach(itemId => {
        const slot = document.createElement("div");
        slot.classList.add("item-slot");
        slot.innerText = itemId.replace("_", " ").toUpperCase();
        lista.appendChild(slot);
    });
}

carregarSala("corredor");