import React, { Component } from "react";
import AppContext from "./AppContext";
import { buscarDados } from "./api";

import ErrorBoundary from "./componentes/ErrorBoundary";
import Menu from "./componentes/Menu";

import Login from "./telas/Login";
import Disciplinas from "./telas/Disciplinas";
import Professores from "./telas/Professores";
import OfertarTurma from "./telas/OfertarTurma";
import DetalheTurma from "./telas/DetalheTurma";
import OfertasAluno from "./telas/OfertasAluno";
import MinhaGrade from "./telas/MinhaGrade";

// App: guarda o estado global (usuario, tela, dados) e distribui via Context.
// A troca de telas e feita SEM router: um switch sobre "tela" (renderizacao condicional).
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usuario: null,
      tela: "login",
      dados: null,
      carregando: true,
      erroCarregar: "",
      // parametro extra para telas que precisam de contexto (ex.: turma do detalhe)
      parametro: null,
    };
  }

  // componentDidMount: carrega os dados do back-end ao abrir o app
  componentDidMount() {
    this.recarregar();
  }

  recarregar = () => {
    return buscarDados()
      .then((dados) => {
        this.setState({ dados, carregando: false, erroCarregar: "" });
        return dados;
      })
      .catch((e) => {
        this.setState({ carregando: false, erroCarregar: e.message });
      });
  };

  irPara = (tela, parametro = null) => {
    this.setState({ tela, parametro });
  };

  entrar = (usuario) => {
    // define a tela inicial conforme o perfil
    const tela = usuario.perfil === "coordenacao" ? "disciplinas" : "ofertas";
    this.setState({ usuario, tela });
  };

  sair = () => {
    this.setState({ usuario: null, tela: "login", parametro: null });
  };

  // escolhe o componente da tela atual (renderizacao condicional)
  renderTela() {
    const { tela } = this.state;
    switch (tela) {
      case "login":
        return <Login />;
      case "disciplinas":
        return <Disciplinas />;
      case "professores":
        return <Professores />;
      case "ofertar":
        return <OfertarTurma />;
      case "detalheTurma":
        return <DetalheTurma turma={this.state.parametro} />;
      case "ofertas":
        return <OfertasAluno />;
      case "minhaGrade":
        return <MinhaGrade />;
      default:
        return <Login />;
    }
  }

  render() {
    const { usuario, tela, dados, carregando, erroCarregar } = this.state;

    // valor compartilhado pelo Context
    const contexto = {
      usuario,
      tela,
      dados,
      irPara: this.irPara,
      recarregar: this.recarregar,
      entrar: this.entrar,
      sair: this.sair,
    };

    return (
      <AppContext.Provider value={contexto}>
        {/* ErrorBoundary envolve a area principal para nao travar a pagina */}
        <ErrorBoundary>
          <Menu />
          <div className="container pb-5">
            {carregando && (
              <div className="alert alert-info">Carregando dados...</div>
            )}

            {/* renderizacao condicional: mensagem de erro de conexao */}
            {!carregando && erroCarregar && (
              <div className="alert alert-danger">
                Nao foi possivel falar com o servidor ({erroCarregar}). Se for o primeiro
                acesso, ele pode levar ate 1 minuto para iniciar. Aguarde e tente de novo.
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-danger" onClick={this.recarregar}>
                    Tentar de novo
                  </button>
                </div>
              </div>
            )}

            {/* so mostra as telas quando ja temos dados */}
            {!carregando && !erroCarregar && dados && this.renderTela()}
          </div>
        </ErrorBoundary>
      </AppContext.Provider>
    );
  }
}

export default App;
