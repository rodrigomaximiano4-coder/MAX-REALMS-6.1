# Fronteira de Ferro: A Fuga

Jogo web em estilo Endless Runner 3D, com identidade original e narrativa de fuga transcontinental. O projeto usa HTML5, CSS3, JavaScript puro e Three.js via CDN para funcionar em GitHub Pages sem Node.js nem build step.

## Visão geral

- Nome: Fronteira de Ferro: A Fuga
- Tema: guerra, deslocamento, sobrevivência e travessia de fronteiras em ruínas
- Estrutura: um único arquivo `index.html` + `dados.json`
- Deploy: GitHub Pages estático
- Controles: teclado e toque em mobile
- Áudio: Web Audio API

## Estrutura do projeto

```text
.
├── index.html
├── dados.json
├── README.md
```

## Como executar

### Opção 1 - abrir diretamente
Basta abrir o arquivo `index.html` no navegador.

### Opção 2 - servidor local
Para testar o carregamento do `dados.json` em ambiente mais próximo do GitHub Pages, execute:

```bash
python3 -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000/
```

## GitHub Pages

1. Faça push do repositório para GitHub.
2. Abra as configurações do repositório.
3. Vá em "Pages".
4. Em "Build and deployment", selecione:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/root`
5. Salve.
6. A URL pública será algo como:

```text
https://<seu-usuario>.github.io/<nome-do-repositorio>/
```

## Arquivo de dados

O arquivo `dados.json` carrega as configurações do jogo via `fetch`:

- biomas e progressão visual
- multiplicadores de velocidade
- tipos de obstáculos e coletáveis
- itens da loja de suprimentos
- valores padrão de fallback

Se o arquivo falhar, demorar ou não estiver disponível, o jogo usa valores internos seguros para continuar funcionando sem travar.

## Controles

### Teclado
- Setas ou WASD: mudar de faixa
- Espaço / ↑ / W: pular
- ↓ / S: agachar/slide

### Touch
- Botões na tela para esquerda, centro, direita, pular e agachar.

## Mecânicas principais

- 3 faixas horizontais
- Pulo com física de gravidade
- Slide para evitar obstáculos altos
- Obstáculos temáticos de guerra e destruição
- Coletáveis de pontos (suprimentos, ouro, energia)
- Dificuldade progressiva por distância
- Sistema de vidas, pontuação e distância
- Mudança dinâmica visual entre biomas

## Observações técnicas

- Three.js carregado via CDN (`https://cdn.jsdelivr.net/...`)
- Áudio procedural via Web Audio API
- Sem dependência de arquivos externos `.mp3` ou `.wav`
- Código em JavaScript puro, compatível com GitHub Pages

## Nota de autoria

A proposta foi desenhada para ser original, com identidade visual e narrativa próprias, sem reutilizar ativos, mecânicas ou elementos diretamente inspirados em franquias existentes.
