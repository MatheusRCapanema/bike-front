"use client"
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1E88E5", "#0D47A1"]} style={styles.background} />

      <View style={styles.logoContainer}>
        <Image source={{ uri: "/placeholder.svg?height=120&width=120" }} style={styles.logo} />
        <Text style={styles.appName}>Cyclism</Text>
        <Text style={styles.tagline}>Sua jornada sobre duas rodas</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.clientButton]} onPress={() => router.push("/cliente/login")}>
          <Text style={styles.buttonText}>Sou Ciclista</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.storeButton]} onPress={() => router.push("/loja/login")}>
          <Text style={styles.buttonText}>Sou Loja</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Conectando ciclistas e lojas especializadas</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.15,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 30,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clientButton: {
    backgroundColor: "white",
  },
  storeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "white",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D47A1",
  },
  footer: {
    marginBottom: 40,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
})
