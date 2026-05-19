# Bloco & Dino

Um projeto Web simples com duas funcionalidades integradas:

- **Bloco de notas** com salvamento automático usando `localStorage`.
- **Jogo do dinossauro** em canvas, com pontuação e melhor recorde.

## Recursos

- Anotações são salvas automaticamente enquanto o usuário digita.
- Limpeza de texto e exportação para `.txt` ou `.html`.
- Alternância entre tema claro e tema escuro.
- Jogo com controle por tecla `Espaço` ou `Seta para cima`.
- Placar ativo e melhor pontuação armazenada no navegador.

## Estrutura do projeto

- `index.html` - página principal com a interface do bloco de notas e do jogo.
- `style.css` - estilos para a aparência do app, responsivo e com temas.
- `script.js` - lógica do bloco de notas, jogo, temas e navegação entre abas.
- `README.md` - informações do projeto.

## Uso

1. Abra `index.html` no navegador.
2. No painel "Bloco de Notas":
   - Digite suas anotações.
   - Use "Limpar" para apagar tudo.
   - Use "Exportar .txt" ou "Exportar .html" para baixar o conteúdo.
3. No painel "Jogo do Dinossauro":
   - Clique em "Começar" para iniciar.
   - Pressione `Espaço` ou `Seta para cima` para pular.
   - Clique em "Reiniciar" para começar de novo.

## Observações

- A melhor pontuação é salva automaticamente no `localStorage`.
- O tema escolhido também é lembrado entre visitas.
- O jogo se torna progressivamente mais rápido ao longo da partida.
