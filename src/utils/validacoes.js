// src/utils/validacoes.js
// Validação das entradas do cadastro de clientes da Cleithulhu Tech

// 1ª CAMADA — Lista negra: padrões típicos de ataques de injeção
const PADROES_SUSPEITOS = [
  /--|;|\/\*|\*\//, // comentários e separadores de comandos SQL
  /\b(OR|AND)\b\s+\S+\s*=\s*\S+/i, // condições sempre verdadeiras, ex.: OR 1=1
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|TRUNCATE)\b/i, // comandos SQL
  /<\s*\/?\s*script|on\w+\s*=|javascript:/i, // tentativas de XSS
]

// 2ª CAMADA — Lista branca: formatos permitidos
const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{3,80}$/
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REGEX_CELULAR = /^\+55\d{10,11}$/
const REGEX_CHAVE_ALEATORIA = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function contemPadraoSuspeito(texto) {
  return PADROES_SUSPEITOS.some((padrao) => padrao.test(texto))
}

// Valida o CPF pelos dígitos verificadores (não basta ter 11 números)
export function validarCPF(valor) {
  if (!/^[\d.\s-]+$/.test(valor)) return false // só números, pontos e traço
  const cpf = valor.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false // ex.: 111.111.111-11

  const calcularDigito = (base, pesoInicial) => {
    let soma = 0
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i)
    }
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  const digito1 = calcularDigito(cpf.slice(0, 9), 10)
  const digito2 = calcularDigito(cpf.slice(0, 10), 11)
  return digito1 === Number(cpf[9]) && digito2 === Number(cpf[10])
}

// Descobre o tipo da chave Pix (ou null se for inválida)
export function identificarTipoPix(valor) {
  const chave = valor.trim()
  if (validarCPF(chave)) return 'CPF'
  if (REGEX_EMAIL.test(chave)) return 'E-mail'
  if (REGEX_CELULAR.test(chave)) return 'Celular'
  if (REGEX_CHAVE_ALEATORIA.test(chave)) return 'Chave aleatória'
  return null
}

// LGPD: mostra só parte do CPF na tela (minimização de dados)
export function mascararCPF(valor) {
  const cpf = valor.replace(/\D/g, '')
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`
}

// Junta as duas camadas e devolve os erros de cada campo
export function validarCadastro({ nome, cpf, chavePix }) {
  const erros = {}
  let ataqueDetectado = false

  // 1ª camada: procura ataques em todos os campos
  for (const [campo, valor] of Object.entries({ nome, cpf, chavePix })) {
    if (contemPadraoSuspeito(valor)) {
      erros[campo] = 'Conteúdo bloqueado: padrão de ataque detectado.'
      ataqueDetectado = true
    }
  }

  // 2ª camada: confere se cada campo está no formato esperado
  if (!erros.nome && !REGEX_NOME.test(nome.trim())) {
    erros.nome = 'Use apenas letras e espaços (mínimo 3 caracteres).'
  }
  if (!erros.cpf && !validarCPF(cpf)) {
    erros.cpf = 'CPF inválido.'
  }
  if (!erros.chavePix && !identificarTipoPix(chavePix)) {
    erros.chavePix = 'Informe um CPF, e-mail, celular (+55...) ou chave aleatória.'
  }

  return { erros, ataqueDetectado }
}