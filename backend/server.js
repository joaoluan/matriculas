// ============================================================
//  server.js  -  Back-end do Sistema de Matriculas
//  Node + Express + cors. So usa GET e POST (como nos exemplos).
//  Le e grava tudo em dados.json com fs (readFileSync/writeFileSync).
//  Em caso de erro de regra: status 400 + { erro: "mensagem" }.
// ============================================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
// Em deploy (Render), a porta vem de process.env.PORT. Local usa 3001.
const PORTA = process.env.PORT || 3001;
const ARQUIVO = path.join(__dirname, "dados.json");

app.use(cors());
app.use(express.json());

// ---------- Helpers de leitura/gravacao (fs) ----------
function lerDados() {
  const texto = fs.readFileSync(ARQUIVO, "utf8");
  return JSON.parse(texto);
}

function gravarDados(dados) {
  fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2), "utf8");
}

function proximoId(lista) {
  // gera o proximo id com base no maior id existente
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
}

// ============================================================
//  REGRAS DE NEGOCIO (validadas aqui no Express tambem)
//  RN01 - Professor nao tem duas turmas no mesmo horario
//  RN02 - Professor nao passa da cargaMaxima
//  RN03 - Aluno so se matricula se cursou todos os pre-requisitos
//  RN04 - Aluno nao tem duas turmas no mesmo horario
//  RN05 - Nao ha matricula em turma lotada
//  RN06 - Aluno nao se matricula duas vezes na mesma disciplina
//  RN07 - Horario valido: dia 2-7 e turno 1-3
// ============================================================

// RN07 - horario valido (ex.: "21" = terca de manha)
function horarioValido(horario) {
  if (typeof horario !== "string" || horario.length !== 2) return false;
  const dia = horario[0];
  const turno = horario[1];
  return dia >= "2" && dia <= "7" && turno >= "1" && turno <= "3";
}

// ============================================================
//  ROTA GET /dados  -  devolve tudo
// ============================================================
app.get("/dados", (req, res) => {
  try {
    res.json(lerDados());
  } catch (e) {
    res.status(400).json({ erro: "Nao foi possivel ler os dados." });
  }
});

// ============================================================
//  DISCIPLINAS  -  UC01 Manter disciplinas
// ============================================================

// POST /disciplinas  -> cria ou edita (se vier id)
app.post("/disciplinas", (req, res) => {
  try {
    const dados = lerDados();
    const { id, codigo, nome, creditos, preRequisitos } = req.body;

    if (!codigo || !nome) {
      return res.status(400).json({ erro: "Codigo e nome sao obrigatorios." });
    }

    const corpo = {
      codigo: String(codigo).trim(),
      nome: String(nome).trim(),
      creditos: Number(creditos) || 0,
      preRequisitos: Array.isArray(preRequisitos) ? preRequisitos.map(Number) : [],
    };

    if (id) {
      // edicao
      const alvo = dados.disciplinas.find((d) => d.id === Number(id));
      if (!alvo) return res.status(400).json({ erro: "Disciplina nao encontrada." });
      Object.assign(alvo, corpo);
    } else {
      // criacao
      corpo.id = proximoId(dados.disciplinas);
      dados.disciplinas.push(corpo);
    }

    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao salvar disciplina." });
  }
});

// POST /disciplinas/excluir  -> exclui se nao houver turma usando
app.post("/disciplinas/excluir", (req, res) => {
  try {
    const dados = lerDados();
    const { id } = req.body;
    const idNum = Number(id);

    const emUso = dados.turmas.some((t) => t.disciplinaId === idNum);
    if (emUso) {
      return res.status(400).json({ erro: "Nao da para excluir: existe turma usando esta disciplina." });
    }

    dados.disciplinas = dados.disciplinas.filter((d) => d.id !== idNum);
    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao excluir disciplina." });
  }
});

// ============================================================
//  PROFESSORES  -  UC05 Manter professores (extra)
// ============================================================

// POST /professores  -> cria professor
app.post("/professores", (req, res) => {
  try {
    const dados = lerDados();
    const { nome, email, cargaMaxima } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: "Nome e email sao obrigatorios." });
    }

    const novo = {
      id: proximoId(dados.professores),
      nome: String(nome).trim(),
      email: String(email).trim(),
      cargaMaxima: Number(cargaMaxima) || 1,
    };
    dados.professores.push(novo);
    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao salvar professor." });
  }
});

// ============================================================
//  TURMAS  -  UC02 Ofertar turma  (valida RN01, RN02, RN07)
// ============================================================

// POST /turmas  -> valida RN01, RN02, RN07 e cria
app.post("/turmas", (req, res) => {
  try {
    const dados = lerDados();
    const { disciplinaId, professorId, horario, vagas, semestre } = req.body;

    const dId = Number(disciplinaId);
    const pId = Number(professorId);

    // RN07 - horario valido
    if (!horarioValido(horario)) {
      return res.status(400).json({ erro: "Horario invalido (RN07): use dia 2-7 e turno 1-3." });
    }

    const professor = dados.professores.find((p) => p.id === pId);
    if (!professor) return res.status(400).json({ erro: "Professor nao encontrado." });

    const disciplina = dados.disciplinas.find((d) => d.id === dId);
    if (!disciplina) return res.status(400).json({ erro: "Disciplina nao encontrada." });

    // RN01 - professor nao tem duas turmas no mesmo horario
    const conflitoHorario = dados.turmas.some(
      (t) => t.professorId === pId && t.horario === horario
    );
    if (conflitoHorario) {
      return res.status(400).json({ erro: "Conflito de horario (RN01): o professor ja da aula nesse horario." });
    }

    // RN02 - professor nao passa da cargaMaxima (nº de turmas)
    const cargaAtual = dados.turmas.filter((t) => t.professorId === pId).length;
    if (cargaAtual >= professor.cargaMaxima) {
      return res.status(400).json({ erro: "Carga excedida (RN02): o professor ja atingiu a carga maxima." });
    }

    const nova = {
      id: proximoId(dados.turmas),
      disciplinaId: dId,
      professorId: pId,
      horario: String(horario),
      vagas: Number(vagas) || 0,
      semestre: semestre ? String(semestre) : "2026.2",
    };
    dados.turmas.push(nova);
    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao ofertar turma." });
  }
});

// POST /turmas/excluir  -> exclui se nao houver matriculados
app.post("/turmas/excluir", (req, res) => {
  try {
    const dados = lerDados();
    const { id } = req.body;
    const idNum = Number(id);

    const temMatriculados = dados.matriculas.some((m) => m.turmaId === idNum);
    if (temMatriculados) {
      return res.status(400).json({ erro: "Nao da para excluir: a turma tem alunos matriculados." });
    }

    dados.turmas = dados.turmas.filter((t) => t.id !== idNum);
    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao excluir turma." });
  }
});

// ============================================================
//  MATRICULAS  -  UC03 Realizar matricula  (valida RN03-RN06)
// ============================================================

// POST /matriculas  -> valida RN03, RN04, RN05, RN06 e cria
app.post("/matriculas", (req, res) => {
  try {
    const dados = lerDados();
    const { alunoId, turmaId } = req.body;

    const aId = Number(alunoId);
    const tId = Number(turmaId);

    const aluno = dados.alunos.find((a) => a.id === aId);
    if (!aluno) return res.status(400).json({ erro: "Aluno nao encontrado." });

    const turma = dados.turmas.find((t) => t.id === tId);
    if (!turma) return res.status(400).json({ erro: "Turma nao encontrada." });

    const disciplina = dados.disciplinas.find((d) => d.id === turma.disciplinaId);

    // RN03 - aluno so se matricula se cursou todos os pre-requisitos
    const faltando = (disciplina.preRequisitos || []).filter(
      (pr) => !(aluno.cursadas || []).includes(pr)
    );
    if (faltando.length > 0) {
      const nomes = faltando
        .map((pr) => {
          const d = dados.disciplinas.find((x) => x.id === pr);
          return d ? d.nome : "disciplina " + pr;
        })
        .join(", ");
      return res.status(400).json({ erro: "Falta pre-requisito: " + nomes });
    }

    // matriculas atuais do aluno (para RN04 e RN06)
    const minhasMatriculas = dados.matriculas.filter((m) => m.alunoId === aId);
    const minhasTurmas = minhasMatriculas
      .map((m) => dados.turmas.find((t) => t.id === m.turmaId))
      .filter(Boolean);

    // RN06 - aluno nao se matricula duas vezes na mesma disciplina
    const jaTemDisciplina = minhasTurmas.some((t) => t.disciplinaId === turma.disciplinaId);
    if (jaTemDisciplina) {
      return res.status(400).json({ erro: "Voce ja esta matriculado nessa disciplina (RN06)." });
    }

    // RN04 - aluno nao tem duas turmas no mesmo horario
    const conflito = minhasTurmas.find((t) => t.horario === turma.horario);
    if (conflito) {
      return res.status(400).json({ erro: "Conflito com a turma " + conflito.id });
    }

    // RN05 - nao ha matricula em turma lotada
    const ocupadas = dados.matriculas.filter((m) => m.turmaId === tId).length;
    if (ocupadas >= turma.vagas) {
      return res.status(400).json({ erro: "Turma lotada" });
    }

    const nova = {
      id: proximoId(dados.matriculas),
      alunoId: aId,
      turmaId: tId,
      data: new Date().toISOString().slice(0, 10),
    };
    dados.matriculas.push(nova);
    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao realizar matricula." });
  }
});

// POST /matriculas/cancelar  -> remove a matricula  (UC04)
app.post("/matriculas/cancelar", (req, res) => {
  try {
    const dados = lerDados();
    const { id } = req.body;
    const idNum = Number(id);

    dados.matriculas = dados.matriculas.filter((m) => m.id !== idNum);
    gravarDados(dados);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: "Erro ao cancelar matricula." });
  }
});

// ============================================================
app.listen(PORTA, () => {
  console.log("Back-end do Sistema de Matriculas rodando em http://localhost:" + PORTA);
});
