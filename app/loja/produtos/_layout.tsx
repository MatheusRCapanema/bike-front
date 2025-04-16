import { Stack } from "expo-router"

export default function ProdutosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F5F7FA" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastrar" />
    </Stack>
  )
}
