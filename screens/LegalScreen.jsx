import React from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export default function LegalScreen() {
  const { control, handleSubmit, reset } = useForm();

  const generatePDF = async (data) => {
    try {
      const date = new Date().toLocaleDateString('en-IN');

      const htmlContent = `
        <html>
          <body>
            <h2 style="text-align: center;">APPLICATION TO THE MAGISTRATE UNDER SECTION 12 OF THE PROTECTION OF WOMEN FROM DOMESTIC VIOLENCE ACT, 2005</h2>
            <p><strong>To,</strong><br/>
            The Court of Magistrate<br/>
            [Insert Court Address]</p>

            <p><strong>Applicant:</strong> ${data.applicantName}<br/>
            <strong>Address:</strong> ${data.applicantAddress}</p>

            <p><strong>Respondent:</strong> ${data.respondentName}<br/>
            <strong>Relationship with Applicant:</strong> ${data.relationship}</p>

            <p><strong>Details of Domestic Incident:</strong><br/>
            ${data.incidentDetails}</p>

            <p><strong>Reliefs Sought:</strong><br/>
            ${data.reliefs}</p>

            <p><strong>Date:</strong> ${date}</p>

            <p><strong>Signature of Applicant</strong></p>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'section_12_application',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('PDF Generated', `PDF saved to: ${file.filePath}`);
      reset();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'PDF generation failed. Check logs.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Legal Protection Form (Section 12 - DV Act)
      </Text>

      <Text>Applicant's Full Name</Text>
      <Controller
        control={control}
        name="applicantName"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderBottomWidth: 1, marginBottom: 15 }}
            placeholder="Your full name"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text>Applicant's Address</Text>
      <Controller
        control={control}
        name="applicantAddress"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderBottomWidth: 1, marginBottom: 15 }}
            placeholder="Your address"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text>Respondent's Full Name</Text>
      <Controller
        control={control}
        name="respondentName"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderBottomWidth: 1, marginBottom: 15 }}
            placeholder="Respondent's full name"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text>Relationship with Respondent</Text>
      <Controller
        control={control}
        name="relationship"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderBottomWidth: 1, marginBottom: 15 }}
            placeholder="e.g., Husband, Father-in-law"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text>Details of Domestic Incident</Text>
      <Controller
        control={control}
        name="incidentDetails"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            multiline
            numberOfLines={5}
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            placeholder="Describe the incidents"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text>Reliefs Sought</Text>
      <Controller
        control={control}
        name="reliefs"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            placeholder="Specify the reliefs you are seeking"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Button title="Generate PDF" onPress={handleSubmit(generatePDF)} />
    </ScrollView>
  );
}
