import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PollOption {
  option: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

const samplePolls: Poll[] = [
  {
    id: "1",
    question: "Do you think AI regulations should be stricter?",
    options: [
      { option: "Yes", votes: 0 },
      { option: "No", votes: 0 },
      { option: "Not Sure", votes: 0 },
    ],
  },
  {
    id: "2",
    question: "Who will win the upcoming elections?",
    options: [
      { option: "Candidate A", votes: 0 },
      { option: "Candidate B", votes: 0 },
      { option: "Undecided", votes: 0 },
    ],
  },
  {
    id: "3",
    question: "Should social media platforms ban political ads?",
    options: [
      { option: "Yes", votes: 0 },
      { option: "No", votes: 0 },
      { option: "Maybe", votes: 0 },
    ],
  },
];

const Polls = () => {
  const [polls, setPolls] = useState<Poll[]>(samplePolls);
  const [animations, setAnimations] = useState<{ [key: string]: Animated.Value[] }>({});

  useEffect(() => {
    loadPolls();
  }, []);

  useEffect(() => {
    initializeAnimations();
  }, [polls]);

  const loadPolls = async () => {
    try {
      const storedPolls = await AsyncStorage.getItem("polls");
      if (storedPolls) {
        setPolls(JSON.parse(storedPolls));
      }
    } catch (error) {
      console.error("Error loading polls:", error);
    }
  };

  const savePolls = async (updatedPolls: Poll[]) => {
    try {
      await AsyncStorage.setItem("polls", JSON.stringify(updatedPolls));
      setPolls(updatedPolls);
    } catch (error) {
      console.error("Error saving polls:", error);
    }
  };

  const initializeAnimations = () => {
    const newAnimations: { [key: string]: Animated.Value[] } = {};
    polls.forEach((poll) => {
      newAnimations[poll.id] = poll.options.map(() => new Animated.Value(0));
    });
    setAnimations(newAnimations);
  };

  const animateBar = (pollId: string, optionIndex: number, percentage: number) => {
    Animated.timing(animations[pollId][optionIndex], {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const vote = (pollId: string, optionIndex: number) => {
    const updatedPolls = polls.map((poll) => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map((opt, index) =>
          index === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...poll, options: updatedOptions };
      }
      return poll;
    });
    savePolls(updatedPolls);
    
    const totalVotes = updatedPolls.find((p) => p.id === pollId)?.options.reduce((sum, opt) => sum + opt.votes, 0) || 1;
    const newPercentage = (updatedPolls.find((p) => p.id === pollId)?.options[optionIndex].votes || 0) / totalVotes * 100;
    animateBar(pollId, optionIndex, newPercentage);
  };

  const renderPoll = ({ item }: { item: Poll }) => {
    const totalVotes = item.options.reduce((sum, opt) => sum + opt.votes, 0);
    return (
      <View style={{ padding: 16, backgroundColor: "#fff", marginBottom: 10, borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>{item.question}</Text>
        {item.options.map((opt, index) => {
          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          return (
            <View key={index} style={{ marginBottom: 10 }}>
              <TouchableOpacity
                style={{ padding: 10, backgroundColor: "#eee", borderRadius: 5 }}
                onPress={() => vote(item.id, index)}
              >
                <Text>{`${opt.option} - ${opt.votes} votes (${percentage.toFixed(1)}%)`}</Text>
              </TouchableOpacity>
              <View style={{ height: 8, backgroundColor: "#ddd", borderRadius: 4, marginTop: 5 }}>
                <Animated.View
                  style={{
                    height: 8,
                    backgroundColor: "green",
                    borderRadius: 4,
                    width: animations[item.id]?.[index]?.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }) || "0%",
                  }}
                />
              </View>
            </View>
          );
        })}
        <Text style={{ fontSize: 14, color: "gray", marginTop: 5 }}>Total Votes: {totalVotes}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      <FlatList data={polls} keyExtractor={(item) => item.id} renderItem={renderPoll} />
    </View>
  );
};

export default Polls;
