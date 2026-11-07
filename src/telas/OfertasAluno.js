import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";
import GradeHorarios from "../componentes/GradeHorarios";
import { matricular } from "../api";
import { validarMatricula } from "../regras";

// Tela Ofertas do aluno (UC03): a grade com botao Matricular em cada turma.
// Valida RN03-RN06 no front (alerta Bootstrap) e faz POST /matriculas.
class OfertasAluno extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = { alerta: "", tipoAlerta: "danger" };
  }

  // sempre pega o registro atual do aluno logado (dados podem ter recarregado)
  alunoAtual() {
    const { dados, usuario } = this.context;
    return dados.alunos.find((a) => a.id === usuario.id);
  }

  matricular = (turma) => {
    const { dados } = this.context;
    const aluno = this.alunoAtual();

    // validacao no front antes do fetch (RN03-RN06)
    const erro = validarMatricula({ aluno, turma, dados });
    if (erro) {
      this.setState({ alerta: erro, tipoAlerta: "danger" });
      return;
    }

    matricular(aluno.id, turma.id)
      .then(() => this.context.recarregar())
      .then(() =>
        this.setState({ alerta: "Matricula realizada na turma T" + turma.id + "!", tipoAlerta: "success" })
      )
      .catch((err) => this.setState({ alerta: err.message, tipoAlerta: "danger" }));
  };

  // o aluno ja esta matriculado nesta turma?
  jaMatriculado(turmaId) {
    const aluno = this.alunoAtual();
    return this.context.dados.matriculas.some(
      (m) => m.alunoId === aluno.id && m.turmaId === turmaId
    );
  }

  render() {
    const { dados } = this.context;
    const { alerta, tipoAlerta } = this.state;

    return (
      <div>
        <h3 className="mb-3">Grade de ofertas</h3>
        {alerta && <div className={"alert alert-" + tipoAlerta}>{alerta}</div>}

        <Card titulo="Escolha uma turma para se matricular">
          <GradeHorarios
            turmas={dados.turmas}
            disciplinas={dados.disciplinas}
            professores={dados.professores}
            matriculas={dados.matriculas}
            renderAcao={(turma) => {
              const ocupadas = dados.matriculas.filter((m) => m.turmaId === turma.id).length;
              const lotada = ocupadas >= turma.vagas;

              // renderizacao condicional do botao
              if (this.jaMatriculado(turma.id)) {
                return <span className="badge bg-success">Matriculado</span>;
              }
              return (
                <button
                  className="btn btn-sm btn-primary"
                  disabled={lotada}
                  onClick={() => this.matricular(turma)}
                >
                  {lotada ? "Lotada" : "Matricular"}
                </button>
              );
            }}
          />
        </Card>
      </div>
    );
  }
}

export default OfertasAluno;
