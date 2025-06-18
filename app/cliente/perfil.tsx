"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

type ClienteInfo = {
  nome: string
  cpf: string
  idade: number
}

const BASE_URL =
  "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev"

export default function ClientePerfil() {
  const router = useRouter()
  const [info, setInfo] = useState<ClienteInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const idStr = await AsyncStorage.getItem("clienteId")
      if (!idStr) {
        setLoading(false)
        return router.replace("/welcome-screen")
      }
      const id = Number(idStr)
      try {
        const res = await fetch(`${BASE_URL}/clientes/me?cliente_id=${id}`)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setInfo({ nome: json.nome, cpf: json.cpf, idade: json.idade })
      } catch (e) {
        console.error("Erro ao carregar perfil:", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleLogout = async () => {
    await AsyncStorage.removeItem("clienteId")
    router.replace("/welcome-screen")
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!info) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Não foi possível carregar os dados.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={50} color="#CCC" />
          </View>
          <Text style={styles.profileName}>{info.nome}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>CPF</Text>
            <Text style={styles.infoValue}>{info.cpf}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Idade</Text>
            <Text style={styles.infoValue}>{info.idade} anos</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* aqui ainda pode ter menu de opções, se quiser */}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: { justifyContent: "center", alignItems: "center" },
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0D47A1" },
  logoutButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: { marginBottom: 16 },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  infoValue: { fontSize: 16, color: "#333" },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D47A1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 16,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})