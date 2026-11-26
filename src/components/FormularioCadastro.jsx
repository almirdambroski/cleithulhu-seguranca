import { useState } from 'react'
import { validarCadastro, identificarTipoPix, mascararCPF } from '../utils/validacoes'

function FormularioCadastro() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [chavePix, setChavePix] = useState('')
  const [erros, setErros] = useState({})
  const [mensagem, setMensagem] = useState('')
  const [tentativasBloqueadas, setTentativasBloqueadas] = useState(0)

  function handleSubmit(evento) {
    evento.preventDefault()

    // ✅ VERSÃO SEGURA: valida tudo antes de aceitar
    const resultado = validarCadastro({ nome, cpf, chavePix })
    setErros(resultado.erros)

    if (resultado.ataqueDetectado) {
      setTentativasBloqueadas((total) => total + 1)
      console.warn('[ALERTA DE SEGURANÇA] Tentativa de injeção bloqueada no cadastro')
    }

    // Se houver qualquer erro, interrompe o cadastro
    if (Object.keys(resultado.erros).length > 0) {
      setMensagem('')
      return
    }

    const tipoPix = identificarTipoPix(chavePix)
    setMensagem(
      `Cliente "${nome.trim()}" cadastrado. CPF ${mascararCPF(cpf)} · Chave Pix (${tipoPix}) registrada.`
    )
    setNome('')
    setCpf('')
    setChavePix('')
  }

  return (
    <form onSubmit={handleSubmit} className="formulario" noValidate>
      <label>
        Nome completo
        <input
          type="text"
          value={nome}
          maxLength={80}
          className={erros.nome ? 'invalido' : ''}
          onChange={(e) => setNome(e.target.value)}
        />
        {erros.nome && <span className="erro">{erros.nome}</span>}
      </label>

      <label>
        CPF
        <input
          type="text"
          value={cpf}
          maxLength={14}
          placeholder="000.000.000-00"
          className={erros.cpf ? 'invalido' : ''}
          onChange={(e) => setCpf(e.target.value)}
        />
        {erros.cpf && <span className="erro">{erros.cpf}</span>}
      </label>

      <label>
        Chave Pix
        <input
          type="text"
          value={chavePix}
          maxLength={77}
          placeholder="CPF, e-mail, celular (+55...) ou aleatória"
          className={erros.chavePix ? 'invalido' : ''}
          onChange={(e) => setChavePix(e.target.value)}
        />
        {erros.chavePix && <span className="erro">{erros.chavePix}</span>}
      </label>

      <button type="submit">Cadastrar</button>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      {tentativasBloqueadas > 0 && (
        <p className="alerta">
          🛡️ {tentativasBloqueadas} tentativa(s) de ataque bloqueada(s) nesta sessão.
        </p>
      )}
    </form>
  )
}

export default FormularioCadastro