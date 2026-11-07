# Como colocar o Sistema de Matriculas no ar (Render.com - gratis)

O back-end continua IGUAL ao da entrega (Express + `fs` gravando em `dados.json`).
Nada de banco de dados. Usamos o Render porque ele roda um processo Node de verdade.

> O GitHub aqui e so o MEIO de publicar (o Render puxa o codigo de um repo).
> A ENTREGA do desafio continua sendo o .zip + o video, nao o link do GitHub.

---

## Passo 1 - Subir o codigo para um repositorio no GitHub

Na pasta do projeto (a raiz, onde estao `package.json` e a pasta `backend/`):

```bash
git init
git add .
git commit -m "Sistema de Matriculas"
git branch -M main
```

Crie um repositorio novo e VAZIO em https://github.com/new (ex.: `matriculas`),
depois conecte e envie:

```bash
git remote add origin https://github.com/SEU_USUARIO/matriculas.git
git push -u origin main
```

---

## Passo 2 - Publicar no Render com 1 clique (Blueprint)

1. Crie uma conta gratis em https://render.com (pode entrar com o GitHub).
2. No painel, clique em **New +** -> **Blueprint**.
3. Conecte o repositorio `matriculas` que voce acabou de subir.
4. O Render le o arquivo `render.yaml` e ja monta os 2 servicos:
   - `matriculas-backend`  (o Express)
   - `matriculas-frontend` (o React)
5. Clique em **Apply**. Espere o build terminar (uns minutos).

Pronto: o Render te da 2 links, por exemplo:
- Back-end:  `https://matriculas-backend.onrender.com`
- Front-end: `https://matriculas-frontend.onrender.com`  <- este e o que voce abre

O front ja aponta pro back automaticamente (variavel `REACT_APP_API_URL`).

---

## Dica importante para o video

No plano **free**, o back-end "dorme" apos ~15 min parado e demora ~50s para
acordar na primeira chamada. Antes de gravar, abra o link do back-end
(`.../dados`) uma vez para acorda-lo; depois grave normalmente.

---

## Alternativa manual (se preferir nao usar o Blueprint)

Crie dois servicos separados no Render apontando para o mesmo repo:

**Back-end** -> New + -> Web Service
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`

**Front-end** -> New + -> Static Site
- Root Directory: `.`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Environment Variable: `REACT_APP_API_URL` = a URL do back-end (ex.:
  `https://matriculas-backend.onrender.com`)

---

## Alternativa: Railway (https://railway.app)

Mesma ideia: um servico para `backend/` (start `node server.js`) e outro para o
front (build `npm run build`, servir a pasta `build/`). Defina `REACT_APP_API_URL`
no front com a URL publica do back.
