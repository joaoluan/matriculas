// ============================================================
//  api.js  -  Todas as chamadas ao back-end com fetch + .then()
//  O front (porta 3000) conversa com o Express (porta 3001).
//  Só GET e POST, como nos exemplos. POST envia JSON.stringify.
// ============================================================

// Em producao (deploy), defina REACT_APP_API_URL com a URL do back-end.
// Em desenvolvimento, cai no localhost:3001 automaticamente.
function montarBase() {
  const url = process.env.REACT_APP_API_URL;
  if (!url) return "http://localhost:3001";
  return url.startsWith("http") ? url : "https://" + url;
}
const BASE = montarBase();

// trata a resposta: se o back devolveu erro (status 400 + { erro }),
// rejeita a Promise com a mensagem para a tela mostrar no alerta.
function tratar(resposta) {
  return resposta.json().then((corpo) => {
    if (!resposta.ok) {
      throw new Error(corpo.erro || "Erro inesperado no servidor.");
    }
    return corpo;
  });
}

function post(rota, corpo) {
  return fetch(BASE + rota, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  }).then(tratar);
}

// GET /dados  -> devolve tudo (cada tela filtra o que precisa)
export function buscarDados() {
  return fetch(BASE + "/dados").then(tratar);
}

// Disciplinas (UC01)
export function salvarDisciplina(disciplina) {
  return post("/disciplinas", disciplina);
}
export function excluirDisciplina(id) {
  return post("/disciplinas/excluir", { id });
}

// Professores (UC05 extra)
export function salvarProfessor(professor) {
  return post("/professores", professor);
}

// Turmas (UC02)
export function ofertarTurma(turma) {
  return post("/turmas", turma);
}
export function excluirTurma(id) {
  return post("/turmas/excluir", { id });
}

// Matriculas (UC03 / UC04)
export function matricular(alunoId, turmaId) {
  return post("/matriculas", { alunoId, turmaId });
}
export function cancelarMatricula(id) {
  return post("/matriculas/cancelar", { id });
}
