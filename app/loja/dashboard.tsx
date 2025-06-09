"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getPerfilLoja } from "../../lib/api"

// Modificar o componente LojaDashboard para buscar dados reais
export default function LojaDashboard() {
  const router = useRouter()
  const [lojaId, setLojaId] = useState<number | null>(null)
  const [lojaInfo, setLojaInfo] = useState({
    nome_loja: "",
    endereco: "",
    descricao: "",
 latitude: null,
    longitude: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Recuperar ID da loja do AsyncStorage e buscar dados do backend
    const carregarDadosLoja = async () => {
      try {
        const id = await AsyncStorage.getItem("lojaId")
        if (id) {
          setLojaId(Number(id))

          try {
            // Buscar dados da loja do backend
            const perfil = await getPerfilLoja(Number(id))

            // Verificar se perfil é um objeto com as propriedades esperadas
            if (perfil && typeof perfil === "object") {
              setLojaInfo({
                nome_loja: perfil.nome_loja || "Minha Loja",
                endereco: perfil.endereco || "Endereço não disponível",
                descricao: perfil.descricao || "Sem descrição disponível",
 latitude: perfil.latitude || null,
                // Adicionado longitude aqui
                longitude: perfil.longitude || null,
              })
            } else {
              console.warn("Formato de perfil inesperado:", perfil)
              // Usar valores padrão
              setLojaInfo({
                nome_loja: "Minha Loja",
                endereco: "Endereço não disponível",
 latitude: null,
                // Adicionado longitude aqui
                longitude: null,
                descricao: "Sem descrição disponível",
              })
            }
          } catch (error) {
            console.error("Erro ao buscar perfil da loja:", error)
            // Usar valores padrão em caso de erro
            setLojaInfo({
              nome_loja: "Minha Loja",
              endereco: "Endereço não disponível",
 latitude: null,
                // Adicionado longitude aqui
                longitude: null,
              descricao: "Sem descrição disponível",
            })
          }
        } else {
          Alert.alert("Erro", "Sessão expirada. Faça login novamente.")
          router.replace("/loja/login")
        }
      } catch (error) {
        console.error("Erro ao recuperar ID da loja:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosLoja()
  }, [])

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("lojaId")
      router.replace("/welcome-screen")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0D47A1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>{lojaInfo.nome_loja}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="business-outline" size={24} color="#0D47A1" />
            <Text style={styles.infoTitle}>Informações da Loja</Text>
          </View>
          <Text style={styles.infoText}>{lojaInfo.endereco}</Text>
          {lojaInfo.descricao && <Text style={styles.infoDescription}>{lojaInfo.descricao}</Text>}
          <Text style={styles.infoText}>Latitude: {lojaInfo.latitude !== null ? lojaInfo.latitude : 'Não disponível'}</Text>
          <Text style={styles.infoText}>Longitude: {lojaInfo.longitude !== null ? lojaInfo.longitude : 'Não disponível'}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/loja/atualizar-perfil",
                params: { lojaId },
              })
            }
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Gerenciamento</Text>

        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname: "/loja/produtos",
                params: { lojaId },
              })
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(76, 175, 80, 0.1)" }]}>
              <Ionicons name="bicycle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.menuText}>Produtos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname: "/loja/servicos",
                params: { lojaId },
              })
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(33, 150, 243, 0.1)" }]}>
              <Ionicons name="construct" size={24} color="#2196F3" />
            </View>
            <Text style={styles.menuText}>Serviços</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname: "/loja/servicos/horarios",
                params: { lojaId },
              })
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(156, 39, 176, 0.1)" }]}>
              <Ionicons name="time" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.menuText}>Horários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(255, 152, 0, 0.1)" }]}>
              <Ionicons name="stats-chart" size={24} color="#FF9800" />
            </View>
            <Text style={styles.menuText}>Relatórios</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Atividade Recente</Text>

        <View style={styles.activityCard}>
          <Text style={styles.emptyStateText}>Nenhuma atividade recente para exibir.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

// Adicionar estilo para o container de loading
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D47A1",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  editButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(13, 71, 161, 0.1)",
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0D47A1",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  menuItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
})