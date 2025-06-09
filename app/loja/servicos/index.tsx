"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
// Atualizar o import da API
import { getServicos, removerServico } from "../../../lib/api"

type Servico = {
  id: number
  nome_servico: string
  preco: number
  descricao: string
}

export default function ServicosScreen() {
  const router = useRouter()
  const { lojaId } = useLocalSearchParams()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Modificar a função carregarServicos para lidar com diferentes formatos de resposta
  const carregarServicos = async () => {
    if (!lojaId) return

    try {
      setLoading(true)
      const data = await getServicos(Number(lojaId))

      // Verificar se data é um array ou se está dentro de uma propriedade
      if (Array.isArray(data)) {
        setServicos(data)
      } else if (data && Array.isArray(data.servicos)) {
        setServicos(data.servicos)
      } else {
        // Se não for um array, definir como array vazio
        console.warn("Dados de serviços não são um array:", data)
        setServicos([])
      }
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
      // Definir serviços como array vazio em caso de erro
      setServicos([])
      Alert.alert("Aviso", "Não foi possível carregar os serviços. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    carregarServicos()
  }, [lojaId])

  const handleRefresh = () => {
    setRefreshing(true)
    carregarServicos()
  }

  const handleRemoverServico = async (servicoId: number) => {
    Alert.alert("Remover Serviço", "Tem certeza que deseja remover este serviço?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await removerServico(Number(lojaId), servicoId)
            setServicos(servicos.filter((s) => s.id !== servicoId))
            Alert.alert("Sucesso", "Serviço removido com sucesso.")
          } catch (error) {
            console.error("Erro ao remover serviço:", error)
            Alert.alert("Erro", "Não foi possível remover o serviço.")
          }
        },
      },
    ])
  }

  const handleGerenciarHorarios = (servicoId: number, nomeServico: string) => {
    router.push({
      pathname: "/loja/servicos/horarios",
      params: { lojaId, servicoId, nomeServico },
    })
  }

  const renderServicoItem = ({ item }: { item: Servico }) => (
    <View style={styles.servicoItem}>
      <View style={styles.servicoInfo}>
        <Text style={styles.servicoNome}>{item.nome_servico}</Text>
        <Text style={styles.servicoPreco}>R$ {item.preco.toFixed(2)}</Text>
        {item.descricao ? <Text style={styles.servicoDescricao}>{item.descricao}</Text> : null}
      </View>
      <View style={styles.servicoAcoes}>
        <TouchableOpacity
          style={styles.horarioButton}
          onPress={() => handleGerenciarHorarios(item.id, item.nome_servico)}
        >
          <Ionicons name="time-outline" size={20} color="#0D47A1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.removerButton} onPress={() => handleRemoverServico(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Serviços</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D47A1" />
        </View>
      ) : (
        <>
          <FlatList
            data={servicos}
            renderItem={renderServicoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="construct-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Nenhum serviço cadastrado</Text>
                <Text style={styles.emptySubtext}>Adicione seu primeiro serviço</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/loja/servicos/cadastrar",
                params: { lojaId },
              })
            }
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  servicoItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  servicoInfo: {
    flex: 1,
  },
  servicoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  servicoPreco: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 4,
  },
  servicoDescricao: {
    fontSize: 13,
    color: "#666",
  },
  servicoAcoes: {
    flexDirection: "row",
    alignItems: "center",
  },
  horarioButton: {
    padding: 8,
    marginRight: 8,
  },
  removerButton: {
    padding: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0D47A1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
})
