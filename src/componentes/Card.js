import React, { Component } from "react";

// Card: moldura reutilizavel com titulo e conteudo.
// Exemplo de COMPOSICAO: o conteudo vem por props.children.
class Card extends Component {
  render() {
    const { titulo, children, rodape } = this.props;
    return (
      <div className="card shadow-sm mb-4">
        {titulo && (
          <div className="card-header fw-semibold">{titulo}</div>
        )}
        <div className="card-body">{children}</div>
        {rodape && <div className="card-footer text-muted small">{rodape}</div>}
      </div>
    );
  }
}

export default Card;
