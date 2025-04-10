import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  Linking, // Import Linking for opening URLs
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Home() {
  const initialCategories = [
    "All",
    "Saves",
    "Business",
    "Politics",
    "Entertainment",
    "Sports",
    "Technology",
    "Health",
  ];
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newsData, setNewsData] = useState<{ [key: string]: any[] }>({
    All: [],
    Saves: [],
    Business: [],
    Politics: [],
    Entertainment: [],
    Sports: [],
    Technology: [],
    Health: [],
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [focusedIndex, setFocusedIndex] = useState<null | number>(null);
  const [swipeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log("Selected Category changed:", selectedCategory);
    if (selectedCategory === "Saves") {
      loadSavedNews();
    } else {
      fetchNews(selectedCategory);
    }
  }, [selectedCategory]);

  const loadSavedNews = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedNews");
      console.log("Raw saved data from AsyncStorage:", saved);
      const parsed = saved ? JSON.parse(saved) : [];
      console.log("Parsed saved data:", parsed);
      setNewsData((prev) => ({ ...prev, Saves: parsed }));
      console.log("News Data after loading saves:", newsData); // Log the state
    } catch (error) {
      console.error("Failed to load saved news:", error);
    }
  };

  const saveNewsItem = async (newsItem: any) => {
    try {
      const saved = await AsyncStorage.getItem("savedNews");
      const existing = saved ? JSON.parse(saved) : [];

      const isAlreadySaved = existing.some(
        (item: any) => item.url === newsItem.url
      );

      if (!isAlreadySaved) {
        const updated = [...existing, newsItem];
        await AsyncStorage.setItem("savedNews", JSON.stringify(updated));
        console.log("News saved to AsyncStorage:", updated);
        Alert.alert("Saved", "News saved successfully!");
        if (selectedCategory === "Saves") {
          loadSavedNews();
        }
      } else {
        Alert.alert("Already Saved", "This news is already in your saves.");
      }
    } catch (error) {
      console.error("Failed to save news:", error);
    }
  };

  const fetchNews = async (category: string) => {
    try {
      let fetchedNews = [];
      const apiKey = "8dd8c08f3b57496085f634d93edd7d76"; // Replace with your NewsAPI key
      let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&category=${category.toLowerCase()}`;

      if (category === "All") {
        const allPromises = initialCategories
          .filter((cat) => cat !== "All" && cat !== "Saves")
          .map((cat, index) => axios.get(`https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&category=${initialCategories[index + 2].toLowerCase()}`));

        const allResults = await Promise.all(allPromises);
        fetchedNews = allResults.flatMap((result, index) =>
          result.data.articles.map((newsItem: any) => ({
            ...newsItem,
            category: initialCategories[index + 2],
          }))
        );
      } else if (category !== "Saves") {
        const response = await axios.get(url);
        fetchedNews = response.data.articles;
      }

      setNewsData((prev) => ({
        ...prev,
        [category]: fetchedNews,
      }));
    } catch (error) {
      console.error("Failed to fetch news:", error.message);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    swipeAnimation.setValue(0);
  };

  const handleCloseFocus = () => {
    setFocusedIndex(null);
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (focusedIndex === null) return;

    const currentNewsArray = newsData[selectedCategory];
    if (!currentNewsArray) return;

    const nextIndex =
      direction === "left" ? focusedIndex + 1 : focusedIndex - 1;

    if (nextIndex >= 0 && nextIndex < currentNewsArray.length) {
      Animated.timing(swipeAnimation, {
        toValue: direction === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setFocusedIndex(nextIndex);
        swipeAnimation.setValue(0);
      });
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 30,
    onPanResponderEnd: (_, gestureState) => {
      if (gestureState.dx < -50) handleSwipe("left");
      else if (gestureState.dx > 50) handleSwipe("right");
    },
  });

  const topNews = newsData[selectedCategory]?.slice(0, 5);
  const remainingNews = newsData[selectedCategory]?.slice(5);

  console.log("Rendering with newsData:", newsData); // Log during render

  const focusedNewsItem = focusedIndex !== null ? newsData[selectedCategory]?.[focusedIndex] : null;

  const openArticle = (url: string | undefined) => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert("No Source", "Could not open the source of this article.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                category === "Saves" && styles.savesCategoryButton,
              ]}
              onPress={() => {
                setSelectedCategory(category);
                setFocusedIndex(null);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                  category === "Saves" && styles.savesCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {topNews && selectedCategory !== "Saves" && (
          <View style={styles.sliderContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
            >
              {topNews.map((news, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sliderCard}
                  onPress={() => handleFocus(index)}
                >
                  <Image source={{ uri: news.urlToImage }} style={styles.sliderImage} />
                  <Text style={styles.sliderTitle}>{news.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {focusedIndex === null ? (
          <ScrollView contentContainerStyle={styles.listContent}>
            {selectedCategory === "Saves" && newsData.Saves?.map((news, index) => (
              <TouchableOpacity
                key={index}
                style={styles.newsCard}
                onPress={() => handleFocus(index)}
              >
                <Image source={{ uri: news.urlToImage }} style={styles.thumbnail} />
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{news.title}</Text>
                  <Text style={styles.gist}>{news.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {selectedCategory !== "Saves" && remainingNews?.map((news, index) => (
              <TouchableOpacity
                key={index}
                style={styles.newsCard}
                onPress={() => handleFocus(index + 5)}
              >
                <Image source={{ uri: news.urlToImage }} style={styles.thumbnail} />
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{news.title}</Text>
                  <Text style={styles.gist}>{news.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Animated.View
            style={[styles.focusedView, { transform: [{ translateX: swipeAnimation }] }]}
            {...panResponder.panHandlers}
          >
            <ScrollView contentContainerStyle={styles.focusedScroll}>
              {focusedNewsItem?.urlToImage && (
                <Image
                  source={{ uri: focusedNewsItem.urlToImage }}
                  style={styles.focusedImage}
                />
              )}
              <View style={styles.focusedTextContainer}>
                <Text style={styles.focusedTitle}>
                  {focusedNewsItem?.title}
                </Text>
                <Text style={styles.focusedDetails}>
                  {focusedNewsItem?.content?.includes("[+")
                    ? focusedNewsItem?.description // Show description if content is truncated
                    : focusedNewsItem?.content || focusedNewsItem?.description}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseFocus}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                {focusedNewsItem?.url && (
                  <TouchableOpacity
                    style={[styles.openArticleButton, { marginTop: 10 }]}
                    onPress={() => openArticle(focusedNewsItem.url)}
                  >
                    <Text style={styles.openArticleButtonText}>Read Full Article</Text>
                  </TouchableOpacity>
                )}
                {selectedCategory !== "Saves" && (
                  <TouchableOpacity
                    style={[styles.saveButton, { marginTop: 10 }]}
                    onPress={() => saveNewsItem(focusedNewsItem)}
                  >
                    <Text style={styles.closeButtonText}>Save</Text>
                  </TouchableOpacity>
                )}
                {selectedCategory === "Saves" && (
                  <TouchableOpacity
                    style={[styles.deleteButton, { marginTop: 10 }]}
                    onPress={async () => {
                      if (focusedNewsItem) {
                        const saved = await AsyncStorage.getItem("savedNews");
                        const existing = saved ? JSON.parse(saved) : [];
                        const updated = existing.filter((item: any) => item.url !== focusedNewsItem.url);
                        await AsyncStorage.setItem("savedNews", JSON.stringify(updated));
                        setNewsData((prev) => ({ ...prev, Saves: updated }));
                        handleCloseFocus();
                        Alert.alert("Deleted", "News removed from saves.");
                      }
                    }}
                  >
                    <Text style={styles.closeButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  categoryContainer: {
    height: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingVertical: 10,
  },
  scrollContainer: { paddingHorizontal: 10, alignItems: "center" },
  categoryButton: { paddingHorizontal: 15 },
  categoryText: { fontSize: 14, color: "#6e6e6e" },
  selectedCategoryText: { fontWeight: "bold", color: "#333" },
  savesCategoryButton: {
    backgroundColor: "#fdd835",
    borderRadius: 5,
  },
  savesCategoryText: {
    color: "#212121",
    fontWeight: "bold",
  },

  sliderContainer: { paddingVertical: 10, marginBottom: 10 },
  sliderContent: { paddingHorizontal: 10 },
  sliderCard: {
    width: SCREEN_WIDTH * 0.7,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
  },
  sliderImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  sliderTitle: {
    padding: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  content: { flex: 1 },
  listContent: { paddingBottom: 50 },
  newsCard: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    alignItems: "center",
  },
  thumbnail: { width: 80, height: 80, borderRadius: 10 },
  textContainer: { flex: 1, marginLeft: 10 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  gist: { fontSize: 14, color: "#777" },

  focusedView: { flex: 1, backgroundColor: "#fff" },
  focusedScroll: { paddingBottom: 70 }, // Added more bottom padding
  focusedImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
  },
  focusedTextContainer: { padding: 15 },
  focusedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  focusedDetails: { fontSize: 16, color: "#555", marginBottom: 15 },
  closeButton: {
    backgroundColor: "#49664f",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#ff914d",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#be4040",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  openArticleButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  openArticleButtonText: { color: "#fff", fontSize: 16 },
  closeButtonText: { color: "#fff", fontSize: 16 },
});