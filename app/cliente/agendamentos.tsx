"use client"

import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export type Agendamento = {
  id: number
  loja: string
  servico: string
  data: string   // ex: "2025-05-15"
  hora: string   // ex: "14:30"
  status: string // "PENDENTE" | "ACEITO" | "CONCLUÍDO" | "CANCELADO"
}

export default function AgendamentosScreen() {
  const router = useRouter()
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [agendamentosOriginal, setAgendamentosOriginal] = useState<Agendamento[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Mapear status para cores e texto
  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDENTE: { color: "#FF9800", label: "Pendente" },
    ACEITO: { color: "#4CAF50", label: "Confirmado" },
    CONCLUIDO: { color: "#2196F3", label: "Concluído" },
    CANCELADO: { color: "#F44336", label: "Cancelado" },
  }

  useEffect(() => {
    ;(async () => {
      const idStr = await AsyncStorage.getItem("clienteId")
      if (idStr) {
        const id = Number(idStr)
        setClienteId(id)
      }
    })()
  }, [])

  useEffect(() => {
    if (clienteId) {
      fetchAgendamentos()
    }
  }, [clienteId])

  async function fetchAgendamentos() {
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/cliente/${clienteId}/agenda`)
      if (!res.ok) {
        console.error("Erro ao buscar agendamentos:", await res.text())
        return
      }
      const json = await res.json()
      const data: Agendamento[] = (json.agenda_cliente || []).map((r: any) => {
        const [date, timeFull] = String(r.data_horario).split("T")
        return {
          id: r.reserva_id,
          loja: String(r.loja_id),
          servico: String(r.servico_id),
          data: date,
          hora: timeFull?.slice(0, 5) || "",
          status: r.status.toUpperCase(),
        }
      })
      setAgendamentosOriginal(data)
      applyFilter(data, filtroAtivo)
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilter(list: Agendamento[], status: string | null) {
    if (!status) {
      setAgendamentos(list)
    } else {
      setAgendamentos(list.filter(item => item.status === status))
    }
  }

  const handleCancelarAgendamento = (id: number) => {
    Alert.alert(
      "Cancelar Agendamento",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${BASE_URL}/cliente/${clienteId}/reserva/${id}/cancelar`,
                { method: "PUT" }
              )
              if (!res.ok) {
                console.error("Falha ao cancelar:", await res.text())
                return
              }
              // atualizar local
              const updated = agendamentosOriginal.map(item =>
                item.id === id ? { ...item, status: "CANCELADO" } : item
              )
              setAgendamentosOriginal(updated)
              applyFilter(updated, filtroAtivo)
            } catch (e) {
              console.error(e)
            }
          },
        },
      ]
    )
  }

  const renderAgendamentoItem = ({ item }: { item: Agendamento }) => {
    const cfg = statusConfig[item.status] || { color: "#999", label: item.status }
    return (
      <View style={styles.agendamentoItem}>
        <View style={styles.agendamentoHeader}>
          <Text style={styles.lojaName}>{item.loja}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color }]}> 
            <Text style={styles.statusText}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.servicoName}>{item.servico}</Text>
        <View style={styles.agendamentoInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.data}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.hora}</Text>
          </View>
        </View>
        {item.status !== "CANCELADO" && item.status !== "CONCLUIDO" && (
          <TouchableOpacity
            style={styles.cancelarButton}
            onPress={() => handleCancelarAgendamento(item.id)}
          >
            <Text style={styles.cancelarButtonText}>Cancelar Agendamento</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
      </View>

      <View style={styles.filtrosContainer}>
        { [null, 'PENDENTE','ACEITO','CONCLUIDO','CANCELADO'].map(stat => (
          <TouchableOpacity
            key={`filtro-${stat}`}
            style={[
              styles.filtroItem,
              filtroAtivo === stat && styles.filtroAtivo,
            ]}
            onPress={() => {
              setFiltroAtivo(stat)
              applyFilter(agendamentosOriginal, stat)
            }}
          >
            <Text style={[
              styles.filtroTexto,
              filtroAtivo === stat && styles.filtroTextoAtivo,
            ]}>
              { stat ? statusConfig[stat]?.label : 'Todos' }
            </Text>
          </TouchableOpacity>
        )) }
      </View>

      <FlatList
        data={agendamentos}
        renderItem={renderAgendamentoItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
          </View>
        }
      />
    </View>
  )
}

const BASE_URL =
  "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev"

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: "white" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#0D47A1" },
  filtrosContainer: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E0E0E0", flexWrap: "wrap" },
  filtroItem: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 8, marginBottom: 8, backgroundColor: "#F0F0F0" },
  filtroAtivo: { backgroundColor: "#0D47A1" },
  filtroTexto: { fontSize: 14, color: "#666" },
  filtroTextoAtivo: { color: "white" },
  listaContainer: { padding: 16, paddingBottom: 80 },
  agendamentoItem: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  agendamentoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  lojaName: { fontSize: 16, fontWeight: "600", color: "#333" },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "500", color: "white" },
  servicoName: { fontSize: 18, fontWeight: "bold", color: "#0D47A1", marginBottom: 12 },
  agendamentoInfo: { flexDirection: "row", marginBottom: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  infoText: { fontSize: 14, color: "#666", marginLeft: 4 },
  cancelarButton: { backgroundColor: "#F44336", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: "center" },
  cancelarButtonText: { color: "white", fontSize: 14, fontWeight: "500" },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 16 },
})