import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ResultScreen({ route, navigation }) {
  const { score } = route.params;
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scoreDisplay, setScoreDisplay] = useState(0);

  const resultCategory = score <= 4 ? 'low' : score <= 8 ? 'medium' : 'high';

  const colorSchemes = {
    low: {
      primary: '#10b981',
      secondary: '#d1fae5',
      bg: '#ecfdf5',
    },
    medium: {
      primary: '#f59e0b',
      secondary: '#fef3c7',
      bg: '#fffbeb',
    },
    high: {
      primary: '#ef4444',
      secondary: '#fee2e2',
      bg: '#fef2f2',
    },
  };

  const colors = colorSchemes[resultCategory];

  const getResultMessage = () => {
    if (score <= 4) {
      return {
        title: 'Your Relationship Appears Healthy',
        message:
          'Based on your responses, your relationship shows signs of mutual respect and healthy boundaries. Continue to nurture open communication and trust.',
        action: 'Keep building a healthy partnership',
        icon: '✅',
      };
    } else if (score <= 8) {
      return {
        title: 'Some Concerns Detected',
        message:
          'Your responses indicate some concerning behaviors in your relationship. These may be signs of emotional manipulation or controlling behavior that could escalate.',
        action: 'Consider seeking relationship counseling',
        icon: '⚠️',
      };
    } else {
      return {
        title: 'Potential Abuse Detected',
        message:
          'Your responses suggest patterns consistent with abusive relationships. Your safety is paramount. Abuse is never acceptable and never your fault.',
        action: 'Reach out for help immediately',
        icon: '❗',
      };
    }
  };

  const result = getResultMessage();

  useEffect(() => {
    let currentScore = 0;
    const increment = score > 20 ? 3 : 1;
    const timer = setInterval(() => {
      currentScore += increment;
      if (currentScore >= score) {
        currentScore = score;
        clearInterval(timer);
      }
      setScoreDisplay(currentScore);
    }, 50);

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => clearInterval(timer);
  }, []);

  const renderDecorations = () => (
    <>
      <View
        style={[styles.circle, styles.circle1, { backgroundColor: colors.primary + '20' }]}
      />
      <View
        style={[styles.circle, styles.circle2, { backgroundColor: colors.primary + '15' }]}
      />
      <View
        style={[styles.circle, styles.circle3, { backgroundColor: colors.primary + '10' }]}
      />
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {renderDecorations()}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assessment Complete</Text>
          <Text style={styles.headerSubtitle}>Your Relationship Safety Report</Text>
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.secondary,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>{scoreDisplay}</Text>
          </View>

          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>{result.icon}</Text>
            <Text style={[styles.resultTitle, { color: colors.primary }]}>{result.title}</Text>
          </View>

          <Text style={styles.resultMessage}>{result.message}</Text>

          <View style={[styles.actionContainer, { borderLeftColor: colors.primary }]}>
            <Text style={styles.actionText}>{result.action}</Text>
          </View>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Text style={styles.buttonText}>Retake Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>

      

        <Text style={styles.disclaimer}>
          This assessment is not a professional diagnosis. If you're in danger or need help,
          please contact a trusted organization or helpline.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
    paddingBottom: 50,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.3,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -150,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: '30%',
    left: -50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  card: {
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 36,
    marginRight: 15,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    flexShrink: 1,
  },
  resultMessage: {
    fontSize: 17,
    color: '#334155',
    lineHeight: 26,
    marginBottom: 25,
    textAlign: 'center',
  },
  actionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 15,
    borderLeftWidth: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  resourcesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 15,
    textAlign: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  resourceName: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  resourceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  disclaimer: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
});
