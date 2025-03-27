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
} from "react-native";
import axios from "axios";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Home() {
  const [categories] = useState<string[]>([
    "All",
    "Business",
    "Politics",
    "Entertainment",
    "Sports",
    "Technology",
    "Health",
  ]);
  const [newsData, setNewsData] = useState<{ [key: string]: any[] }>({
    All: [],
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
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  // Function to fetch news data from NewsAPI
  const fetchNews = async (category: string) => {
    try {
      let fetchedNews = [];

      const apiKey = "8dd8c08f3b57496085f634d93edd7d76"; // Replace with your NewsAPI key
      let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&category=${category.toLowerCase()}`;

      // If 'All' category is selected, fetch news for all categories and merge
      if (category === "All") {
        const allPromises = categories
          .filter((cat) => cat !== "All")
          .map((cat) => axios.get(`https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&category=${cat.toLowerCase()}`));

        const allResults = await Promise.all(allPromises);
        fetchedNews = allResults.flatMap((result, index) =>
          result.data.articles.map((newsItem: any) => ({
            ...newsItem,
            category: categories[index + 1],
          }))
        );
      } else {
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

    const nextIndex =
      direction === "left" ? focusedIndex + 1 : focusedIndex - 1;

    if (nextIndex >= 0 && nextIndex < newsData[selectedCategory]?.length) {
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

  // Get the top 5 news for the slider from the fetched data
  const topNews = newsData[selectedCategory]?.slice(0, 5);
  const remainingNews = newsData[selectedCategory]?.slice(5); // Exclude the first 5 from the main list

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
              style={styles.categoryButton}
              onPress={() => {
                setSelectedCategory(category);
                setFocusedIndex(null);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {/* Horizontal Slider for top 5 news */}
        {topNews && (
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

        {/* Main News List */}
        {focusedIndex === null ? (
          <ScrollView contentContainerStyle={styles.listContent}>
            {/* Render the rest of the news excluding the first 5 displayed in the slider */}
            {remainingNews?.map((news, index) => (
              <TouchableOpacity
                key={index}
                style={styles.newsCard}
                onPress={() => handleFocus(index + 5)} // Adjust the index for the remaining news
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
              <Image
                source={{ uri: newsData[selectedCategory][focusedIndex]?.urlToImage }}
                style={styles.focusedImage}
              />
              <View style={styles.focusedTextContainer}>
                <Text style={styles.focusedTitle}>
                  {newsData[selectedCategory][focusedIndex]?.title}
                </Text>
                <Text style={styles.focusedDetails}>
                  {newsData[selectedCategory][focusedIndex]?.content}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseFocus}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
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

  // Slider Styles
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

  // News List Styles
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

  focusedView: { flex: 1 },
  focusedScroll: { paddingBottom: 50 },
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
  closeButtonText: { color: "#fff", fontSize: 16 },
});
