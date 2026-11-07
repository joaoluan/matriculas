import React, { Component } from "react";

// GradeHorarios: recebe "turmas" por props e desenha uma tabela
// Bootstrap com os turnos nas linhas (Manha, Tarde, Noite) e os dias
// nas colunas (Seg-Sab). Reutilizada em 3 telas (Ofertar, Ofertas, Minha grade).
//
// props:
//   turmas       -> lista de turmas a exibir
//   disciplinas  -> para mostrar o nome da disciplina
//   professores  -> para mostrar o nome do professor
//   matriculas   -> para calcular vagas restantes
//   renderAcao   -> funcao (turma) => JSX; mostra o botao certo
//                   (Matricular / Cancelar) ou nada

const DIAS = [
  { cod: "2", nome: "Seg" },
  { cod: "3", nome: "Ter" },
  { cod: "4", nome: "Qua" },
  { cod: "5", nome: "Qui" },
  { cod: "6", nome: "Sex" },
  { cod: "7", nome: "Sab" },
];

const TURNOS = [
  { cod: "1", nome: "Manha" },
  { cod: "2", nome: "Tarde" },
  { cod: "3", nome: "Noite" },
];

class GradeHorarios extends Component {
  // monta o conteudo de uma celula (dia x turno)
  celula(diaCod, turnoCod) {
    const { turmas, disciplinas, professores, matriculas, renderAcao } = this.props;
    const horario = diaCod + turnoCod;

    const aqui = turmas.filter((t) => t.horario === horario);
    if (aqui.length === 0) {
      return <span className="text-muted">-</span>;
    }

    // .map() com key: desenha cada turma da celula
    return aqui.map((turma) => {
      const disciplina = disciplinas.find((d) => d.id === turma.disciplinaId);
      const professor = professores.find((p) => p.id === turma.professorId);
      const ocupadas = (matriculas || []).filter((m) => m.turmaId === turma.id).length;
      const restantes = turma.vagas - ocupadas;

      return (
        <div key={turma.id} className="border rounded p-2 mb-2 bg-white">
          <div className="fw-semibold">
            {disciplina ? disciplina.nome : "Disciplina"}{" "}
            <span className="badge bg-secondary">T{turma.id}</span>
          </div>
          <div className="small text-muted">
            {professor ? professor.nome : "Professor"}
          </div>
          <div className="small">
            Vagas: {restantes}/{turma.vagas}
          </div>
          {renderAcao && <div className="mt-2">{renderAcao(turma)}</div>}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "90px" }}>Turno</th>
              {DIAS.map((d) => (
                <th key={d.cod}>{d.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TURNOS.map((turno) => (
              <tr key={turno.cod}>
                <th className="table-light">{turno.nome}</th>
                {DIAS.map((dia) => (
                  <td key={dia.cod}>{this.celula(dia.cod, turno.cod)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default GradeHorarios;
