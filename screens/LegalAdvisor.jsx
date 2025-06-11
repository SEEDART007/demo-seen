import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import axios from 'axios';

const LegalAdvisor = () => {
  const [inputText, setInputText] = useState('');
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const HUGGINGFACE_API_TOKEN = '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';
  const MODEL = 'bhadresh-savani/distilbert-base-uncased-emotion';

  const handlePredict = async () => {
    const text = inputText.trim();
    if (!text) return;

    setLoading(true);
    setPrediction([]);
    setError(null);

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 45000
        }
      );

      if (response.data.error) {
        setError(`Model Error: ${response.data.error}`);
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        const sortedPredictions = response.data[0]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        setPrediction(sortedPredictions);
      } else if (response.data[0] && Array.isArray(response.data[0])) {
        const sortedPredictions = response.data[0]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        setPrediction(sortedPredictions);
      } else {
        setError('Unexpected response format from the model');
      }
    } catch (err) {
      let errorMessage = 'Network error';
      if (err.response) {
        if (err.response.status === 503) {
          errorMessage = 'The AI advisor is getting ready. Please try again shortly.';
        } else if (err.response.status === 404) {
          errorMessage = `Model not found: "${MODEL}". Please check again.`;
        } else if (err.response.status === 429) {
          errorMessage = 'Too many users. Please try after some time.';
        } else {
          errorMessage = `API error: ${err.response.status}`;
        }
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message) {
        errorMessage = `${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mapLabelToLegalAdvice = (label) => {
    const adviceMap = {
      joy: 'Based on the positive nature of your situation, it appears you may have favorable circumstances. However, I would still recommend documenting all relevant facts and seeking formal legal consultation to ensure your rights are fully protected.',
      sadness: 'I note with concern the emotional distress indicated in your matter. Under the law, you may have grounds for protective measures. I strongly advise compiling evidence and consulting with a licensed attorney to explore remedies available to you.',
      anger: 'The situation you describe suggests potential violations of legal rights. I recommend immediately documenting all incidents, preserving evidence, and seeking emergency legal assistance if safety is a concern. A formal cease-and-desist letter may be warranted.',
      fear: 'Your account indicates serious concerns for personal safety. Please consider contacting local authorities immediately. From a legal perspective, I advise seeking a protective order and consulting with a litigation specialist who can help secure your rights through emergency proceedings.',
      surprise: 'The unexpected elements in your case require careful examination. I would suggest gathering all relevant documentation and consulting with counsel to assess potential legal strategies. Surprising developments often necessitate swift legal action to preserve rights.',
      love: 'Matters involving personal relationships require sensitive handling. I recommend documenting all agreements in writing and consulting with a family law specialist. Be aware that verbal agreements often carry less weight in court than written documentation.'
    };
    return adviceMap[label] || 'Based on the information provided, I would recommend consulting with a licensed attorney to discuss potential legal remedies. Documenting all relevant details will be crucial for your case.';
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.gavelIcon}>
          <View style={styles.gavelHandle} />
          <View style={styles.gavelHead} />
        </View>
        <Text style={styles.heading}>Legal Counsel AI</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.subheading}>Describe your legal concern in detail:</Text>
        
        <TextInput
          style={styles.input}
          placeholder="e.g., 'My spouse is demanding additional dowry payments and threatening consequences if refused...'"
          placeholderTextColor="#8e8e93"
          multiline
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity
          style={[styles.button, (loading || !inputText.trim()) && styles.buttonDisabled]}
          onPress={handlePredict}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Analyzing Legal Matter...' : 'Request Legal Assessment'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5a2b" />
          <Text style={styles.loadingText}>Preparing legal analysis...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {prediction.length > 0 && (
        <View style={styles.legalDocument}>
          <View style={styles.letterhead}>
            <Text style={styles.letterheadText}>Legal Counsel AI • Virtual Advisory Service</Text>
          </View>
          
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>PRELIMINARY LEGAL ASSESSMENT</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.salutation}>Dear Client,</Text>
            
            <Text style={styles.documentBody}>
              Thank you for consulting our virtual legal advisory service. Based on your description, 
              I have conducted a preliminary analysis of your situation:
            </Text>
            
            {prediction.map((item, idx) => (
              <View key={idx} style={styles.legalAdvice}>
                <Text style={styles.adviceHeader}>LEGAL OBSERVATION {idx + 1}:</Text>
                <Text style={styles.adviceText}>{mapLabelToLegalAdvice(item.label)}</Text>
                <Text style={styles.confidenceText}>Assessment Confidence: {(item.score * 100).toFixed(1)}%</Text>
              </View>
            ))}
            
            <View style={styles.divider} />
            
            <Text style={styles.closing}>
              This preliminary assessment is provided for informational purposes only and does not constitute legal representation. 
              I strongly advise consulting with a licensed attorney in your jurisdiction before taking any legal action.
            </Text>
            
            <Text style={styles.signature}>
              Respectfully,{"\n"}
              <Text style={{fontFamily: 'serif'}}>Legal Counsel AI Advisory</Text>
            </Text>
            
            <View style={styles.watermarkContainer}>
              <Text style={styles.watermark}>CONFIDENTIAL</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default LegalAdvisor;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f2e8'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d4b483'
  },
  gavelIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gavelHandle: {
    width: 8,
    height: 30,
    backgroundColor: '#8b5a2b',
    borderRadius: 4,
    transform: [{ rotate: '-30deg' }],
    position: 'absolute',
    top: 5
  },
  gavelHead: {
    width: 25,
    height: 10,
    backgroundColor: '#8b5a2b',
    borderRadius: 2,
    position: 'absolute',
    bottom: 5,
    transform: [{ rotate: '15deg' }]
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3a2d13',
    letterSpacing: 0.5,
    fontFamily: 'serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8e1d1'
  },
  subheading: {
    fontSize: 16,
    color: '#5d4e3a',
    marginBottom: 15,
    lineHeight: 22,
    fontWeight: '500'
  },
  input: {
    borderColor: '#d4c6ac',
    borderWidth: 1,
    borderRadius: 6,
    padding: 18,
    minHeight: 140,
    textAlignVertical: 'top',
    backgroundColor: '#fcfaf5',
    fontSize: 16,
    color: '#3a2d13',
    marginBottom: 20,
    fontFamily: 'serif'
  },
  button: {
    backgroundColor: '#3a2d13',
    padding: 18,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#f5f2e8',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 15,
    color: '#5d4e3a',
    fontWeight: '500',
    fontSize: 16
  },
  errorBox: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#f8e6e0',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#c44d34'
  },
  errorText: {
    color: '#c44d34',
    fontSize: 16,
    lineHeight: 22
  },
  legalDocument: {
    marginTop: 30,
    backgroundColor: '#fcfaf5',
    borderWidth: 1,
    borderColor: '#d4c6ac',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden'
  },
  letterhead: {
    backgroundColor: '#3a2d13',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b483'
  },
  letterheadText: {
    color: '#f5f2e8',
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.8
  },
  documentContent: {
    padding: 25
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#3a2d13',
    marginBottom: 20,
    letterSpacing: 1.2,
    fontFamily: 'serif'
  },
  divider: {
    height: 1,
    backgroundColor: '#d4c6ac',
    marginVertical: 20
  },
  salutation: {
    fontSize: 16,
    color: '#3a2d13',
    marginBottom: 15,
    fontFamily: 'serif'
  },
  documentBody: {
    fontSize: 16,
    color: '#5d4e3a',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'serif'
  },
  legalAdvice: {
    marginBottom: 25,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d4b483'
  },
  adviceHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8b5a2b',
    marginBottom: 8,
    letterSpacing: 0.8
  },
  adviceText: {
    fontSize: 16,
    color: '#3a2d13',
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: 'serif'
  },
  confidenceText: {
    fontSize: 14,
    color: '#8b5a2b',
    fontStyle: 'italic',
    marginTop: 5
  },
  closing: {
    fontSize: 14,
    color: '#5d4e3a',
    lineHeight: 22,
    marginTop: 10,
    fontStyle: 'italic'
  },
  signature: {
    marginTop: 25,
    fontSize: 16,
    color: '#3a2d13',
    lineHeight: 26,
    fontFamily: 'serif'
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    opacity: 0.1,
    transform: [{ rotate: '-30deg' }]
  },
  watermark: {
    fontSize: 48,
    fontWeight: '900',
    color: '#3a2d13'
  }
});