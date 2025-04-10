import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [votedPolls, setVotedPolls] = useState<string[]>([]);

  useEffect(() => {
    fetchPolls();
    loadVotedPolls();
  }, []);

  // Load the IDs of polls the user has already voted in from AsyncStorage
  const loadVotedPolls = async () => {
    try {
      const storedVotedPolls = await AsyncStorage.getItem("votedPolls");
      if (storedVotedPolls) {
        setVotedPolls(JSON.parse(storedVotedPolls));
      }
    } catch (error) {
      console.error("Error loading voted polls:", error);
    }
  };

  // Save the ID of a voted poll to AsyncStorage
  const saveVotedPoll = async (pollId: string) => {
    try {
      const updatedVotedPolls = [...votedPolls, pollId];
      await AsyncStorage.setItem("votedPolls", JSON.stringify(updatedVotedPolls));
      setVotedPolls(updatedVotedPolls);
    } catch (error) {
      console.error("Error saving voted poll:", error);
    }
  };

  // Fetch Polls from Firestore and map 'text' to 'option'
  const fetchPolls = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "polls"));
      const fetchedPolls: Poll[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const mappedOptions = data.options.map((opt: { text: string; votes: number }) => ({
          option: opt.text, // Map 'text' from Firestore to 'option' in our interface
          votes: opt.votes,
        }));
        return {
          id: doc.id,
          question: data.question,
          options: mappedOptions,
        } as Poll;
      });
      setPolls(fetchedPolls);
      console.log("fetchPolls completed, polls state:", polls); // Debugging
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  // Function to vote for an option
  const vote = async (pollId: string, optionIndex: number) => {
    if (votedPolls.includes(pollId)) {
      Alert.alert("Already Voted", "You have already voted in this poll.");
      return;
    }

    const pollRef = doc(db, "polls", pollId);
    const selectedPoll = polls.find((p) => p.id === pollId);
    if (!selectedPoll) return;

    const updatedOptions = selectedPoll.options.map((opt, index) =>
      index === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
    );

    try {
      await updateDoc(pollRef, { options: updatedOptions });
      saveVotedPoll(pollId); // Mark this poll as voted
      fetchPolls(); // Refresh polls after voting. This will trigger a re-render.
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  // Render each poll
  const renderPoll = ({ item }: { item: Poll }) => {
    console.log("renderPoll called for item:", item); // Debugging
    const totalVotes = item.options.reduce((sum, opt) => sum + opt.votes, 0);
    const hasVoted = votedPolls.includes(item.id);

    return (
      <View style={styles.pollContainer}>
        <Text style={styles.pollQuestion}>{item.question}</Text>
        {item.options.map((opt, index) => {
          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          console.log(`  Option: ${opt.option}, Votes: ${opt.votes}, Percentage: ${percentage}`); // Debugging
          return (
            <View key={index} style={styles.optionContainer}>
              <TouchableOpacity
                style={[styles.voteButton, hasVoted && styles.votedButton]}
                onPress={() => vote(item.id, index)}
                disabled={hasVoted}
              >
                <Text style={[styles.voteButtonText, hasVoted && styles.votedButtonText]}>
                  {`${opt.option} - ${opt.votes} votes (${percentage.toFixed(1)}%) ${
                    hasVoted ? "(Voted)" : ""
                  }`}
                </Text>
              </TouchableOpacity>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${percentage}%` }, // Directly set width
                  ]}
                />
              </View>
            </View>
          );
        })}
        <Text style={styles.totalVotes}>Total Votes: {totalVotes}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={polls} keyExtractor={(item) => item.id} renderItem={renderPoll} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  pollContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionContainer: {
    marginBottom: 10,
  },
  voteButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  voteButtonText: {
    color: "#000",
  },
  votedButton: {
    backgroundColor: "#ccc",
  },
  votedButtonText: {
    color: "#666",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "blue",
    borderRadius: 4,
  },
  totalVotes: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
});

export default Polls;