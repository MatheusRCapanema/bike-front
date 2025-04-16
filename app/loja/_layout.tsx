import { Stack } from "expo-router"

export default function LojaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F5F7FA" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="produtos" />
      <Stack.Screen name="servicos" />
      <Stack.Screen name="atualizar-perfil" />
      <Stack.Screen name="perfil" />
    </Stack>
  )
}
