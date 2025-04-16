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
import { registrarLoja } from "../../lib/api"

export default function LojaRegistro() {
  const [nomeLoja, setNomeLoja] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState("")
  const [complemento, setComplemento] = useState("")
  const [lote, setLote] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
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

      try {
        const currentLocation = await Location.getCurrentPositionAsync({})
        setLocation(currentLocation)
      } catch (error) {
        console.log("Erro ao obter localização:", error)
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

  const formatCEP = (text: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, "")

    // Aplica a máscara de CEP: XXXXX-XXX
    let formatted = cleaned
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
    }

    return formatted
  }

  const handleRegistro = async () => {
    if (!nomeLoja || !cnpj || !cep || !endereco || !lote || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem")
      return
    }

    // Validação básica de CNPJ (apenas verifica se tem 14 dígitos)
    const cnpjLimpo = cnpj.replace(/\D/g, "")
    if (cnpjLimpo.length !== 14) {
      Alert.alert("Erro", "CNPJ inválido")
      return
    }

    // Validação básica de CEP (apenas verifica se tem 8 dígitos)
    const cepLimpo = cep.replace(/\D/g, "")
    if (cepLimpo.length !== 8) {
      Alert.alert("Erro", "CEP inválido")
      return
    }

    // Verificar se temos a localização
    if (!location) {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({})
        setLocation(currentLocation)
      } catch (error) {
        Alert.alert("Erro", "Não foi possível obter sua localização. Verifique se o GPS está ativado.")
        return
      }
    }

    setLoading(true)
    try {
      const latitude = location?.coords.latitude
      const longitude = location?.coords.longitude

      const response = await registrarLoja(
        nomeLoja,
        cnpjLimpo,
        cepLimpo,
        endereco,
        complemento,
        lote,
        senha,
        latitude,
        longitude,
      )

      Alert.alert("Sucesso", response.mensagem, [{ text: "OK", onPress: () => router.push("/loja/login") }])
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao registrar")
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
          <Text style={styles.title}>Cadastro de Loja</Text>
          <Text style={styles.subtitle}>Crie sua conta para começar</Text>
        </View>

        <View style={styles.locationHint}>
          <Ionicons name="location" size={20} color="#0D47A1" />
          <Text style={styles.locationHintText}>
            Importante: Faça o cadastro no local da sua loja para registrar a localização correta no mapa.
          </Text>
        </View>

        <View style={styles.form}>
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
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={styles.input}
              placeholder="00000-000"
              value={cep}
              onChangeText={(text) => setCep(formatCEP(text))}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, Avenida, etc."
              value={endereco}
              onChangeText={setEndereco}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput style={styles.input} placeholder="Opcional" value={complemento} onChangeText={setComplemento} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lote/Número</Text>
            <TextInput style={styles.input} placeholder="Número" value={lote} onChangeText={setLote} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Crie uma senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegistro} disabled={loading}>
            <Text style={styles.registerButtonText}>{loading ? "Cadastrando..." : "Cadastrar"}</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/loja/login")}>
              <Text style={styles.loginLink}>Faça login</Text>
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
    marginTop: 10,
    marginBottom: 20,
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
  locationHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 71, 161, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationHintText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0D47A1",
  },
  form: {
    width: "100%",
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
  registerButton: {
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
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#1E88E5",
    fontSize: 14,
    fontWeight: "600",
  },
})
