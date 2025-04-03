import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API_KEY = "4Y5BDK2GXTM17POA"; // Your API key

// Define stock symbols for both Global and Indian markets
const GLOBAL_STOCKS = ["AAPL", "TSLA", "AMZN", "GOOGL", "MSFT"];
const INDIAN_STOCKS = ["RELIANCE.BSE", "TCS.BSE", "INFY.BSE", "HDFCBANK.BSE", "ICICIBANK.BSE"];

export default function StockScreen() {
  const [globalStockData, setGlobalStockData] = useState([]);
  const [indianStockData, setIndianStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      // Fetch Global Stocks
      const fetchedGlobalData = await Promise.all(
        GLOBAL_STOCKS.map(async (symbol) => {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
          );
          const data = await response.json();
          const quote = data["Global Quote"];
          if (!quote || !quote["01. symbol"] || !quote["05. price"]) {
            console.warn(`No data for ${symbol}`);
            return null;
          }
          return {
            name: quote["01. symbol"],
            price: `$${parseFloat(quote["05. price"]).toFixed(2)}`,
            change: quote["10. change percent"] ? (parseFloat(quote["10. change percent"]) > 0 ? `+${quote["10. change percent"]}` : quote["10. change percent"]) : "N/A",
          };
        })
      );

      // Fetch Indian Stocks
      const fetchedIndianData = await Promise.all(
        INDIAN_STOCKS.map(async (symbol) => {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
          );
          const data = await response.json();
          const quote = data["Global Quote"];
          if (!quote || !quote["01. symbol"] || !quote["05. price"]) {
            console.warn(`No data for ${symbol}`);
            return null;
          }
          return {
            name: quote["01. symbol"],
            price: `₹${parseFloat(quote["05. price"]).toFixed(2)}`,
            change: quote["10. change percent"] ? (parseFloat(quote["10. change percent"]) > 0 ? `+${quote["10. change percent"]}` : quote["10. change percent"]) : "N/A",
          };
        })
      );

      setGlobalStockData(fetchedGlobalData.filter(item => item !== null));
      setIndianStockData(fetchedIndianData.filter(item => item !== null));
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Market Overview</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Global Stocks</Text>
          <FlatList
            data={globalStockData}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => item && (
              <StockItem name={item.name} price={item.price} change={item.change} />
            )}
          />
          <Text style={styles.sectionTitle}>Indian Stocks</Text>
          <FlatList
            data={indianStockData}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => item && (
              <StockItem name={item.name} price={item.price} change={item.change} />
            )}
          />
        </>
      )}
    </View>
  );
}

const StockItem = ({ name, price, change }) => (
  <View style={styles.stockItem}>
    <Text style={styles.stockName}>{name}</Text>
    <Text style={styles.stockPrice}>{price}</Text>
    <Text style={[styles.stockChange, { color: change.includes("+") ? "green" : "red" }]}>
      {change}
    </Text>
    <MaterialCommunityIcons
      name={change.includes("+") ? "chart-line" : "chart-line-variant"}
      size={24}
      color={change.includes("+") ? "green" : "red"}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: "#222" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#007AFF", textAlign: "left" },
  stockItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fafafe", padding: 15, marginVertical: 6, borderRadius: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  stockName: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1.2, textAlign: "left" },
  stockPrice: { fontSize: 16, color: "#666", flex: 1, textAlign: "center" },
  stockChange: { fontSize: 16, fontWeight: "bold", flex: 1, textAlign: "center" },
});