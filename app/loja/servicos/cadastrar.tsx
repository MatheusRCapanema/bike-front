"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { cadastrarServico } from "../../../lib/api"

export default function CadastrarServicoScreen() {
  const router = useRouter()
  const { lojaId } = useLocalSearchParams()

  const [nomeServico, setNomeServico] = useState("")
  const [preco, setPreco] = useState("")
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCadastrarServico = async () => {
    if (!nomeServico || !preco) {
      Alert.alert("Erro", "Nome do serviço e preço são obrigatórios.")
      return
    }

    const precoNumerico = Number.parseFloat(preco.replace(",", "."))
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      Alert.alert("Erro", "Preço inválido.")
      return
    }

    setLoading(true)
    try {
      await cadastrarServico(Number(lojaId), nomeServico, precoNumerico, descricao)

      Alert.alert("Sucesso", "Serviço cadastrado com sucesso!", [{ text: "OK", onPress: () => router.back() }])
    } catch (error) {
      console.error("Erro ao cadastrar serviço:", error)
      Alert.alert("Erro", "Não foi possível cadastrar o serviço.")
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
        <Text style={styles.headerTitle}>Cadastrar Serviço</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do Serviço</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Manutenção de Freios"
              value={nomeServico}
              onChangeText={setNomeServico}
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
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o serviço oferecido..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.cadastrarButton} onPress={handleCadastrarServico} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.cadastrarButtonText}>Cadastrar Serviço</Text>
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
