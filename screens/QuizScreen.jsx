import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const questions = [
  {
    id: 1,
    question: "Does your partner frequently insult or criticize you?",
    options: ["Never", "Sometimes", "Often", "Always"],
    scores: [0, 1, 2, 3],
  },
  {
    id: 2,
    question: "Do you feel afraid of your partner?",
    options: ["Never", "Rarely", "Often", "Always"],
    scores: [0, 1, 2, 3],
  },
  {
    id: 3,
    question: "Are you being controlled financially or socially?",
    options: ["Not at all", "A little", "Somewhat", "Completely"],
    scores: [0, 1, 2, 3],
  },
  {
    id: 4,
    question: "Has your partner ever physically hurt you?",
    options: ["No", "Once", "A few times", "Regularly"],
    scores: [0, 1, 2, 3],
  },
  {
    id: 5,
    question: "Does your partner monitor your phone, messages, or social media?",
    options: ["Never", "Sometimes", "Often", "Always"],
    scores: [0, 1, 2, 3],
  },
];

export default function QuizScreen({ navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setIsAnimating(false));
  }, [currentQuestion]);

  const handleOptionPress = (optionIndex) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const question = questions[currentQuestion];
    const questionScore = question.scores[optionIndex];
    const newScore = score + questionScore;
    setScore(newScore);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        navigation.navigate('Result', { score: newScore });
      }
    });
  };

  const question = questions[currentQuestion];

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Relationship Safety Assessment</Text>
          <Text style={styles.subtitle}>Answer honestly to evaluate your relationship</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.questionHeader}>
            <View style={styles.questionNumberContainer}>
              <Text style={styles.questionNumber}>Q{question.id}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  index === 0 && styles.firstOption,
                  index === question.options.length - 1 && styles.lastOption,
                ]}
                onPress={() => handleOptionPress(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your answers are confidential and anonymous
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 15,
    justifyContent: 'flex-start',
  },
  header: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 15,
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  questionNumberContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 30,
    marginBottom: 30,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: '#f8fafc',
    padding: 20,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  firstOption: {
    marginTop: 0,
  },
  lastOption: {
    marginBottom: 0,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});
