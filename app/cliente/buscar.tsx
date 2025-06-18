"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type Loja = {
  id: number
  nome: string
  endereco: string
  distancia: string
  avaliacao: number
  imagem: string | null
}

const BASE_URL =
  "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev"

export default function BuscarScreen() {
  const [busca, setBusca] = useState("")
  const [lojasOriginal, setLojasOriginal] = useState<Loja[]>([])
  const [lojasDisplay, setLojasDisplay] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'prox' | 'avaliacao' | null>(null)

  // 1) Buscar lojas próximas ao carregar
  useEffect(() => {
    async function fetchLojas() {
      try {
        // lat/lng fixo ou usar geolocalização real
        const lat = -15.793889
        const lng = -47.882778
        const res = await fetch(`${BASE_URL}/lojas-proximas?lat=${lat}&lng=${lng}`)
        const data: Loja[] = await res.json()
        setLojasOriginal(data)
        setLojasDisplay(data)
      } catch (error) {
        console.error("Erro ao buscar lojas próximas:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLojas()
  }, [])

  // 2) Filtrar por texto de busca
  useEffect(() => {
    let filtradas = lojasOriginal
    if (busca) {
      const termo = busca.toLowerCase()
      filtradas = filtradas.filter(l =>
        l.nome.toLowerCase().includes(termo) ||
        l.endereco.toLowerCase().includes(termo)
      )
    }
    // aplicar ordenação pelo filtro ativo
    if (filtro === 'avaliacao') {
      filtradas = [...filtradas].sort((a, b) => b.avaliacao - a.avaliacao)
    }
    // proximas já vêm ordenadas por distância na API
    setLojasDisplay(filtradas)
  }, [busca, filtro, lojasOriginal])

  const renderEstrelas = (avaliacao: number) => {
    const estrelas = []
    for (let i = 1; i <= 5; i++) {
      if (i <= avaliacao) {
        estrelas.push(<Ionicons key={i} name="star" size={16} color="#FFD700" style={{ marginRight: 2 }} />)
      } else if (i - 0.5 <= avaliacao) {
        estrelas.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" style={{ marginRight: 2 }} />)
      } else {
        estrelas.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" style={{ marginRight: 2 }} />)
      }
    }
    return estrelas
  }

  const renderLojaItem = ({ item }: { item: Loja }) => (
    <TouchableOpacity style={styles.lojaItem}>
      {item.imagem ? (
        <Image source={{ uri: item.imagem }} style={styles.lojaImagem} />
      ) : (
        <View style={[styles.lojaImagem, styles.placeholder]} />
      )}
      <View style={styles.lojaInfo}>
        <Text style={styles.lojaNome}>{item.nome}</Text>
        <Text style={styles.lojaEndereco}>{item.endereco}</Text>
        <View style={styles.lojaDetalhes}>
          <View style={styles.avaliacaoContainer}>
            {renderEstrelas(item.avaliacao)}
            <Text style={styles.avaliacaoTexto}>{item.avaliacao.toFixed(1)}</Text>
          </View>
          <Text style={styles.distanciaTexto}>{item.distancia}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar Lojas</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lojas, produtos ou serviços"
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroItem, filtro === 'prox' && styles.filtroAtivo]}
          onPress={() => setFiltro('prox')}
        >
          <Text style={styles.filtroTexto}>Mais Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroItem, filtro === 'avaliacao' && styles.filtroAtivo]}
          onPress={() => setFiltro('avaliacao')}
        >
          <Text style={styles.filtroTexto}>Melhor Avaliadas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filtroItem}>
          <Text style={styles.filtroTexto}>Filtros</Text>
          <Ionicons name="options-outline" size={16} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={lojasDisplay}
        renderItem={renderLojaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: "white" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#0D47A1" },
  searchContainer: { padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  searchInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 8, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: "#E0E0E0" },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: "100%", fontSize: 16 },
  filtrosContainer: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  filtroItem: { flexDirection: "row", alignItems: "center", marginRight: 16, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: "rgba(13, 71, 161, 0.1)" },
  filtroAtivo: { backgroundColor: "#0D47A1" },
  filtroTexto: { fontSize: 14, color: "#0D47A1", marginRight: 4 },
  listaContainer: { padding: 16 },
  lojaItem: { flexDirection: "row", backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  lojaImagem: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#F0F0F0" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  lojaInfo: { flex: 1, marginLeft: 16 },
  lojaNome: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  lojaEndereco: { fontSize: 14, color: "#666", marginBottom: 8 },
  lojaDetalhes: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avaliacaoContainer: { flexDirection: "row", alignItems: "center" },
  avaliacaoTexto: { fontSize: 14, color: "#666", marginLeft: 4 },
  distanciaTexto: { fontSize: 14, color: "#0D47A1", fontWeight: "500" },
})