import { createContext } from "react";

// Context global: guarda o usuario logado (perfil), a tela atual,
// os dados vindos do back-end e as funcoes para trocar de tela / recarregar.
const AppContext = createContext({
  usuario: null, // { perfil: "coordenacao" } ou { perfil: "aluno", ...dadosDoAluno }
  tela: "login", // tela atual (renderizacao condicional, sem router)
  dados: null, // { alunos, professores, disciplinas, turmas, matriculas }
  irPara: () => {},
  recarregar: () => {},
  entrar: () => {},
  sair: () => {},
});

export default AppContext;
