import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";

// Tela Detalhe da turma (UC06): recebe a turma por props e mostra
// os dados + a lista de alunos matriculados (renderizacao condicional).
class DetalheTurma extends Component {
  static contextType = AppContext;

  render() {
    const { dados, irPara } = this.context;
    const { turma } = this.props;

    if (!turma) {
      return (
        <div className="alert alert-warning">
          Nenhuma turma selecionada.{" "}
          <button className="btn btn-sm btn-link" onClick={() => irPara("ofertar")}>
            Voltar
          </button>
        </div>
      );
    }

    const disciplina = dados.disciplinas.find((d) => d.id === turma.disciplinaId);
    const professor = dados.professores.find((p) => p.id === turma.professorId);

    // alunos matriculados nessa turma
    const matriculados = dados.matriculas
      .filter((m) => m.turmaId === turma.id)
      .map((m) => ({
        matricula: m,
        aluno: dados.alunos.find((a) => a.id === m.alunoId),
      }))
      .filter((x) => x.aluno);

    return (
      <div>
        <button className="btn btn-link mb-2" onClick={() => irPara("ofertar")}>
          &larr; Voltar para ofertas
        </button>

        <Card titulo={"Turma T" + turma.id}>
          <dl className="row mb-0">
            <dt className="col-sm-3">Disciplina</dt>
            <dd className="col-sm-9">{disciplina ? disciplina.nome : "-"}</dd>
            <dt className="col-sm-3">Professor</dt>
            <dd className="col-sm-9">{professor ? professor.nome : "-"}</dd>
            <dt className="col-sm-3">Horario</dt>
            <dd className="col-sm-9">{turma.horario}</dd>
            <dt className="col-sm-3">Vagas</dt>
            <dd className="col-sm-9">
              {matriculados.length} ocupadas de {turma.vagas}
            </dd>
          </dl>
        </Card>

        <Card titulo="Alunos matriculados">
          {/* renderizacao condicional: lista vazia x tabela */}
          {matriculados.length === 0 ? (
            <p className="text-muted mb-0">Nenhum aluno matriculado ainda.</p>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Matricula</th>
                  <th>Nome</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {matriculados.map((x) => (
                  <tr key={x.matricula.id}>
                    <td>{x.aluno.matricula}</td>
                    <td>{x.aluno.nome}</td>
                    <td>{x.matricula.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    );
  }
}

export default DetalheTurma;
