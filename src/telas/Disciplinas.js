import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";
import { salvarDisciplina, excluirDisciplina } from "../api";

// Tela Disciplinas (UC01 - Manter disciplinas): lista + cadastro/edicao/exclusao.
// Formulario controlado com select multiplo de pre-requisitos.
class Disciplinas extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = this.formVazio();
  }

  formVazio() {
    return {
      id: null,
      codigo: "",
      nome: "",
      creditos: "",
      preRequisitos: [],
      alerta: "",
      tipoAlerta: "danger",
    };
  }

  mudar = (campo) => (e) => {
    this.setState({ [campo]: e.target.value });
  };

  // select multiplo: pega todas as opcoes selecionadas
  mudarPreRequisitos = (e) => {
    const ids = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
    this.setState({ preRequisitos: ids });
  };

  editar = (disciplina) => {
    this.setState({
      id: disciplina.id,
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      creditos: disciplina.creditos,
      preRequisitos: disciplina.preRequisitos || [],
      alerta: "",
    });
  };

  salvar = (e) => {
    e.preventDefault();
    const { codigo, nome, creditos, preRequisitos, id } = this.state;

    if (!codigo.trim() || !nome.trim()) {
      this.setState({ alerta: "Preencha codigo e nome.", tipoAlerta: "danger" });
      return;
    }

    salvarDisciplina({ id, codigo, nome, creditos, preRequisitos })
      .then(() => this.context.recarregar())
      .then(() => this.setState({ ...this.formVazio(), alerta: "Disciplina salva!", tipoAlerta: "success" }))
      .catch((erro) => this.setState({ alerta: erro.message, tipoAlerta: "danger" }));
  };

  excluir = (id) => {
    if (!window.confirm("Excluir esta disciplina?")) return;
    excluirDisciplina(id)
      .then(() => this.context.recarregar())
      .then(() => this.setState({ alerta: "Disciplina excluida.", tipoAlerta: "success" }))
      .catch((erro) => this.setState({ alerta: erro.message, tipoAlerta: "danger" }));
  };

  nomePreReqs(ids) {
    const { dados } = this.context;
    if (!ids || ids.length === 0) return "-";
    return ids
      .map((id) => {
        const d = dados.disciplinas.find((x) => x.id === id);
        return d ? d.codigo : "?";
      })
      .join(", ");
  }

  render() {
    const { dados } = this.context;
    const { id, codigo, nome, creditos, preRequisitos, alerta, tipoAlerta } = this.state;

    return (
      <div className="row">
        <div className="col-lg-7">
          <Card titulo="Disciplinas cadastradas">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nome</th>
                  <th>Cred.</th>
                  <th>Pre-requisitos</th>
                  <th style={{ width: "140px" }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {dados.disciplinas.map((d) => (
                  <tr key={d.id}>
                    <td>{d.codigo}</td>
                    <td>{d.nome}</td>
                    <td>{d.creditos}</td>
                    <td>{this.nomePreReqs(d.preRequisitos)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => this.editar(d)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => this.excluir(d.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {dados.disciplinas.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-muted">Nenhuma disciplina.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="col-lg-5">
          <Card titulo={id ? "Editar disciplina" : "Nova disciplina"}>
            {alerta && <div className={"alert alert-" + tipoAlerta}>{alerta}</div>}
            <form onSubmit={this.salvar}>
              <div className="mb-3">
                <label className="form-label">Codigo</label>
                <input className="form-control" value={codigo} onChange={this.mudar("codigo")} />
              </div>
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input className="form-control" value={nome} onChange={this.mudar("nome")} />
              </div>
              <div className="mb-3">
                <label className="form-label">Creditos</label>
                <input
                  type="number"
                  className="form-control"
                  value={creditos}
                  onChange={this.mudar("creditos")}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Pre-requisitos (segure Ctrl para marcar varios)</label>
                <select
                  multiple
                  className="form-select"
                  value={preRequisitos.map(String)}
                  onChange={this.mudarPreRequisitos}
                >
                  {dados.disciplinas
                    .filter((d) => d.id !== id) // nao pode ser pre-req de si mesma
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.codigo} - {d.nome}
                      </option>
                    ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary me-2">
                {id ? "Salvar edicao" : "Cadastrar"}
              </button>
              {id && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => this.setState(this.formVazio())}
                >
                  Cancelar
                </button>
              )}
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

export default Disciplinas;
