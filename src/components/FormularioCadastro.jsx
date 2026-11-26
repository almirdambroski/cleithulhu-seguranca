import { useState } from "react";

function FormularioCadastro() {
  // Estados: guardam o que o usuário digita em cada campo
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [mensagem, setMensagem] = useState("");

  function handleSubmit(evento) {
    evento.preventDefault(); // impede a página de recarregar
    // ⚠️ VERSÃO INSEGURA: aceita qualquer coisa, sem validar nada
    setMensagem(
      `Cliente "${nome}" cadastrado com CPF ${cpf} e chave Pix ${chavePix}`,
    );
  }
  return (
    <form onSubmit={handleSubmit} className="formulario">
      <label>
        Nome completo
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </label>

      <label>
        CPF
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
      </label>

      <label>
        Chave Pix
        <input
          type="text"
          value={chavePix}
          onChange={(e) => setChavePix(e.target.value)}
        />
      </label>

      <button type="submit">Cadastrar</button>

      {mensagem && <p className="mensagem">{mensagem}</p>}
    </form>
  );
}

export default FormularioCadastro;
