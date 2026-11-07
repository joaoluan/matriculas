import React, { Component } from "react";
import AppContext from "../AppContext";

// Menu: navbar que MUDA conforme o perfil do Context.
// Coordenacao ve telas de gestao; Aluno ve ofertas e minha grade.
class Menu extends Component {
  static contextType = AppContext;

  item(tela, rotulo) {
    const ativo = this.context.tela === tela;
    return (
      <li className="nav-item" key={tela}>
        <button
          className={"nav-link btn btn-link " + (ativo ? "active fw-bold" : "")}
          onClick={() => this.context.irPara(tela)}
        >
          {rotulo}
        </button>
      </li>
    );
  }

  render() {
    const { usuario, sair } = this.context;
    if (!usuario) return null; // sem login, sem menu

    const ehCoordenacao = usuario.perfil === "coordenacao";

    return (
      <nav className="navbar navbar-expand navbar-dark bg-primary mb-4">
        <div className="container">
          <span className="navbar-brand">Matriculas</span>
          <ul className="navbar-nav me-auto">
            {ehCoordenacao
              ? [
                  this.item("disciplinas", "Disciplinas"),
                  this.item("professores", "Professores"),
                  this.item("ofertar", "Ofertar turma"),
                ]
              : [
                  this.item("ofertas", "Ofertas"),
                  this.item("minhaGrade", "Minha grade"),
                ]}
          </ul>
          <span className="navbar-text text-white me-3">
            {ehCoordenacao ? "Coordenacao" : usuario.nome}
          </span>
          <button className="btn btn-sm btn-light" onClick={sair}>
            Sair
          </button>
        </div>
      </nav>
    );
  }
}

export default Menu;
