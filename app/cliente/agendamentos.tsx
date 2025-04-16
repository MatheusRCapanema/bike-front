"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Agendamento = {
  id: number
  loja: string
  servico: string
  data: string
  hora: string
  status: "pendente" | "confirmado" | "concluido" | "cancelado"
}

// Dados de exemplo
const agendamentosExemplo: Agendamento[] = [
  {
    id: 1,
    loja: "Bike Shop",
    servico: "Manutenção de Freios",
    data: "15/05/2023",
    hora: "14:30",
    status: "confirmado",
  },
  {
    id: 2,
    loja: "Ciclo Peças",
    servico: "Troca de Pneus",
    data: "20/05/2023",
    hora: "10:00",
    status: "pendente",
  },
  {
    id: 3,
    loja: "Bicicletas & Cia",
    servico: "Revisão Completa",
    data: "10/05/2023",
    hora: "16:45",
    status: "concluido",
  },
  {
    id: 4,
    loja: "Bike Shop",
    servico: "Ajuste de Câmbio",
    data: "05/05/2023",
    hora: "09:15",
    status: "cancelado",
  },
]

export default function AgendamentosScreen() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(agendamentosExemplo)
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "#4CAF50"
      case "pendente":
        return "#FF9800"
      case "concluido":
        return "#2196F3"
      case "cancelado":
        return "#F44336"
      default:
        return "#999"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmado":
        return "Confirmado"
      case "pendente":
        return "Pendente"
      case "concluido":
        return "Concluído"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleCancelarAgendamento = (id: number) => {
    Alert.alert("Cancelar Agendamento", "Tem certeza que deseja cancelar este agendamento?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => {
          // Aqui você faria a chamada para a API para cancelar o agendamento
          // Por enquanto, apenas atualizamos o estado local
          setAgendamentos(agendamentos.map((item) => (item.id === id ? { ...item, status: "cancelado" } : item)))
        },
      },
    ])
  }

  const filtrarAgendamentos = () => {
    if (!filtroAtivo) return agendamentos
    return agendamentos.filter((item) => item.status === filtroAtivo)
  }

  const renderAgendamentoItem = ({ item }: { item: Agendamento }) => (
    <View style={styles.agendamentoItem}>
      <View style={styles.agendamentoHeader}>
        <Text style={styles.lojaName}>{item.loja}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
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

      {item.status !== "cancelado" && item.status !== "concluido" && (
        <TouchableOpacity style={styles.cancelarButton} onPress={() => handleCancelarAgendamento(item.id)}>
          <Text style={styles.cancelarButtonText}>Cancelar Agendamento</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
      </View>

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroItem, filtroAtivo === null && styles.filtroAtivo]}
          onPress={() => setFiltroAtivo(null)}
        >
          <Text style={[styles.filtroTexto, filtroAtivo === null && styles.filtroTextoAtivo]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroItem, filtroAtivo === "pendente" && styles.filtroAtivo]}
          onPress={() => setFiltroAtivo("pendente")}
        >
          <Text style={[styles.filtroTexto, filtroAtivo === "pendente" && styles.filtroTextoAtivo]}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroItem, filtroAtivo === "confirmado" && styles.filtroAtivo]}
          onPress={() => setFiltroAtivo("confirmado")}
        >
          <Text style={[styles.filtroTexto, filtroAtivo === "confirmado" && styles.filtroTextoAtivo]}>Confirmados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroItem, filtroAtivo === "concluido" && styles.filtroAtivo]}
          onPress={() => setFiltroAtivo("concluido")}
        >
          <Text style={[styles.filtroTexto, filtroAtivo === "concluido" && styles.filtroTextoAtivo]}>Concluídos</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtrarAgendamentos()}
        renderItem={renderAgendamentoItem}
        keyExtractor={(item) => item.id.toString()}
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
  filtrosContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexWrap: "wrap",
  },
  filtroItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#F0F0F0",
  },
  filtroAtivo: {
    backgroundColor: "#0D47A1",
  },
  filtroTexto: {
    fontSize: 14,
    color: "#666",
  },
  filtroTextoAtivo: {
    color: "white",
  },
  listaContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  agendamentoItem: {
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
  agendamentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lojaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  servicoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 12,
  },
  agendamentoInfo: {
    flexDirection: "row",
    marginBottom: 16,
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
  cancelarButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelarButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
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
})
