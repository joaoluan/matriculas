import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";
import GradeHorarios from "../componentes/GradeHorarios";
import { ofertarTurma, excluirTurma } from "../api";
import { validarOfertaTurma, professorDeMenorCarga } from "../regras";

// Tela Ofertar turma (UC02): escolhe disciplina, professor, dia, turno e vagas.
// Valida RN01/RN02/RN07 no front (alerta Bootstrap) e salva via POST.
// Mostra as turmas ja ofertadas na GradeHorarios (reuso de componente).
class OfertarTurma extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      disciplinaId: "",
      professorId: "",
      dia: "2", // 2=Seg ... 7=Sab
      turno: "1", // 1=Manha, 2=Tarde, 3=Noite
      vagas: "30",
      alerta: "",
      tipoAlerta: "danger",
    };
  }

  mudar = (campo) => (e) => this.setState({ [campo]: e.target.value });

  // sugere o professor de menor carga (apoio da RN02)
  sugerirProfessor = () => {
    const { dados } = this.context;
    const sugestao = professorDeMenorCarga(dados.professores, dados.turmas);
    if (sugestao) {
      this.setState({
        professorId: String(sugestao.id),
        alerta: "Sugerido o professor de menor carga: " + sugestao.nome,
        tipoAlerta: "info",
      });
    }
  };

  ofertar = (e) => {
    e.preventDefault();
    const { dados } = this.context;
    const { disciplinaId, professorId, dia, turno, vagas } = this.state;

    if (!disciplinaId || !professorId) {
      this.setState({ alerta: "Escolha disciplina e professor.", tipoAlerta: "danger" });
      return;
    }

    const horario = dia + turno;

    // validacao no front antes do fetch (RN01, RN02, RN07)
    const erro = validarOfertaTurma({
      professorId,
      horario,
      professores: dados.professores,
      turmas: dados.turmas,
    });
    if (erro) {
      this.setState({ alerta: erro, tipoAlerta: "danger" });
      return;
    }

    ofertarTurma({ disciplinaId, professorId, horario, vagas })
      .then(() => this.context.recarregar())
      .then(() =>
        this.setState({ alerta: "Turma ofertada com sucesso!", tipoAlerta: "success" })
      )
      .catch((err) => this.setState({ alerta: err.message, tipoAlerta: "danger" }));
  };

  excluir = (turma) => {
    if (!window.confirm("Excluir a turma T" + turma.id + "?")) return;
    excluirTurma(turma.id)
      .then(() => this.context.recarregar())
      .then(() => this.setState({ alerta: "Turma excluida.", tipoAlerta: "success" }))
      .catch((err) => this.setState({ alerta: err.message, tipoAlerta: "danger" }));
  };

  render() {
    const { dados } = this.context;
    const { disciplinaId, professorId, dia, turno, vagas, alerta, tipoAlerta } = this.state;

    return (
      <div className="row">
        <div className="col-lg-5">
          <Card titulo="Ofertar turma">
            {alerta && <div className={"alert alert-" + tipoAlerta}>{alerta}</div>}
            <form onSubmit={this.ofertar}>
              <div className="mb-3">
                <label className="form-label">Disciplina</label>
                <select
                  className="form-select"
                  value={disciplinaId}
                  onChange={this.mudar("disciplinaId")}
                >
                  <option value="">Selecione...</option>
                  {dados.disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.codigo} - {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Professor</label>
                <div className="input-group">
                  <select
                    className="form-select"
                    value={professorId}
                    onChange={this.mudar("professorId")}
                  >
                    <option value="">Selecione...</option>
                    {dados.professores.map((p) => {
                      const carga = dados.turmas.filter((t) => t.professorId === p.id).length;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.nome} ({carga}/{p.cargaMaxima})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={this.sugerirProfessor}
                  >
                    Sugerir
                  </button>
                </div>
              </div>

              <div className="row">
                <div className="col mb-3">
                  <label className="form-label">Dia</label>
                  <select className="form-select" value={dia} onChange={this.mudar("dia")}>
                    <option value="2">Seg</option>
                    <option value="3">Ter</option>
                    <option value="4">Qua</option>
                    <option value="5">Qui</option>
                    <option value="6">Sex</option>
                    <option value="7">Sab</option>
                  </select>
                </div>
                <div className="col mb-3">
                  <label className="form-label">Turno</label>
                  <select className="form-select" value={turno} onChange={this.mudar("turno")}>
                    <option value="1">Manha</option>
                    <option value="2">Tarde</option>
                    <option value="3">Noite</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Vagas</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={vagas}
                  onChange={this.mudar("vagas")}
                />
              </div>

              <div className="text-muted small mb-3">
                Codigo do horario: <strong>{dia + turno}</strong> (1º digito = dia, 2º = turno)
              </div>

              <button type="submit" className="btn btn-primary">
                Ofertar
              </button>
            </form>
          </Card>
        </div>

        <div className="col-lg-7">
          <Card titulo="Grade de ofertas (dias x turnos)">
            <GradeHorarios
              turmas={dados.turmas}
              disciplinas={dados.disciplinas}
              professores={dados.professores}
              matriculas={dados.matriculas}
              renderAcao={(turma) => (
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    onClick={() => this.context.irPara("detalheTurma", turma)}
                  >
                    Detalhe
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => this.excluir(turma)}
                  >
                    Excluir
                  </button>
                </div>
              )}
            />
          </Card>
        </div>
      </div>
    );
  }
}

export default OfertarTurma;
