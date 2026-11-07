import React, { Component } from "react";

// Error Boundary: envolve a area principal do App.
// Usa getDerivedStateFromError + componentDidCatch para nao travar a pagina.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { deuErro: false, mensagem: "" };
  }

  static getDerivedStateFromError(erro) {
    // atualiza o state para mostrar a tela de erro no proximo render
    return { deuErro: true, mensagem: erro.message };
  }

  componentDidCatch(erro, info) {
    // aqui daria para registrar o erro num servico de log
    console.error("ErrorBoundary capturou:", erro, info);
  }

  recarregarPagina = () => {
    window.location.reload();
  };

  render() {
    if (this.state.deuErro) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Algo deu errado</h4>
            <p>A tela encontrou um problema, mas o app nao travou.</p>
            <hr />
            <p className="mb-0">
              <small className="text-muted">{this.state.mensagem}</small>
            </p>
          </div>
          <button className="btn btn-primary" onClick={this.recarregarPagina}>
            Recarregar
          </button>
        </div>
      );
    }
    // sem erro: mostra o conteudo normal (composicao via props.children)
    return this.props.children;
  }
}

export default ErrorBoundary;
