# Knightapp
App do jogo knight (PWA, mesa digital do flip-and-write KNIGHT).

O app fica na pasta `knight-app/`. Instruções de publicação: `knight-app/LEIA-ME.txt`.

## Depois de alterar qualquer arquivo do app

```
python3 tools/build-sw.py
```

Isso atualiza a lista de arquivos e a versão do service worker (`knight-app/sw.js`),
para que os aparelhos baixem só os arquivos que mudaram.

## Gerar o zip para o Netlify

```
zip -r knight-app.zip knight-app
```
