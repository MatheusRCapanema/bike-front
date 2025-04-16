"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

type LojaProxima = {
  id: number
  nome: string
  distancia: string
  avaliacao: number
  imagem: string
}

type Servico = {
  id: number
  nome: string
  icone: string
}

const lojasProximas: LojaProxima[] = [
  {
    id: 1,
    nome: "Bike Shop",
    distancia: "1.2 km",
    avaliacao: 4.5,
    imagem: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    nome: "Ciclo Peças",
    distancia: "2.5 km",
    avaliacao: 4.2,
    imagem: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    nome: "Bicicletas & Cia",
    distancia: "3.8 km",
    avaliacao: 4.7,
    imagem: "/placeholder.svg?height=80&width=80",
  },
]

const servicos: Servico[] = [
  { id: 1, nome: "Manutenção", icone: "construct" },
  { id: 2, nome: "Peças", icone: "cog" },
  { id: 3, nome: "Acessórios", icone: "bicycle" },
  { id: 4, nome: "Roupas", icone: "shirt" },
]

export default function ClienteDashboard() {
  const router = useRouter()
  const [clienteNome, setClienteNome] = useState("Ciclista")

  useEffect(() => {
    // Aqui você carregaria os dados do cliente da API
    // Por enquanto, estamos usando dados estáticos
  }, [])

  const renderLojaItem = ({ item }: { item: LojaProxima }) => (
    <TouchableOpacity style={styles.lojaCard}>
      <Image source={{ uri: item.imagem }} style={styles.lojaImagem} />
      <Text style={styles.lojaNome}>{item.nome}</Text>
      <View style={styles.lojaInfo}>
        <View style={styles.avaliacaoContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.avaliacaoTexto}>{item.avaliacao.toFixed(1)}</Text>
        </View>
        <Text style={styles.distanciaTexto}>{item.distancia}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderServicoItem = ({ item }: { item: Servico }) => (
    <TouchableOpacity style={styles.servicoItem}>
      <View style={styles.servicoIconContainer}>
        <Ionicons name={item.icone as any} size={24} color="#0D47A1" />
      </View>
      <Text style={styles.servicoNome}>{item.nome}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá, {clienteNome}!</Text>
          <Text style={styles.subtitulo}>O que você precisa hoje?</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Categorias</Text>
          </View>
          <FlatList
            data={servicos}
            renderItem={renderServicoItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicosContainer}
          />
        </View>

        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Lojas Próximas</Text>
            <TouchableOpacity onPress={() => router.push("/cliente/buscar")}>
              <Text style={styles.verMaisTexto}>Ver mais</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={lojasProximas}
            renderItem={renderLojaItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lojasContainer}
          />
        </View>

        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Próximos Agendamentos</Text>
            <TouchableOpacity onPress={() => router.push("/cliente/agendamentos")}>
              <Text style={styles.verMaisTexto}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.agendamentoCard} onPress={() => router.push("/cliente/agendamentos")}>
            <View style={styles.agendamentoHeader}>
              <Text style={styles.agendamentoLoja}>Bike Shop</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmado</Text>
              </View>
            </View>
            <Text style={styles.agendamentoServico}>Manutenção de Freios</Text>
            <View style={styles.agendamentoInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.infoText}>15/05/2023</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>14:30</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  saudacao: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  secao: {
    marginBottom: 24,
  },
  secaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  verMaisTexto: {
    fontSize: 14,
    color: "#0D47A1",
    fontWeight: "500",
  },
  servicosContainer: {
    paddingVertical: 8,
  },
  servicoItem: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  servicoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(13, 71, 161, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  servicoNome: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  lojasContainer: {
    paddingVertical: 8,
  },
  lojaCard: {
    width: 140,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lojaImagem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 12,
    backgroundColor: "#F0F0F0",
  },
  lojaNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  lojaInfo: {
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
  agendamentoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  agendamentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  agendamentoLoja: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  agendamentoServico: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 12,
  },
  agendamentoInfo: {
    flexDirection: "row",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
})
