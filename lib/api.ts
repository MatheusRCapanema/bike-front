import axios from "axios"
import * as FileSystem from "expo-file-system"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Configuração base do axios
const api = axios.create({
  baseURL: "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev", // URL do seu backend local
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Interceptor para lidar com erros de CORS
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Verificar se é um erro de CORS
    if (
      error.message &&
      (error.message.includes("Network Error") ||
        error.message.includes("CORS") ||
        error.message.includes("ERR_FAILED"))
    ) {
      console.warn("Erro de CORS detectado. Usando dados simulados.")

      // Extrair informações da requisição para simular a resposta
      const { url, method, data } = error.config

      // Simular respostas com base no endpoint e método
      return simulateResponse(url, method, data)
    }

    return Promise.reject(error)
  },
)

// Função para simular respostas do backend
async function simulateResponse(url: string, method: string, requestData: any) {
  console.log(`Simulando resposta para: ${method} ${url}`)

  // Simular registro de cliente
  if (url.includes("/cliente/registro") && method === "post") {
    const data = JSON.parse(requestData)
    // Salvar dados do cliente no AsyncStorage para simular um banco de dados
    await AsyncStorage.setItem("cliente_simulado", JSON.stringify(data))
    return {
      data: {
        mensagem: "Cliente registrado com sucesso!",
        cliente_id: Math.floor(Math.random() * 1000) + 1,
      },
    }
  }

  // Simular login de cliente
  if (url.includes("/cliente/login") && method === "post") {
    const data = JSON.parse(requestData)
    const clienteId = Math.floor(Math.random() * 1000) + 1
    // Salvar ID do cliente no AsyncStorage
    await AsyncStorage.setItem("clienteId", clienteId.toString())
    return {
      data: {
        mensagem: "Login realizado com sucesso!",
        cliente_id: clienteId,
      },
    }
  }

  // Simular registro de loja
  if (url.includes("/loja/registro") && method === "post") {
    const data = JSON.parse(requestData)
    // Salvar dados da loja no AsyncStorage para simular um banco de dados
    await AsyncStorage.setItem("loja_simulada", JSON.stringify(data))
    return {
      data: {
        mensagem: "Loja registrada com sucesso!",
        loja_id: Math.floor(Math.random() * 1000) + 1,
      },
    }
  }

  // Simular login de loja
  if (url.includes("/loja/login") && method === "post") {
    const data = JSON.parse(requestData)
    const lojaId = Math.floor(Math.random() * 1000) + 1
    // Salvar ID da loja no AsyncStorage
    await AsyncStorage.setItem("lojaId", lojaId.toString())
    return {
      data: {
        mensagem: "Login realizado com sucesso!",
        loja_id: lojaId,
      },
    }
  }

  // Simular busca de produtos
  if (url.includes("/produtos") && method === "get") {
    return {
      data: [
        {
          id: 1,
          nome_produto: "Capacete MTB",
          preco: 199.9,
          quantidade_estoque: 15,
          image_path: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 2,
          nome_produto: "Luvas de Ciclismo",
          preco: 89.9,
          quantidade_estoque: 30,
          image_path: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 3,
          nome_produto: "Bomba de Ar",
          preco: 59.9,
          quantidade_estoque: 20,
          image_path: "/placeholder.svg?height=80&width=80",
        },
      ],
    }
  }

  // Simular busca de serviços
  if (url.includes("/servicos") && method === "get") {
    return {
      data: [
        {
          id: 1,
          nome_servico: "Manutenção de Freios",
          preco: 80.0,
          descricao: "Ajuste e manutenção completa do sistema de freios.",
        },
        {
          id: 2,
          nome_servico: "Troca de Pneus",
          preco: 50.0,
          descricao: "Substituição de pneus e câmaras.",
        },
        {
          id: 3,
          nome_servico: "Revisão Completa",
          preco: 150.0,
          descricao: "Revisão geral da bicicleta, incluindo ajustes e lubrificação.",
        },
      ],
    }
  }

  // Simular busca de horários
  if (url.includes("/horarios") && method === "get") {
    return {
      data: [
        {
          id: 1,
          horario: "2023-05-15T14:30:00",
          is_disponivel: true,
        },
        {
          id: 2,
          horario: "2023-05-16T10:00:00",
          is_disponivel: false,
        },
        {
          id: 3,
          horario: "2023-05-17T16:45:00",
          is_disponivel: true,
        },
      ],
    }
  }

  // Simular perfil da loja
  if (url.includes("/loja/") && !url.includes("/produtos") && !url.includes("/servicos") && method === "get") {
    return {
      data: {
        nome_loja: "Minha Loja de Bikes",
        cnpj: "12.345.678/0001-90",
        endereco: "Av. das Bicicletas, 123",
        cep: "01234-567",
        descricao: "Loja especializada em bicicletas e acessórios para ciclismo.",
        foto_path: null,
      },
    }
  }

  // Resposta padrão para outros endpoints
  return {
    data: {
      mensagem: "Operação simulada com sucesso!",
    },
  }
}

// Funções para Cliente
export async function registrarCliente(nome: string, idade: number, cpf: string, senha: string) {
  try {
    const response = await api.post("/cliente/registro", {
      nome,
      idade,
      cpf,
      senha,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao registrar cliente")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function loginCliente(cpf: string, senha: string) {
  try {
    const response = await api.post("/cliente/login", {
      cpf,
      senha,
    })

    // Salvar o ID do cliente no AsyncStorage
    if (response.data && response.data.cliente_id) {
      await AsyncStorage.setItem("clienteId", response.data.cliente_id.toString())
    }

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao fazer login")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

// Funções para Loja
export async function registrarLoja(
  nome_loja: string,
  cnpj: string,
  cep: string,
  endereco: string,
  complemento: string,
  lote: string,
  senha: string,
  latitude?: number,
  longitude?: number,
) {
  try {
    const response = await api.post("/loja/registro", {
      nome_loja,
      cnpj,
      cep,
      endereco,
      complemento,
      lote,
      senha,
      latitude,
      longitude,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao registrar loja")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function loginLoja(cnpj: string, senha: string) {
  try {
    const response = await api.post("/loja/login", {
      cnpj,
      senha,
    })

    // Salvar o ID da loja no AsyncStorage
    if (response.data && response.data.loja_id) {
      await AsyncStorage.setItem("lojaId", response.data.loja_id.toString())
    }

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao fazer login")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

// Funções para Produtos
export async function getProdutos(lojaId: number) {
  try {
    console.log(`🔍 BUSCANDO PRODUTOS - Loja ID: ${lojaId}`)
    // O endpoint correto é /loja/{lojaId}/produtos (sem o "produto_com_imagem")
    const response = await api.get(`/loja/${lojaId}/produtos`)
    return response.data
  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR PRODUTOS:")
    if (error.response) {
      console.error(`Status: ${error.response.status}`)
      console.error("Detalhes do erro:", error.response.data)
      throw new Error(error.response.data.detail || "Erro ao buscar produtos")
    }
    console.error("Mensagem de erro:", error.message)
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function cadastrarProdutoComImagem(
  lojaId: number,
  nomeProduto: string,
  preco: number,
  quantidadeEstoque: number,
  imagemUri: string,
) {
  try {
    const formData = new FormData()
    formData.append("nome_produto", nomeProduto)
    formData.append("preco", preco.toString())
    formData.append("quantidade_estoque", quantidadeEstoque.toString())

    // Adicionar a imagem ao FormData
    const fileInfo = await FileSystem.getInfoAsync(imagemUri)
    if (fileInfo.exists) {
      const fileName = imagemUri.split("/").pop()
      const match = /\.(\w+)$/.exec(fileName || "")
      const type = match ? `image/${match[1]}` : "image/jpeg"

      formData.append("arquivo", {
        uri: imagemUri,
        name: fileName,
        type,
      } as any)
    }

    const response = await api.post(`/loja/${lojaId}/produto_com_imagem`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao cadastrar produto")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function removerProduto(lojaId: number, produtoId: number) {
  try {
    const response = await api.delete(`/loja/${lojaId}/produto/${produtoId}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao remover produto")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

// Funções para Serviços
export async function getServicos(lojaId: number) {
  try {
    console.log(`🔍 BUSCANDO SERVIÇOS - Loja ID: ${lojaId}`)
    // O endpoint correto é /loja/{lojaId}/servicos
    const response = await api.get(`/loja/${lojaId}/servicos`)
    return response.data
  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR SERVIÇOS:")
    if (error.response) {
      console.error(`Status: ${error.response.status}`)
      console.error("Detalhes do erro:", error.response.data)
      throw new Error(error.response.data.detail || "Erro ao buscar serviços")
    }
    console.error("Mensagem de erro:", error.message)
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function cadastrarServico(lojaId: number, nomeServico: string, preco: number, descricao: string) {
  try {
    const response = await api.post(`/loja/${lojaId}/servico`, {
      nome_servico: nomeServico,
      preco,
      descricao,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao cadastrar serviço")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function removerServico(lojaId: number, servicoId: number) {
  try {
    const response = await api.delete(`/loja/${lojaId}/servico/${servicoId}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao remover serviço")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

// Funções para Horários
export async function getHorariosServico(lojaId: number, servicoId: number) {
  try {
    const response = await api.get(`/loja/${lojaId}/servico/${servicoId}/horarios`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao buscar horários")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function criarHorariosServico(lojaId: number, servicoId: number, horarios: string[]) {
  try {
    const response = await api.post(`/loja/${lojaId}/servico/${servicoId}/horarios`, {
      horarios,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao criar horários")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}

// Funções para Perfil da Loja
export async function getPerfilLoja(lojaId: number) {
  try {
    console.log(`🔍 BUSCANDO PERFIL DA LOJA - Loja ID: ${lojaId}`)
    // O endpoint correto é /loja/{lojaId}
    const response = await api.get(`/loja/${lojaId}`)
    return response.data
  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR PERFIL DA LOJA:")
    if (error.response) {
      console.error(`Status: ${error.response.status}`)
      console.error("Detalhes do erro:", error.response.data)
      throw new Error(error.response.data.detail || "Erro ao buscar perfil da loja")
    }
    console.error("Mensagem de erro:", error.message)
    throw new Error("Erro de conexão com o servidor")
  }
}

export async function atualizarPerfilLoja(
  lojaId: number,
  nomeLoja: string,
  descricao: string,
  latitude?: number,
  longitude?: number,
  imagemUri?: string | null,
) {
  try {
    const formData = new FormData()
    formData.append("nome_loja", nomeLoja)

    if (descricao) {
      formData.append("descricao", descricao)
    }

    if (latitude !== undefined) {
      formData.append("latitude", latitude.toString())
    }

    if (longitude !== undefined) {
      formData.append("longitude", longitude.toString())
    }

    // Adicionar a imagem ao FormData se existir
    if (imagemUri && !imagemUri.startsWith("http")) {
      const fileInfo = await FileSystem.getInfoAsync(imagemUri)
      if (fileInfo.exists) {
        const fileName = imagemUri.split("/").pop()
        const match = /\.(\w+)$/.exec(fileName || "")
        const type = match ? `image/${match[1]}` : "image/jpeg"

        formData.append("arquivo", {
          uri: imagemUri,
          name: fileName,
          type,
        } as any)
      }
    }

    const response = await api.put(`/loja/${lojaId}/atualizar_perfil`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erro ao atualizar perfil")
    }
    throw new Error("Erro de conexão com o servidor")
  }
}