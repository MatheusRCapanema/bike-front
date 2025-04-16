"use client"

import { useState } from "react"
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
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
// Atualizar o import da API
import { cadastrarProdutoComImagem } from "../../../lib/api"

export default function CadastrarProdutoScreen() {
  const router = useRouter()
  const { lojaId } = useLocalSearchParams()

  const [nomeProduto, setNomeProduto] = useState("")
  const [preco, setPreco] = useState("")
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("")
  const [imagem, setImagem] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  const handleCadastrarProduto = async () => {
    if (!nomeProduto || !preco || !quantidadeEstoque || !imagem) {
      Alert.alert("Erro", "Preencha todos os campos e selecione uma imagem.")
      return
    }

    const precoNumerico = Number.parseFloat(preco.replace(",", "."))
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      Alert.alert("Erro", "Preço inválido.")
      return
    }

    const quantidadeNumerica = Number.parseInt(quantidadeEstoque)
    if (isNaN(quantidadeNumerica) || quantidadeNumerica < 0) {
      Alert.alert("Erro", "Quantidade de estoque inválida.")
      return
    }

    setLoading(true)
    try {
      await cadastrarProdutoComImagem(Number(lojaId), nomeProduto, precoNumerico, quantidadeNumerica, imagem)

      Alert.alert("Sucesso", "Produto cadastrado com sucesso!", [{ text: "OK", onPress: () => router.back() }])
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error)
      Alert.alert("Erro", "Não foi possível cadastrar o produto.")
    } finally {
      setLoading(false)
    }
  }

  const formatarPreco = (texto: string) => {
    // Remove tudo que não for número ou vírgula
    const apenasNumerosEVirgula = texto.replace(/[^\d,]/g, "")

    // Garante que só tenha uma vírgula
    const partes = apenasNumerosEVirgula.split(",")
    if (partes.length > 2) {
      return partes[0] + "," + partes[1]
    }

    return apenasNumerosEVirgula
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Produto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color="#CCC" />
              <Text style={styles.placeholderText}>Selecione uma imagem</Text>
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
            <Text style={styles.label}>Nome do Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Capacete MTB"
              value={nomeProduto}
              onChangeText={setNomeProduto}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 99,90"
              value={preco}
              onChangeText={(text) => setPreco(formatarPreco(text))}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantidade em Estoque</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              value={quantidadeEstoque}
              onChangeText={setQuantidadeEstoque}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity style={styles.cadastrarButton} onPress={handleCadastrarProduto} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.cadastrarButtonText}>Cadastrar Produto</Text>
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
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
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
  cadastrarButton: {
    backgroundColor: "#0D47A1",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  cadastrarButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
