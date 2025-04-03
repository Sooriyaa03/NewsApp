import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Animated } from "react-native";
import { db } from "../config/firebaseConfig"; // Import Firestore
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"; // Firestore functions

interface PollOption {
  option: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

const Polls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [animations, setAnimations] = useState<{ [key: string]: Animated.Value[] }>({});

  useEffect(() => {
    fetchPolls(); // Load polls from Firestore
  }, []);

  useEffect(() => {
    initializeAnimations();
  }, [polls]);

  // Fetch Polls from Firestore
  const fetchPolls = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "polls"));
      const fetchedPolls: Poll[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Poll[];
      setPolls(fetchedPolls);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  const initializeAnimations = () => {
    const newAnimations: { [key: string]: Animated.Value[] } = {};
    polls.forEach((poll) => {
      newAnimations[poll.id] = poll.options.map(() => new Animated.Value(0));
    });
    setAnimations(newAnimations);
  };

  // Function to vote for an option
  const vote = async (pollId: string, optionIndex: number) => {
    const pollRef = doc(db, "polls", pollId);
    const selectedPoll = polls.find((p) => p.id === pollId);
    if (!selectedPoll) return;

    const updatedOptions = selectedPoll.options.map((opt, index) =>
      index === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
    );

    try {
      await updateDoc(pollRef, { options: updatedOptions });
      fetchPolls(); // Refresh polls after voting
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  // Render each poll
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
