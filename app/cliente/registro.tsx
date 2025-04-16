"use client"

import { useState } from "react"
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
// Atualizar o import da API
import { registrarCliente } from "../../lib/api"

export default function ClienteRegistro() {
  const [nome, setNome] = useState("")
  const [idade, setIdade] = useState("")
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const formatCPF = (text: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, "")

    // Aplica a máscara de CPF: XXX.XXX.XXX-XX
    let formatted = cleaned
    if (cleaned.length > 9) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    } else if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    }

    return formatted
  }

  const handleRegistro = async () => {
    // Validação básica dos campos
    if (!nome || !idade || !cpf || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos")
      return
    }
  
    // Validação de senhas iguais
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem")
      return
    }
  
    // Validação básica de CPF
    const cpfLimpo = cpf.replace(/\D/g, "")
    if (cpfLimpo.length !== 11) {
      Alert.alert("Erro", "CPF inválido")
      return
    }
  
    // Validação de idade
    const idadeNum = Number.parseInt(idade)
    if (isNaN(idadeNum) || idadeNum < 1 || idadeNum > 120) {
      Alert.alert("Erro", "Idade inválida")
      return
    }
  
    setLoading(true)
    console.log("handleRegistro iniciado...")
  
    try {
      console.log("Enviando dados para registrarCliente...")
      const response = await registrarCliente(nome, idadeNum, cpfLimpo, senha)
      // Aqui 'response' deve ser o JSON retornado pelo backend
      // Ex.: { mensagem: "Cliente registrado com sucesso", cliente_id: <id> }
  
      console.log("Resposta do backend:", response)
  
      // Mostra o alerta de sucesso e redireciona para a tela de login
      Alert.alert(
        "Sucesso",
        response.mensagem,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Navegando para /cliente/login")
              router.push("/cliente/login")
            },
          },
        ],
        { cancelable: false }
      )
    } catch (error: any) {
      // Caso dê erro na requisição ou no backend
      console.error("Erro ao registrar cliente:", error)
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
          <Text style={styles.title}>Cadastro de Ciclista</Text>
          <Text style={styles.subtitle}>Crie sua conta para começar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} placeholder="Seu nome completo" value={nome} onChangeText={setNome} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Idade</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua idade"
              value={idade}
              onChangeText={setIdade}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />
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
            <TouchableOpacity onPress={() => router.push("/cliente/login")}>
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
    marginBottom: 30,
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
