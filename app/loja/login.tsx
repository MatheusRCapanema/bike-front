"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
// Atualizar o import da API
import { loginLoja } from "../../lib/api"

export default function LojaLogin() {
  const [cnpj, setCnpj] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)

  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Precisamos da permissão de localização para funcionar corretamente.")
        return
      }
    })()
  }, [])

  const formatCNPJ = (text: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, "")

    // Aplica a máscara de CNPJ: XX.XXX.XXX/XXXX-XX
    let formatted = cleaned
    if (cleaned.length > 12) {
      formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
    } else if (cleaned.length > 8) {
      formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
    } else if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
    } else if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
    }

    return formatted
  }

  const handleLogin = async () => {
    if (!cnpj || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos")
      return
    }

    // Obter localização atual
    try {
      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter sua localização. Verifique se o GPS está ativado.")
      return
    }

    // Remove formatação do CNPJ antes de enviar
    const cnpjLimpo = cnpj.replace(/\D/g, "")

    setLoading(true)
    try {
      const response = await loginLoja(cnpjLimpo, senha)
      Alert.alert("Sucesso", response.mensagem)
      // Armazenar o ID da loja e localização em algum estado global ou AsyncStorage
      router.push("/loja/dashboard")
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Login da Loja</Text>
          <Text style={styles.subtitle}>Entre com suas credenciais</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CNPJ</Text>
            <TextInput
              style={styles.input}
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChangeText={(text) => setCnpj(formatCNPJ(text))}
              keyboardType="numeric"
              maxLength={18}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginButtonText}>{loading ? "Entrando..." : "Entrar"}</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/loja/registro")}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: "#1E88E5",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#1E88E5",
    fontSize: 14,
    fontWeight: "600",
  },
})
