// NewsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
  RefreshControl,
  SafeAreaView,
  useColorScheme
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const styles = getStyles(isDarkMode);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        'https://newsapi.org/v2/everything?q=domestic%20violence%20AND%20mental%20health&language=en&sortBy=publishedAt&apiKey=cef433d3b15b4e25bf317f806b853c15'
      );
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchArticles();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.articleContainer}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.8}
    >
      {item.urlToImage && (
        <Image
          source={{ uri: item.urlToImage }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.source}>{item.source.name}</Text>
          <Text style={styles.date}>
            {new Date(item.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={isDarkMode ? '#BB86FC' : '#6C63FF'} />
        <Text style={styles.loadingText}>Loading News...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mental Health News</Text>

      <FlatList
        data={articles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#BB86FC' : '#6C63FF'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#F8F9FE',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: isDarkMode ? '#FFFFFF' : '#2A2D3A',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  articleContainer: {
    backgroundColor: isDarkMode ? '#1E1E2F' : '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: isDarkMode ? '#000' : '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  articleImage: {
    height: 160,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  textContainer: {
    padding: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: isDarkMode ? '#F1F1F1' : '#2A2D3A',
    marginBottom: 12,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  source: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C63FF',
    backgroundColor: isDarkMode ? '#2A2D4A' : '#F0EDFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  date: {
    fontSize: 13,
    color: isDarkMode ? '#A1A1AA' : '#A0A3BD',
  },
  description: {
    fontSize: 14,
    color: isDarkMode ? '#D4D4D8' : '#5C5F70',
    lineHeight: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#121212' : '#F8F9FE',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: isDarkMode ? '#BB86FC' : '#6C63FF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: isDarkMode ? '#A1A1AA' : '#A0A3BD',
    fontWeight: '500',
  },
});

export default NewsScreen;
