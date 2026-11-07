// ============================================================
//  regras.js  -  Validacoes das regras de negocio no FRONT
//  (rodam antes do fetch; o Express valida de novo por seguranca)
//
//  RN01 - Professor nao tem duas turmas no mesmo horario
//  RN02 - Professor nao passa da cargaMaxima
//  RN03 - Aluno so se matricula se cursou todos os pre-requisitos
//  RN04 - Aluno nao tem duas turmas no mesmo horario
//  RN05 - Nao ha matricula em turma lotada
//  RN06 - Aluno nao se matricula duas vezes na mesma disciplina
//  RN07 - Horario valido: dia 2-7 e turno 1-3
//
//  Cada funcao devolve null quando esta OK, ou uma string com o
//  motivo do bloqueio (que a tela mostra num alerta Bootstrap).
// ============================================================

// RN07 - horario valido
export function validarHorario(horario) {
  if (typeof horario !== "string" || horario.length !== 2) {
    return "Horario invalido (RN07): informe 2 digitos, ex.: 21.";
  }
  const dia = horario[0];
  const turno = horario[1];
  const diaOk = dia >= "2" && dia <= "7";
  const turnoOk = turno >= "1" && turno <= "3";
  if (!diaOk || !turnoOk) {
    return "Horario invalido (RN07): dia deve ser 2-7 e turno 1-3.";
  }
  return null;
}

// Validacoes da oferta de turma (UC02): RN01, RN02, RN07
export function validarOfertaTurma({ professorId, horario, professores, turmas }) {
  const erroHorario = validarHorario(horario);
  if (erroHorario) return erroHorario;

  const pId = Number(professorId);
  const professor = professores.find((p) => p.id === pId);
  if (!professor) return "Selecione um professor.";

  // RN01
  const conflito = turmas.some((t) => t.professorId === pId && t.horario === horario);
  if (conflito) {
    return "Conflito de horario (RN01): o professor ja da aula nesse horario.";
  }

  // RN02
  const carga = turmas.filter((t) => t.professorId === pId).length;
  if (carga >= professor.cargaMaxima) {
    return "Carga excedida (RN02): o professor ja atingiu a carga maxima.";
  }

  return null;
}

// Validacoes da matricula (UC03): RN03, RN04, RN05, RN06
export function validarMatricula({ aluno, turma, dados }) {
  const disciplina = dados.disciplinas.find((d) => d.id === turma.disciplinaId);

  // RN03 - pre-requisitos
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
    return "Falta pre-requisito: " + nomes;
  }

  // turmas atuais do aluno
  const minhasTurmas = dados.matriculas
    .filter((m) => m.alunoId === aluno.id)
    .map((m) => dados.turmas.find((t) => t.id === m.turmaId))
    .filter(Boolean);

  // RN06 - mesma disciplina
  if (minhasTurmas.some((t) => t.disciplinaId === turma.disciplinaId)) {
    return "Voce ja esta matriculado nessa disciplina (RN06).";
  }

  // RN04 - conflito de horario
  const conflito = minhasTurmas.find((t) => t.horario === turma.horario);
  if (conflito) {
    return "Conflito com a turma " + conflito.id;
  }

  // RN05 - turma lotada
  const ocupadas = dados.matriculas.filter((m) => m.turmaId === turma.id).length;
  if (ocupadas >= turma.vagas) {
    return "Turma lotada";
  }

  return null;
}

// Sugestao de professor com MENOR carga (apoio da RN02)
export function professorDeMenorCarga(professores, turmas) {
  if (!professores.length) return null;
  const comCarga = professores.map((p) => ({
    professor: p,
    carga: turmas.filter((t) => t.professorId === p.id).length,
    folga: p.cargaMaxima - turmas.filter((t) => t.professorId === p.id).length,
  }));
  // prioriza quem ainda tem folga e tem menos turmas
  comCarga.sort((a, b) => {
    if (b.folga !== a.folga) return b.folga - a.folga;
    return a.carga - b.carga;
  });
  return comCarga[0].professor;
}
