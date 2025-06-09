"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
// Atualizar o import da API
import { getProdutos, removerProduto } from "../../../lib/api"

type Produto = {
  id: number
  nome_produto: string
  preco: number
  quantidade_estoque: number
  image_path: string
}

export default function ProdutosScreen() {
  const router = useRouter()
  const { lojaId } = useLocalSearchParams()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Corrigir o problema de carregamento de produtos

  // Modificar a função carregarProdutos para lidar com diferentes formatos de resposta
  const carregarProdutos = async () => {
    if (!lojaId) return

    try {
      setLoading(true)
      const data = await getProdutos(Number(lojaId))

      // Verificar se data é um array ou se está dentro de uma propriedade
      if (Array.isArray(data)) {
        setProdutos(data)
      } else if (data && Array.isArray(data.produtos)) {
        setProdutos(data.produtos)
      } else {
        // Se não for um array, definir como array vazio
        console.warn("Dados de produtos não são um array:", data)
        setProdutos([])
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      // Definir produtos como array vazio em caso de erro
      setProdutos([])
      Alert.alert("Aviso", "Não foi possível carregar os produtos. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [lojaId])

  const handleRefresh = () => {
    setRefreshing(true)
    carregarProdutos()
  }

  const handleRemoverProduto = async (produtoId: number) => {
    Alert.alert("Remover Produto", "Tem certeza que deseja remover este produto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await removerProduto(Number(lojaId), produtoId)
            setProdutos(produtos.filter((p) => p.id !== produtoId))
            Alert.alert("Sucesso", "Produto removido com sucesso.")
          } catch (error) {
            console.error("Erro ao remover produto:", error)
            Alert.alert("Erro", "Não foi possível remover o produto.")
          }
        },
      },
    ])
  }

  const renderProdutoItem = ({ item }: { item: Produto }) => (
    <View style={styles.produtoItem}>
      <Image
        source={{ uri: `https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev/${item.image_path}` }}
        style={styles.produtoImagem}
        defaultSource={require("../../../assets/placeholder-image.png")}
      />
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoNome}>{item.nome_produto}</Text>
        <Text style={styles.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
        <Text style={styles.produtoEstoque}>Estoque: {item.quantidade_estoque}</Text>
      </View>
      <TouchableOpacity style={styles.removerButton} onPress={() => handleRemoverProduto(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Produtos</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D47A1" />
        </View>
      ) : (
        <>
          <FlatList
            data={produtos}
            renderItem={renderProdutoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="bicycle-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
                <Text style={styles.emptySubtext}>Adicione seu primeiro produto</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/loja/produtos/cadastrar",
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
  produtoItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  produtoImagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  produtoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  produtoPreco: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 4,
  },
  produtoEstoque: {
    fontSize: 13,
    color: "#666",
  },
  removerButton: {
    padding: 8,
    justifyContent: "center",
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