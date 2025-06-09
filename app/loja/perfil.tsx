"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getPerfilLoja } from "../../lib/api"

export default function LojaPerfil() {
  const router = useRouter()
  const [lojaId, setLojaId] = useState<number | null>(null)
  const [lojaInfo, setLojaInfo] = useState({
    nome_loja: "",
    cnpj: "",
    endereco: "",
    cep: "",
    descricao: "",
    foto_path: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const id = await AsyncStorage.getItem("lojaId")
        if (id) {
          setLojaId(Number(id))
          try {
            const perfil = await getPerfilLoja(Number(id))

            // Verificar se perfil é um objeto com as propriedades esperadas
            if (perfil && typeof perfil === "object") {
              setLojaInfo({
                nome_loja: perfil.nome_loja || "",
                cnpj: perfil.cnpj || "",
                endereco: perfil.endereco || "",
                cep: perfil.cep || "",
                descricao: perfil.descricao || "",
                foto_path: perfil.foto_path,
              })
            } else {
              console.warn("Formato de perfil inesperado:", perfil)
              // Usar valores padrão
              setLojaInfo({
                nome_loja: "Minha Loja",
                cnpj: "",
                endereco: "",
                cep: "",
                descricao: "Sem descrição disponível",
                foto_path: null,
              })
            }
          } catch (error) {
            console.error("Erro ao buscar perfil:", error)
            // Usar valores padrão em caso de erro
            setLojaInfo({
              nome_loja: "Minha Loja",
              cnpj: "",
              endereco: "",
              cep: "",
              descricao: "Sem descrição disponível",
              foto_path: null,
            })
            // Não mostrar alerta para não interromper o fluxo do usuário
          }
        } else {
          Alert.alert("Erro", "Sessão expirada. Faça login novamente.")
          router.replace("/loja/login")
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarPerfil()
  }, [])

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("lojaId")
      router.replace("/welcome-screen")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const handleEditarPerfil = () => {
    router.push({
      pathname: "/loja/atualizar-perfil",
      params: { lojaId },
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil da Loja</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          {lojaInfo.foto_path ? (
            <Image source={{ uri: `https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev/${lojaInfo.foto_path}` }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="business-outline" size={50} color="#CCC" />
            </View>
          )}
          <Text style={styles.profileName}>{lojaInfo.nome_loja}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>CNPJ</Text>
            <Text style={styles.infoValue}>{lojaInfo.cnpj || "Não informado"}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Endereço</Text>
            <Text style={styles.infoValue}>{lojaInfo.endereco || "Não informado"}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>CEP</Text>
            <Text style={styles.infoValue}>{lojaInfo.cep || "Não informado"}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Descrição</Text>
            <Text style={styles.infoValue}>{lojaInfo.descricao || "Sem descrição"}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditarPerfil}>
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
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
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
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