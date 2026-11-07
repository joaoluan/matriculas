import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";
import GradeHorarios from "../componentes/GradeHorarios";
import { cancelarMatricula } from "../api";

// Tela Minha grade (UC04): mostra so as turmas do aluno logado e um botao
// Cancelar em cada uma. Reusa o GradeHorarios (mesmo componente das ofertas).
class MinhaGrade extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = { alerta: "", tipoAlerta: "success" };
  }

  // matriculas do aluno logado + a turma de cada uma
  minhasMatriculas() {
    const { dados, usuario } = this.context;
    return dados.matriculas
      .filter((m) => m.alunoId === usuario.id)
      .map((m) => ({ matricula: m, turma: dados.turmas.find((t) => t.id === m.turmaId) }))
      .filter((x) => x.turma);
  }

  cancelar = (turma) => {
    const { dados, usuario } = this.context;
    const matricula = dados.matriculas.find(
      (m) => m.alunoId === usuario.id && m.turmaId === turma.id
    );
    if (!matricula) return;

    cancelarMatricula(matricula.id)
      .then(() => this.context.recarregar())
      .then(() =>
        this.setState({ alerta: "Matricula cancelada (turma T" + turma.id + ").", tipoAlerta: "success" })
      )
      .catch((err) => this.setState({ alerta: err.message, tipoAlerta: "danger" }));
  };

  render() {
    const { dados } = this.context;
    const { alerta, tipoAlerta } = this.state;

    const itens = this.minhasMatriculas();
    const minhasTurmas = itens.map((x) => x.turma);

    return (
      <div>
        <h3 className="mb-3">Minha grade</h3>
        {alerta && <div className={"alert alert-" + tipoAlerta}>{alerta}</div>}

        {/* renderizacao condicional: sem matriculas x grade */}
        {minhasTurmas.length === 0 ? (
          <div className="alert alert-info">
            Voce ainda nao se matriculou em nenhuma turma. Va em <strong>Ofertas</strong>.
          </div>
        ) : (
          <Card titulo="Suas turmas nesta semana">
            <GradeHorarios
              turmas={minhasTurmas}
              disciplinas={dados.disciplinas}
              professores={dados.professores}
              matriculas={dados.matriculas}
              renderAcao={(turma) => (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => this.cancelar(turma)}
                >
                  Cancelar
                </button>
              )}
            />
          </Card>
        )}
      </div>
    );
  }
}

export default MinhaGrade;
