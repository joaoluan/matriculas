import React, { Component } from "react";
import AppContext from "../AppContext";
import Card from "../componentes/Card";

// Tela Login: escolher perfil (Coordenacao) ou um aluno da lista.
// Formulario controlado (value + onChange) e grava o usuario no Context.
class Login extends Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      perfil: "coordenacao", // "coordenacao" ou "aluno"
      alunoId: "",
    };
  }

  mudarPerfil = (e) => {
    this.setState({ perfil: e.target.value, alunoId: "" });
  };

  mudarAluno = (e) => {
    this.setState({ alunoId: e.target.value });
  };

  entrar = (e) => {
    e.preventDefault(); // evita recarregar a pagina
    const { dados, entrar } = this.context;

    if (this.state.perfil === "coordenacao") {
      entrar({ perfil: "coordenacao", nome: "Coordenacao" });
      return;
    }

    // perfil aluno: precisa escolher um aluno
    const aluno = dados.alunos.find((a) => a.id === Number(this.state.alunoId));
    if (!aluno) {
      alert("Escolha um aluno para entrar.");
      return;
    }
    entrar({ perfil: "aluno", ...aluno });
  };

  render() {
    const { dados } = this.context;
    const { perfil, alunoId } = this.state;

    return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4 text-center">Sistema de Matriculas</h2>
          <Card titulo="Entrar" rodape="Escolha como quer acessar o sistema.">
            <form onSubmit={this.entrar}>
              <div className="mb-3">
                <label className="form-label">Perfil</label>
                <select
                  className="form-select"
                  value={perfil}
                  onChange={this.mudarPerfil}
                >
                  <option value="coordenacao">Coordenacao (monta turmas)</option>
                  <option value="aluno">Aluno (se matricula)</option>
                </select>
              </div>

              {/* renderizacao condicional: lista de alunos so aparece no perfil aluno */}
              {perfil === "aluno" && (
                <div className="mb-3">
                  <label className="form-label">Aluno</label>
                  <select
                    className="form-select"
                    value={alunoId}
                    onChange={this.mudarAluno}
                  >
                    <option value="">Selecione...</option>
                    {dados.alunos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome} ({a.matricula})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100">
                Entrar
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

export default Login;
