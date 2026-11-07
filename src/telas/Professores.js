import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";
import { salvarProfessor } from "../api";

// Tela Professores (UC05): lista com carga atual/maxima (calculo derivado do state) + cadastro.
class Professores extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      nome: "",
      email: "",
      cargaMaxima: "",
      alerta: "",
      tipoAlerta: "danger",
    };
  }

  mudar = (campo) => (e) => this.setState({ [campo]: e.target.value });

  // carga atual = numero de turmas do professor (derivado dos dados)
  cargaAtual(professorId) {
    return this.context.dados.turmas.filter((t) => t.professorId === professorId).length;
  }

  salvar = (e) => {
    e.preventDefault();
    const { nome, email, cargaMaxima } = this.state;

    if (!nome.trim() || !email.trim()) {
      this.setState({ alerta: "Preencha nome e email.", tipoAlerta: "danger" });
      return;
    }

    salvarProfessor({ nome, email, cargaMaxima })
      .then(() => this.context.recarregar())
      .then(() =>
        this.setState({
          nome: "",
          email: "",
          cargaMaxima: "",
          alerta: "Professor cadastrado!",
          tipoAlerta: "success",
        })
      )
      .catch((erro) => this.setState({ alerta: erro.message, tipoAlerta: "danger" }));
  };

  render() {
    const { dados } = this.context;
    const { nome, email, cargaMaxima, alerta, tipoAlerta } = this.state;

    return (
      <div className="row">
        <div className="col-lg-7">
          <Card titulo="Professores e carga">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Carga (atual / max)</th>
                </tr>
              </thead>
              <tbody>
                {dados.professores.map((p) => {
                  const atual = this.cargaAtual(p.id);
                  const cheio = atual >= p.cargaMaxima;
                  return (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td>{p.email}</td>
                      <td>
                        <span className={"badge " + (cheio ? "bg-danger" : "bg-success")}>
                          {atual} / {p.cargaMaxima}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="col-lg-5">
          <Card titulo="Novo professor">
            {alerta && <div className={"alert alert-" + tipoAlerta}>{alerta}</div>}
            <form onSubmit={this.salvar}>
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input className="form-control" value={nome} onChange={this.mudar("nome")} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={this.mudar("email")}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Carga maxima (nº de turmas)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={cargaMaxima}
                  onChange={this.mudar("cargaMaxima")}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Cadastrar
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

export default Professores;
