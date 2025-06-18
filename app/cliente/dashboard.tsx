"use client"

import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export type LojaProxima = {
  id: number
  nome: string
  distancia: string
  avaliacao: number
  imagem: string
}

export type Agendamento = {
  id: number
  loja: string
  servico: string
  data: string   // ex: "2025-05-15"
  horario: string // ex: "14:30"
  status: string // ex: "Confirmado"
}

const BASE_URL =
  "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev"

export default function ClienteDashboard() {
  const router = useRouter()

  const [cliente, setCliente] = useState<{ id: number; nome: string }>({
    id: 0,
    nome: "",
  })
  const [lojasProximas, setLojasProximas] = useState<LojaProxima[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])

  // 1) Ao montar, lê id do AsyncStorage
  useEffect(() => {
    ;(async () => {
      const idStr = await AsyncStorage.getItem("clienteId")
      if (idStr) {
        setCliente({ id: Number(idStr), nome: "" })
      }
    })()

    fetchLojasProximas()
  }, [])

  // 2) Quando tivermos cliente.id, busca nome e agendamentos
  useEffect(() => {
    if (cliente.id > 0) {
      fetchClienteDetalhes()
      fetchAgendamentos()
    }
  }, [cliente.id])

  // Busca nome do cliente na API
  async function fetchClienteDetalhes() {
    try {
      const res = await fetch(
        `${BASE_URL}/clientes/me?cliente_id=${cliente.id}`,
        { headers: { Accept: "application/json" } }
      )
      if (!res.ok) {
        console.error("Erro ao buscar cliente:", await res.text())
        return
      }
      const json = await res.json()
      setCliente((c) => ({ ...c, nome: json.nome }))
    } catch (error) {
      console.error("Erro ao buscar cliente:", error)
    }
  }

  // Lojas próximas
  async function fetchLojasProximas() {
    try {
      const lat = -15.793889
      const lng = -47.882778

      const res = await fetch(
        `${BASE_URL}/lojas-proximas?lat=${lat}&lng=${lng}`,
        { headers: { Accept: "application/json" } }
      )
      if (!res.ok) {
        console.error("Resposta inesperada ao buscar lojas:", await res.text())
        return
      }
      const data: LojaProxima[] = await res.json()
      setLojasProximas(data)
    } catch (error) {
      console.error("Erro ao buscar lojas próximas:", error)
    }
  }

  // Agendamentos do cliente
  async function fetchAgendamentos() {
    try {
      const res = await fetch(`${BASE_URL}/cliente/${cliente.id}/agenda`)
      if (!res.ok) {
        console.error("Erro ao buscar agendamentos:", await res.text())
        return
      }
      const json = await res.json()
      const data: Agendamento[] = (json.agenda_cliente || []).map((r: any) => {
        const [d, hora] = String(r.data_horario).split("T")
        return {
          id: r.reserva_id,
          loja: String(r.loja_id),
          servico: String(r.servico_id),
          data: d,
          horario: hora?.slice(0, 5) || "",
          status: r.status,
        }
      })
      setAgendamentos(data)
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error)
    }
  }

  const renderLojaItem = ({ item }: { item: LojaProxima }) => (
    <TouchableOpacity style={styles.lojaCard}>
      <Image source={{ uri: item.imagem }} style={styles.lojaImagem} />
      <Text style={styles.lojaNome}>{item.nome}</Text>
      <View style={styles.lojaInfo}>
        <View style={styles.avaliacaoContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.avaliacaoTexto}>
            {item.avaliacao.toFixed(1)}
          </Text>
        </View>
        <Text style={styles.distanciaTexto}>{item.distancia}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderAgendamentoItem = ({ item }: { item: Agendamento }) => (
    <TouchableOpacity
      style={styles.agendamentoCard}
      onPress={() => router.push("/cliente/agendamentos")}
    >
      <View style={styles.agendamentoHeader}>
        <Text style={styles.agendamentoLoja}>{item.loja}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.agendamentoServico}>{item.servico}</Text>
      <View style={styles.agendamentoInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.data}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.horario}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>
            Olá, {cliente.nome || "visitante"}!
          </Text>
          <Text style={styles.subtitulo}>O que você precisa hoje?</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/cliente/perfil")}
          style={styles.profileButton}
        >
          <Ionicons
            name="person-circle-outline"
            size={32}
            color="#0D47A1"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lojas Próximas */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Lojas Próximas</Text>
            <TouchableOpacity
              onPress={() => router.push("/cliente/buscar")}
            >
              <Text style={styles.verMaisTexto}>Ver mais</Text>
            </TouchableOpacity>
          </View>
          {lojasProximas.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma loja próxima encontrada.
            </Text>
          ) : (
            <FlatList
              data={lojasProximas}
              renderItem={renderLojaItem}
              keyExtractor={(i) => i.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.lojasContainer}
            />
          )}
        </View>

        {/* Próximos Agendamentos */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Próximos Agendamentos</Text>
            <TouchableOpacity
              onPress={() => router.push("/cliente/agendamentos")}
            >
              <Text style={styles.verMaisTexto}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {agendamentos.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum agendamento pendente.
            </Text>
          ) : (
            <FlatList
              data={agendamentos}
              renderItem={renderAgendamentoItem}
              keyExtractor={(i) => i.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.lojasContainer}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  profileButton: {
    padding: 4,
  },
  saudacao: { fontSize: 24, fontWeight: "bold", color: "#0D47A1" },
  subtitulo: { fontSize: 16, color: "#666", marginTop: 4 },
  content: { flex: 1, padding: 16 },
  secao: { marginBottom: 24 },
  secaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  secaoTitulo: { fontSize: 18, fontWeight: "bold", color: "#333" },
  verMaisTexto: { fontSize: 14, color: "#0D47A1", fontWeight: "500" },
  lojasContainer: { paddingVertical: 8 },
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
    textAlign: "center",
    marginBottom: 8,
  },
  lojaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avaliacaoContainer: { flexDirection: "row", alignItems: "center" },
  avaliacaoTexto: { fontSize: 14, color: "#666", marginLeft: 4 },
  distanciaTexto: { fontSize: 14, color: "#0D47A1", fontWeight: "500" },
  agendamentoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
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
  agendamentoLoja: { fontSize: 16, fontWeight: "600", color: "#333" },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "white", fontSize: 12, fontWeight: "500" },
  agendamentoServico: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 12,
  },
  agendamentoInfo: { flexDirection: "row" },
  infoItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  infoText: { marginLeft: 4, fontSize: 14, color: "#666" },
  emptyText: { textAlign: "center", color: "#999", marginVertical: 12 },
})