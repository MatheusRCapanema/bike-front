"use client"

import { Tabs } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [userType, setUserType] = useState<"cliente" | "loja" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário já está logado e qual o tipo
    const checkUserType = async () => {
      try {
        const clienteId = await AsyncStorage.getItem("clienteId")
        const lojaId = await AsyncStorage.getItem("lojaId")

        if (clienteId) {
          setUserType("cliente")
        } else if (lojaId) {
          setUserType("loja")
        } else {
          setUserType(null)
        }
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserType()
  }, [])

  if (isLoading) {
    return null // Ou um componente de loading
  }

  // Se o usuário não estiver logado, mostrar apenas a tela de boas-vindas
  if (!userType) {
    return (
      <>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              href: "/",
            }}
          />
          <Tabs.Screen
            name="welcome-screen"
            options={{
              href: "/welcome-screen",
            }}
          />
          <Tabs.Screen
            name="cliente/login"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="cliente/registro"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="loja/login"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="loja/registro"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </>
    )
  }

  // Se for cliente, mostrar tabs do cliente
  if (userType === "cliente") {
    return (
      <>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#0D47A1",
            tabBarInactiveTintColor: "#999",
            tabBarStyle: {
              backgroundColor: "white",
              borderTopColor: "#E0E0E0",
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="cliente/dashboard"
            options={{
              title: "Início",
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
              href: "/cliente/dashboard",
            }}
          />
          <Tabs.Screen
            name="cliente/buscar"
            options={{
              title: "Buscar",
              tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
              href: "/cliente/buscar",
            }}
          />
          <Tabs.Screen
            name="cliente/agendamentos"
            options={{
              title: "Agenda",
              tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
              href: "/cliente/agendamentos",
            }}
          />
          <Tabs.Screen
            name="cliente/perfil"
            options={{
              title: "Perfil",
              tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
              href: "/cliente/perfil",
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="welcome-screen"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="cliente/login"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="cliente/registro"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </>
    )
  }

  // Se for loja, mostrar tabs da loja
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0D47A1",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            backgroundColor: "white",
            borderTopColor: "#E0E0E0",
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="loja/dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            href: "/loja/dashboard",
          }}
        />
        <Tabs.Screen
          name="loja/produtos"
          options={{
            title: "Produtos",
            tabBarIcon: ({ color, size }) => <Ionicons name="bicycle" size={size} color={color} />,
            href: "/loja/produtos",
          }}
        />
        <Tabs.Screen
          name="loja/servicos"
          options={{
            title: "Serviços",
            tabBarIcon: ({ color, size }) => <Ionicons name="construct" size={size} color={color} />,
            href: "/loja/servicos",
          }}
        />
        <Tabs.Screen
          name="loja/perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />,
            href: "/loja/perfil",
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="welcome-screen"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="loja/login"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="loja/registro"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  )
}
