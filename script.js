const STORAGE_KEY = 'blocoNotas:conteudo';
const THEME_KEY = 'blocoNotas:tema';
const GAME_STORAGE_KEY = 'dinoHighScore';
const SAVE_DELAY = 400;
const GROUND_Y = 160;
const JUMP_VELOCITY = -14;
const GRAVITY = 0.8;

let saveTimer = null;
let gameState = {
    running: false,
    gameOver: false,
    lastFrame: 0,
    score: 0,
    scoreFloat: 0,
    highScore: 0,
    speed: 6,
    spawnTimer: 0,
    dino: { x: 60, y: GROUND_Y, vy: 0, width: 42, height: 42, jumping: false },
    obstacles: []
};

window.addEventListener('DOMContentLoaded', () => {
    const bloco = document.getElementById('blocoDeNotas');
    const status = document.getElementById('status');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const themeBtn = document.getElementById('temaBtn');
    const limparBtn = document.getElementById('limparBtn');
    const exportarBtn = document.getElementById('exportarBtn');
    const exportarHtmlBtn = document.getElementById('exportarHtmlBtn');
    const startGameBtn = document.getElementById('startGameBtn');
    const resetGameBtn = document.getElementById('resetGameBtn');
    const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
    const panels = Array.from(document.querySelectorAll('.panel'));

    const mostraStatus = mensagem => {
        if (status) {
            status.textContent = mensagem;
        }
    };

    const salvarNota = () => {
        if (!bloco) {
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, bloco.value);
            mostraStatus('Salvo automaticamente');
        } catch (error) {
            console.error('Erro ao salvar a nota:', error);
            mostraStatus('Não foi possível salvar a nota');
        }
    };

    const agendarSalvamento = () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(salvarNota, SAVE_DELAY);
    };

    const limparNota = () => {
        if (!bloco) {
            return;
        }
        bloco.value = '';
        salvarNota();
        mostraStatus('Conteúdo removido');
        bloco.focus();
    };

    const escapeHtml = valor => valor
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const downloadArquivo = (nome, conteudo, tipo) => {
        const blob = new Blob([conteudo], { type: tipo });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const exportarComoTexto = () => {
        if (!bloco) {
            return;
        }
        downloadArquivo('bloco-de-notas.txt', bloco.value, 'text/plain;charset=utf-8');
        mostraStatus('Arquivo .txt exportado');
    };

    const exportarComoHTML = () => {
        if (!bloco) {
            return;
        }
        const conteudo = bloco.value;
        const html = `<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Bloco de Notas Exportado</title>\n  <style>body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#f8fafc;padding:24px;line-height:1.6}pre{white-space:pre-wrap;word-break:break-word;background:#111827;padding:24px;border-radius:16px;box-shadow:0 16px 40px rgba(15,23,42,.4);}</style>\n</head>\n<body>\n  <h1>Bloco de Notas Exportado</h1>\n  <pre>${escapeHtml(conteudo)}</pre>\n</body>\n</html>`;
        downloadArquivo('bloco-de-notas.html', html, 'text/html;charset=utf-8');
        mostraStatus('Arquivo .html exportado');
    };

    const mudarPainel = nome => {
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.panel === nome);
            button.setAttribute('aria-selected', button.dataset.panel === nome ? 'true' : 'false');
        });
        panels.forEach(panel => {
            const ativo = panel.id === nome;
            panel.classList.toggle('active', ativo);
            panel.setAttribute('aria-hidden', ativo ? 'false' : 'true');
        });
    };

    const aplicarTema = tema => {
        document.body.classList.toggle('theme-light', tema === 'light');
        document.body.classList.toggle('theme-dark', tema !== 'light');
        if (themeBtn) {
            themeBtn.textContent = tema === 'light' ? 'Tema Escuro' : 'Tema Claro';
        }
    };

    const carregarTema = () => {
        const temaSalvo = localStorage.getItem(THEME_KEY) || 'dark';
        aplicarTema(temaSalvo);
    };

    const alternarTema = () => {
        const atual = document.body.classList.contains('theme-light') ? 'light' : 'dark';
        const proximo = atual === 'light' ? 'dark' : 'light';
        localStorage.setItem(THEME_KEY, proximo);
        aplicarTema(proximo);
    };

    const carregarNota = () => {
        if (!bloco) {
            return;
        }
        try {
            const valor = localStorage.getItem(STORAGE_KEY);
            if (valor !== null) {
                bloco.value = valor;
                mostraStatus('Conteúdo carregado');
                return;
            }
        } catch (error) {
            console.error('Erro ao carregar a nota:', error);
            mostraStatus('Falha ao carregar notas do navegador');
            return;
        }
        mostraStatus('Comece a digitar e sua nota será salva automaticamente');
    };

    const carregarHighScore = () => {
        const salvo = Number(localStorage.getItem(GAME_STORAGE_KEY) || '0');
        gameState.highScore = isNaN(salvo) ? 0 : salvo;
        if (highScoreEl) {
            highScoreEl.textContent = String(gameState.highScore);
        }
    };

    const atualizarPlacar = () => {
        if (scoreEl) {
            scoreEl.textContent = String(gameState.score);
        }
        if (highScoreEl) {
            highScoreEl.textContent = String(gameState.highScore);
        }
    };

    const criarObstaculo = () => ({
        x: canvas.width + 20,
        y: GROUND_Y + 10,
        width: 18 + Math.random() * 18,
        height: 24 + Math.random() * 24
    });

    const colisao = obstaculo => {
        const dino = gameState.dino;
        return (
            dino.x < obstaculo.x + obstaculo.width &&
            dino.x + dino.width > obstaculo.x &&
            dino.y < obstaculo.y + obstaculo.height &&
            dino.y + dino.height > obstaculo.y
        );
    };

    const finalizarJogo = () => {
        gameState.running = false;
        gameState.gameOver = true;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
        }
        localStorage.setItem(GAME_STORAGE_KEY, String(gameState.highScore));
        atualizarPlacar();
        mostraStatus('Game over! Pressione Reiniciar.');
    };

    const desenharJogo = () => {
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, GROUND_Y + 52, width, 10);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(gameState.dino.x, gameState.dino.y, gameState.dino.width, gameState.dino.height);
        gameState.obstacles.forEach(obstaculo => {
            ctx.fillStyle = '#8b5cf6';
            ctx.fillRect(obstaculo.x, obstaculo.y, obstaculo.width, obstaculo.height);
        });
        ctx.font = '600 16px Inter, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(`Score: ${gameState.score}`, 16, 26);
    };

    const resetarJogo = () => {
        gameState.running = false;
        gameState.gameOver = false;
        gameState.score = 0;
        gameState.scoreFloat = 0;
        gameState.speed = 6;
        gameState.spawnTimer = 0;
        gameState.dino.y = GROUND_Y;
        gameState.dino.vy = 0;
        gameState.dino.jumping = false;
        gameState.obstacles = [];
        atualizarPlacar();
        desenharJogo();
    };

    const iniciarJogo = () => {
        if (gameState.running && !gameState.gameOver) {
            return;
        }
        if (gameState.gameOver) {
            resetarJogo();
        }
        gameState.running = true;
        gameState.lastFrame = performance.now();
        requestAnimationFrame(loopJogo);
    };

    const pularDino = () => {
        if (!gameState.running || gameState.gameOver) {
            return;
        }
        if (!gameState.dino.jumping) {
            gameState.dino.vy = JUMP_VELOCITY;
            gameState.dino.jumping = true;
        }
    };

    const atualizarJogo = delta => {
        const dino = gameState.dino;
        dino.vy += GRAVITY * delta;
        dino.y += dino.vy * delta;
        if (dino.y >= GROUND_Y) {
            dino.y = GROUND_Y;
            dino.vy = 0;
            dino.jumping = false;
        }
        gameState.obstacles.forEach(obstaculo => {
            obstaculo.x -= gameState.speed * delta;
        });
        gameState.obstacles = gameState.obstacles.filter(obstaculo => obstaculo.x + obstaculo.width > 0);
        gameState.spawnTimer -= delta;
        if (gameState.spawnTimer <= 0) {
            gameState.obstacles.push(criarObstaculo());
            gameState.spawnTimer = 100 + Math.random() * 120;
        }
        gameState.speed += 0.0008 * delta;
        gameState.scoreFloat += delta * 0.45;
        gameState.score = Math.floor(gameState.scoreFloat);
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
        }
        if (gameState.obstacles.some(colisao)) {
            finalizarJogo();
        }
    };

    const loopJogo = timestamp => {
        if (!gameState.running) {
            return;
        }
        const delta = Math.min((timestamp - gameState.lastFrame) / 16, 3);
        gameState.lastFrame = timestamp;
        atualizarJogo(delta);
        desenharJogo();
        atualizarPlacar();
        if (gameState.running) {
            requestAnimationFrame(loopJogo);
        }
    };

    const listenerTeclado = event => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();
            if (!gameState.running) {
                iniciarJogo();
            }
            pularDino();
        }
    };

    const carregarDados = () => {
        carregarNota();
        carregarTema();
        carregarHighScore();
        resetarJogo();
    };

    if (bloco) {
        bloco.addEventListener('input', agendarSalvamento);
    }
    tabButtons.forEach(button => {
        button.addEventListener('click', () => mudarPainel(button.dataset.panel));
    });
    if (limparBtn) {
        limparBtn.addEventListener('click', limparNota);
    }
    if (exportarBtn) {
        exportarBtn.addEventListener('click', exportarComoTexto);
    }
    if (exportarHtmlBtn) {
        exportarHtmlBtn.addEventListener('click', exportarComoHTML);
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', alternarTema);
    }
    if (startGameBtn) {
        startGameBtn.addEventListener('click', iniciarJogo);
    }
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', () => {
            resetarJogo();
            mostraStatus('Jogo reiniciado. Pressione Começar.');
        });
    }
    window.addEventListener('keydown', listenerTeclado);
    window.addEventListener('resize', desenharJogo);
    carregarDados();
});
