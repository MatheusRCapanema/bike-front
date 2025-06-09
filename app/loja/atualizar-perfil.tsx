"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
// Atualizar o import da API
import { atualizarPerfilLoja, getPerfilLoja } from "../../lib/api"

export default function AtualizarPerfilScreen() {
  const router = useRouter()
  const { lojaId } = useLocalSearchParams()

  const [nomeLoja, setNomeLoja] = useState("")
  const [descricao, setDescricao] = useState("")
  const [imagem, setImagem] = useState<string | null>(null)
  const [atualizarLocalizacao, setAtualizarLocalizacao] = useState(false)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const carregarPerfil = async () => {
      if (!lojaId) return

      try {
        setLoading(true)
        const perfil = await getPerfilLoja(Number(lojaId))
        setNomeLoja(perfil.nome_loja || "")
        setDescricao(perfil.descricao || "")
        if (perfil.foto_path) {
          setImagem(`https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev/${perfil.foto_path}`)
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        Alert.alert("Erro", "Não foi possível carregar os dados do perfil.")
      } finally {
        setLoading(false)
      }
    }

    carregarPerfil()
  }, [lojaId])

  const obterLocalizacaoAtual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Precisamos da permissão de localização para atualizar sua posição no mapa.")
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation)
      Alert.alert("Sucesso", "Localização atual capturada com sucesso!")
    } catch (error) {
      console.error("Erro ao obter localização:", error)
      Alert.alert("Erro", "Não foi possível obter sua localização atual.")
    }
  }

  const selecionarImagem = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissao.granted) {
        Alert.alert("Permissão negada", "Precisamos de permissão para acessar suas fotos.")
        return
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!resultado.canceled) {
        setImagem(resultado.assets[0].uri)
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error)
      Alert.alert("Erro", "Não foi possível selecionar a imagem.")
    }
  }

  const tirarFoto = async () => {
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissao.granted) {
        Alert.alert("Permissão negada", "Precisamos de permissão para acessar sua câmera.")
        return
      }

      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!resultado.canceled) {
        setImagem(resultado.assets[0].uri)
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error)
      Alert.alert("Erro", "Não foi possível tirar a foto.")
    }
  }

  const handleSalvar = async () => {
    if (!nomeLoja) {
      Alert.alert("Erro", "O nome da loja é obrigatório.")
      return
    }

    setSalvando(true)
    try {
      const latitude = atualizarLocalizacao && location ? location.coords.latitude : undefined
      const longitude = atualizarLocalizacao && location ? location.coords.longitude : undefined

      await atualizarPerfilLoja(Number(lojaId), nomeLoja, descricao, latitude, longitude, imagem)

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [{ text: "OK", onPress: () => router.back() }])
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      Alert.alert("Erro", "Não foi possível atualizar o perfil.")
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D47A1" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Atualizar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="business-outline" size={40} color="#CCC" />
            </View>
          )}

          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={[styles.imageButton, { backgroundColor: "#4CAF50" }]} onPress={tirarFoto}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.imageButtonText}>Câmera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.imageButton, { backgroundColor: "#2196F3" }]} onPress={selecionarImagem}>
              <Ionicons name="images" size={20} color="white" />
              <Text style={styles.imageButtonText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome da Loja</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da sua loja"
              value={nomeLoja}
              onChangeText={setNomeLoja}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva sua loja..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Atualizar localização</Text>
              <Text style={styles.switchDescription}>Ative para atualizar a localização da loja no mapa</Text>
            </View>
            <Switch
              value={atualizarLocalizacao}
              onValueChange={setAtualizarLocalizacao}
              trackColor={{ false: "#E0E0E0", true: "rgba(13, 71, 161, 0.4)" }}
              thumbColor={atualizarLocalizacao ? "#0D47A1" : "#FFF"}
            />
          </View>

          {atualizarLocalizacao && (
            <TouchableOpacity style={styles.locationButton} onPress={obterLocalizacaoAtual}>
              <Ionicons name="location" size={20} color="#0D47A1" />
              <Text style={styles.locationButtonText}>
                {location ? "Localização capturada" : "Capturar localização atual"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.salvarButton} onPress={handleSalvar} disabled={salvando}>
            {salvando ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.salvarButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
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
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  imageButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F7FA",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F5F7FA",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: "#666",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13, 71, 161, 0.1)",
    height: 50,
    borderRadius: 8,
    marginBottom: 24,
  },
  locationButtonText: {
    color: "#0D47A1",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  salvarButton: {
    backgroundColor: "#0D47A1",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  salvarButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
