"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Loja = {
  id: number
  nome: string
  endereco: string
  distancia: string
  avaliacao: number
  imagem: string
}

// Dados de exemplo
const lojasExemplo: Loja[] = [
  {
    id: 1,
    nome: "Bike Shop",
    endereco: "Av. Paulista, 1000",
    distancia: "1.2 km",
    avaliacao: 4.5,
    imagem: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    nome: "Ciclo Peças",
    endereco: "Rua Augusta, 500",
    distancia: "2.5 km",
    avaliacao: 4.2,
    imagem: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    nome: "Bicicletas & Cia",
    endereco: "Av. Rebouças, 200",
    distancia: "3.8 km",
    avaliacao: 4.7,
    imagem: "/placeholder.svg?height=60&width=60",
  },
]

export default function BuscarScreen() {
  const [busca, setBusca] = useState("")
  const [lojas, setLojas] = useState<Loja[]>(lojasExemplo)

  const renderEstrelas = (avaliacao: number) => {
    const estrelas = []
    const totalEstrelas = 5

    for (let i = 1; i <= totalEstrelas; i++) {
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
      <Image source={{ uri: item.imagem }} style={styles.lojaImagem} />
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
        <TouchableOpacity style={styles.filtroItem}>
          <Text style={styles.filtroTexto}>Mais Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filtroItem}>
          <Text style={styles.filtroTexto}>Melhor Avaliadas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filtroItem}>
          <Text style={styles.filtroTexto}>Filtros</Text>
          <Ionicons name="options-outline" size={16} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={lojas}
        renderItem={renderLojaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  filtrosContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filtroItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(13, 71, 161, 0.1)",
  },
  filtroTexto: {
    fontSize: 14,
    color: "#0D47A1",
    marginRight: 4,
  },
  listaContainer: {
    padding: 16,
  },
  lojaItem: {
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
  lojaImagem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
  },
  lojaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  lojaNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  lojaEndereco: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  lojaDetalhes: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avaliacaoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avaliacaoTexto: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  distanciaTexto: {
    fontSize: 14,
    color: "#0D47A1",
    fontWeight: "500",
  },
})
