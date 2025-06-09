// HorariosServicoScreen.tsx
"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"

type Horario = {
  id: number
  horario: string
  is_disponivel: boolean
}

export default function HorariosServicoScreen() {
  const router = useRouter()
  const { lojaId, servicoId, nomeServico } = useLocalSearchParams()

  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [addingHorario, setAddingHorario] = useState(false)

  // Defina aqui a URL base da sua API (ou pegue de variáveis de ambiente)
  const API_BASE = "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev" // por exemplo, ou "http://seuServidor:5000"

  const carregarHorarios = async () => {
    if (!lojaId || !servicoId) return

    try {
      setLoading(true)
      const resp = await fetch(
        `${API_BASE}/loja/${lojaId}/servico/${servicoId}/horarios`
      )
      if (!resp.ok) {
        throw new Error(`GET retornou status ${resp.status}`)
      }
      const data = await resp.json()

      if (Array.isArray(data.horarios_servico)) {
        setHorarios(data.horarios_servico)
      } else {
        console.warn("Resposta inesperada ao listar horários:", data)
        setHorarios([])
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error)
      setHorarios([])
      Alert.alert(
        "Aviso",
        "Não foi possível carregar os horários. Tente novamente mais tarde."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    carregarHorarios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lojaId, servicoId])

  const handleRefresh = () => {
    setRefreshing(true)
    carregarHorarios()
  }

  const handleAddHorario = () => {
    setModalVisible(true)
  }

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false)
    if (time) {
      setSelectedTime(time)
    }
  }

  const handleSaveHorario = async () => {
    // Combina data e hora
    const horarioCompleto = new Date(selectedDate)
    horarioCompleto.setHours(selectedTime.getHours())
    horarioCompleto.setMinutes(selectedTime.getMinutes())
    horarioCompleto.setSeconds(0)
    horarioCompleto.setMilliseconds(0)

    if (horarioCompleto <= new Date()) {
      Alert.alert("Erro", "O horário deve ser no futuro.")
      return
    }

    setAddingHorario(true)
    try {
      const body = {
        horarios: [horarioCompleto.toISOString()],
      }
      const resp = await fetch(
        `${API_BASE}/loja/${lojaId}/servico/${servicoId}/horarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      )
      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`POST retornou ${resp.status}: ${text}`)
      }

      setModalVisible(false)
      carregarHorarios()
      Alert.alert("Sucesso", "Horário adicionado com sucesso!")
    } catch (error) {
      console.error("Erro ao adicionar horário:", error)
      Alert.alert("Erro", "Não foi possível adicionar o horário.")
    } finally {
      setAddingHorario(false)
    }
  }

  const formatarData = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatarHora = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderHorarioItem = ({ item }: { item: Horario }) => (
    <View style={styles.horarioItem}>
      <View style={styles.horarioInfo}>
        <Text style={styles.horarioData}>{formatarData(item.horario)}</Text>
        <Text style={styles.horarioHora}>{formatarHora(item.horario)}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: item.is_disponivel ? "#4CAF50" : "#FF3B30",
            },
          ]}
        />
        <Text style={styles.statusText}>
          {item.is_disponivel ? "Disponível" : "Reservado"}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Horários</Text>
          <Text style={styles.headerSubtitle}>{nomeServico}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D47A1" />
        </View>
      ) : (
        <>
          <FlatList
            data={horarios}
            renderItem={renderHorarioItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Nenhum horário cadastrado</Text>
                <Text style={styles.emptySubtext}>
                  Adicione horários para este serviço
                </Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddHorario}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Adicionar Horário</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTimeContainer}>
                  <Text style={styles.dateTimeLabel}>Data:</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateTimeText}>
                      {selectedDate.toLocaleDateString("pt-BR")}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#0D47A1" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTimeContainer}>
                  <Text style={styles.dateTimeLabel}>Hora:</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateTimeText}>
                      {selectedTime.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#0D47A1" />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveHorario}
                  disabled={addingHorario}
                >
                  {addingHorario ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar Horário</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
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
  horarioItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  horarioInfo: {
    flex: 1,
  },
  horarioData: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  horarioHora: {
    fontSize: 15,
    color: "#0D47A1",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#0D47A1",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})