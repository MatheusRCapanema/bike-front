// app/cliente/loja/[lojaId].tsx
"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://5000-idx-bikestoreapi-1744211447227.cluster-uf6urqn4lned4spwk4xorq6bpo.cloudworkstations.dev";

type Produto = {
  id: number;
  nome_produto: string;
  preco: number;
  image_path: string | null;
};

type Servico = {
  id: number;
  nome_servico: string;
  preco: number;
  descricao: string;
};

export default function StoreDetail() {
  const { lojaId } = useLocalSearchParams<{ lojaId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nomeLoja, setNomeLoja] = useState<string>("");

  useEffect(() => {
    if (!lojaId) return;
    (async () => {
      try {
        // 1) pega detalhes da loja
        const resLoja = await fetch(`${BASE_URL}/loja/${lojaId}`);
        if (!resLoja.ok) throw new Error(await resLoja.text());
        const jl = await resLoja.json();
        setNomeLoja(jl.nome_loja);

        // 2) produtos
        const resP = await fetch(`${BASE_URL}/loja/${lojaId}/produtos`);
        if (!resP.ok) throw new Error(await resP.text());
        setProdutos(await resP.json());

        // 3) serviços
        const resS = await fetch(`${BASE_URL}/loja/${lojaId}/servicos`);
        if (!resS.ok) throw new Error(await resS.text());
        setServicos((await resS.json()).servicos);
      } catch (e) {
        console.error(e);
        Alert.alert("Erro", "Não foi possível carregar os dados da loja.");
      } finally {
        setLoading(false);
      }
    })();
  }, [lojaId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* header com botão de volta */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{nomeLoja}</Text>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Produtos</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_path && (
              <Image
                source={{ uri: `${BASE_URL}${item.image_path}` }}
                style={styles.cardImage}
              />
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nome_produto}</Text>
              <Text style={styles.cardSubtitle}>
                R$ {item.preco.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={() => (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Serviços
            </Text>
            {servicos.length === 0 && (
              <Text style={styles.emptyText}>Nenhum serviço.</Text>
            )}
            {servicos.map((s) => (
              <View key={s.id} style={[styles.card, { marginTop: 12 }]}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{s.nome_servico}</Text>
                  <Text style={styles.cardSubtitle}>
                    R$ {s.preco.toFixed(2)}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {s.descricao}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    color: "#999",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 1,
  },
  cardImage: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  cardSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  cardDescription: { fontSize: 13, color: "#666", marginTop: 6 },
});