import React from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const stockData = [
  { name: "AAPL", price: "$180.20", change: "+3.45%" },
  { name: "TSLA", price: "$210.50", change: "+5.12%" },
  { name: "AMZN", price: "$145.80", change: "+2.87%" },
  { name: "GOOGL", price: "$2750.00", change: "+1.98%" },
  { name: "MSFT", price: "$315.75", change: "+4.10%" },
  { name: "NFLX", price: "$420.30", change: "-2.75%" },
  { name: "NVDA", price: "$490.10", change: "-3.60%" },
  { name: "META", price: "$310.50", change: "-1.90%" },
  { name: "BABA", price: "$78.20", change: "-2.15%" },
  { name: "AMD", price: "$105.40", change: "-4.25%" },
];

export default function StockScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's High & Low</Text>
      <FlatList
        data={stockData}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent} // Added bottom padding
        renderItem={({ item }) => (
          <View style={styles.stockItem}>
            <Text style={styles.stockName}>{item.name}</Text>
            <Text style={styles.stockPrice}>{item.price}</Text>
            <Text
              style={[
                styles.stockChange,
                { color: item.change.includes("+") ? "green" : "red" },
              ]}
            >
              {item.change}
            </Text>
            <MaterialCommunityIcons
              name={item.change.includes("+") ? "chart-line" : "chart-line-variant"}
              size={24}
              color={item.change.includes("+") ? "green" : "red"}
              style={styles.graphIcon}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
    backgroundColor: "#fafafa",
  },
  listContent: {
    paddingBottom: 80, // Matches spacing from index.tsx
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafe",
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1.2,
    textAlign: "left",
  },
  stockPrice: {
    fontSize: 16,
    color: "#666",
    flex: 1,
    textAlign: "center",
  },
  stockChange: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  graphIcon: {
    flex: 1,
    textAlign: "right",
  },
});
