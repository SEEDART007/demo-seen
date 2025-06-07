import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { ArrowLeft, FileText, Download } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import RNFS from 'react-native-fs'; // Added for file system access

export default function LegalScreen({ navigation }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const styles = getStyles(isDarkMode);

  const generatePDF = async (data) => {
    try {
      setIsGenerating(true);
      
      const date = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
              .section { margin: 15px 0; }
              .label { font-weight: bold; color: #2c3e50; }
              .content { margin: 5px 0 15px 0; line-height: 1.5; }
              .signature { margin-top: 50px; text-align: right; }
            </style>
          </head>
          <body>
            <h2>APPLICATION TO THE MAGISTRATE UNDER SECTION 12 OF THE PROTECTION OF WOMEN FROM DOMESTIC VIOLENCE ACT, 2005</h2>
            
            <div class="section">
              <div class="label">To,</div>
              <div class="content">
                The Court of Magistrate<br/>
                [Insert Court Address]
              </div>
            </div>
            
            <div class="section">
              <div class="label">Applicant:</div>
              <div class="content">${data.applicantName}</div>
              
              <div class="label">Address:</div>
              <div class="content">${data.applicantAddress}</div>
            </div>
            
            <div class="section">
              <div class="label">Respondent:</div>
              <div class="content">${data.respondentName}</div>
              
              <div class="label">Relationship with Applicant:</div>
              <div class="content">${data.relationship}</div>
            </div>
            
            <div class="section">
              <div class="label">Details of Domestic Incident:</div>
              <div class="content">${data.incidentDetails}</div>
            </div>
            
            <div class="section">
              <div class="label">Reliefs Sought:</div>
              <div class="content">${data.reliefs}</div>
            </div>
            
            <div class="section">
              <div class="label">Date:</div>
              <div class="content">${date}</div>
            </div>
            
            <div class="signature">
              <div class="label">Signature of Applicant</div>
              <div>${data.applicantName}</div>
            </div>
          </body>
        </html>
      `;

      // Determine platform-specific directory
      const directory = Platform.select({
        ios: RNFS.DocumentDirectoryPath,
        android: RNFS.DownloadDirectoryPath,
      });

      // Define file path
      const fileName = `DV_Act_Application_${Date.now()}.pdf`;
      const filePath = `${directory}/${fileName}`;

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: directory.replace(/\/$/, ''), // Remove trailing slash
      };

      const file = await RNHTMLtoPDF.convert(options);
      
      // Format file path for display
      const displayPath = file.filePath
        .replace(/^.*\/Documents\//, 'Documents/')
        .replace(/^.*\/Download\//, 'Download/');
      
      Alert.alert(
        'PDF Generated Successfully', 
        `Your legal document has been saved to:\n${displayPath}`,
        [
          { text: 'OK', onPress: () => reset() },
          { 
            text: 'View File', 
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openURL(`file://${file.filePath}`)
                  .catch(() => Alert.alert('Error', 'No PDF viewer found. Install a PDF viewer app.'));
              } else {
                Linking.openURL(file.filePath);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={isDarkMode ? "#fff" : "#000"} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Legal Protection Form</Text>
        <View style={{ width: 28 }} /> {/* Spacer for symmetry */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={24} color={isDarkMode ? "#82ccdd" : "#0a3d62"} />
            <Text style={styles.cardTitle}>Section 12 - DV Act Application</Text>
          </View>
          
          <Text style={styles.label}>Applicant's Full Name</Text>
          <Controller
            control={control}
            name="applicantName"
            rules={{ required: 'Full name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.applicantName && styles.errorInput]}
                placeholder="Your full name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.applicantName && <Text style={styles.errorText}>{errors.applicantName.message}</Text>}

          <Text style={styles.label}>Applicant's Address</Text>
          <Controller
            control={control}
            name="applicantAddress"
            rules={{ required: 'Address is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.applicantAddress && styles.errorInput]}
                placeholder="Your complete address"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                onChangeText={onChange}
                value={value}
                multiline
              />
            )}
          />
          {errors.applicantAddress && <Text style={styles.errorText}>{errors.applicantAddress.message}</Text>}

          <Text style={styles.label}>Respondent's Full Name</Text>
          <Controller
            control={control}
            name="respondentName"
            rules={{ required: "Respondent's name is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.respondentName && styles.errorInput]}
                placeholder="Respondent's full name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.respondentName && <Text style={styles.errorText}>{errors.respondentName.message}</Text>}

          <Text style={styles.label}>Relationship with Respondent</Text>
          <Controller
            control={control}
            name="relationship"
            rules={{ required: 'Relationship is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.relationship && styles.errorInput]}
                placeholder="e.g., Husband, Father-in-law"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.relationship && <Text style={styles.errorText}>{errors.relationship.message}</Text>}

          <Text style={styles.label}>Details of Domestic Incident</Text>
          <Controller
            control={control}
            name="incidentDetails"
            rules={{ required: 'Incident details are required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.textarea, errors.incidentDetails && styles.errorInput]}
                placeholder="Describe the incidents (date, time, nature of abuse, witnesses, etc.)"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={6}
              />
            )}
          />
          {errors.incidentDetails && <Text style={styles.errorText}>{errors.incidentDetails.message}</Text>}

          <Text style={styles.label}>Reliefs Sought</Text>
          <Controller
            control={control}
            name="reliefs"
            rules={{ required: 'Reliefs sought are required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.textarea, errors.reliefs && styles.errorInput]}
                placeholder="Specify the reliefs you are seeking (protection order, residence order, monetary relief, etc.)"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={4}
              />
            )}
          />
          {errors.reliefs && <Text style={styles.errorText}>{errors.reliefs.message}</Text>}

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleSubmit(generatePDF)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Download color="#fff" size={20} />
                <Text style={styles.buttonText}>Generate Legal Document</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => reset()}
          >
            <Text style={styles.resetButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Important Notes:</Text>
          <Text style={styles.noteText}>• This form generates an application under Section 12 of the Protection of Women from Domestic Violence Act, 2005</Text>
          <Text style={styles.noteText}>• File this application in the Magistrate's court having jurisdiction over your area</Text>
          <Text style={styles.noteText}>• You have the right to free legal aid - contact your nearest legal services authority</Text>
          <Text style={styles.noteText}>• Keep a copy of this application for your records</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: isDarkMode ? '#1a1a2e' : '#0a3d62',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333' : '#094771',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: isDarkMode ? '#82ccdd' : '#0a3d62',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: isDarkMode ? '#e2e8f0' : '#334155',
  },
  input: {
    backgroundColor: isDarkMode ? '#2d3748' : '#f8fafc',
    borderWidth: 1,
    borderColor: isDarkMode ? '#4a5568' : '#cbd5e1',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: isDarkMode ? '#f8fafc' : '#1e293b',
  },
  textarea: {
    backgroundColor: isDarkMode ? '#2d3748' : '#f8fafc',
    borderWidth: 1,
    borderColor: isDarkMode ? '#4a5568' : '#cbd5e1',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    height: 120,
    textAlignVertical: 'top',
    color: isDarkMode ? '#f8fafc' : '#1e293b',
  },
  errorInput: {
    borderColor: '#e53e3e',
  },
  errorText: {
    color: '#e53e3e',
    marginTop: -12,
    marginBottom: 16,
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    padding: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    color: isDarkMode ? '#82ccdd' : '#0a3d62',
    fontSize: 16,
    fontWeight: '600',
  },
  noteBox: {
    backgroundColor: isDarkMode ? '#2d3748' : '#dbeafe',
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: isDarkMode ? '#82ccdd' : '#0a3d62',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: isDarkMode ? '#82ccdd' : '#0a3d62',
  },
  noteText: {
    fontSize: 14,
    color: isDarkMode ? '#e2e8f0' : '#334155',
    marginBottom: 8,
    lineHeight: 20,
  },
});