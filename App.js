
import moment from 'moment';
import { Card, Button, Icon } from 'react-native-elements';
import React, { useState, useEffect } from 'react';
import { FlatList, Linking, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

export default function App() {
  const apiKey = '79b3f44910e5407a8fc26dd6a660e522';

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasErrored, setHasApiError] = useState(false);
  const [lastPageReached, setLastPageReached] = useState(false);

  useEffect(() => {
    getNews();
  }, [articles]);

  const onPress = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  const getNews = async () => {
    if (lastPageReached) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=79b3f44910e5407a8fc26dd6a660e522&page=${pageNumber}`
      );
      const jsonData = await response.json();
      const hasMoreArticles = jsonData.articles.length > 2;
      if (hasMoreArticles) {
        const newArticleList = filterForUniqueArticles(
          articles.concat(jsonData.articles));
          setArticles(newArticleList)
          setPageNumber(pageNumber + 1);
      } else {
        setLastPageReached(true);
      }

    } catch (error) {
      setHasApiError(false)
    }
    setLoading(false);
  };


  const renderArticleItem = ({ item }) => {
    return (
      <Card title={item.title} image={{ uri: item.urlToImage }}>
        <View style={styles.row}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.info}>{item.source.name}</Text>
        </View>
        <Text style={{ marginBottom: 10 }}>{item.content}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Published</Text>
          <Text style={styles.info}>
            {moment(item.publishedAt).format('LLL')}
          </Text>
        </View>
        <Button
          icon={<Icon />}
          title="Read more"
          backgroundColor="#03A9F4"
          onPress={() => onPress(item.url)} />
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          loading={loading} />
      </View>
    );
  }

  if (hasErrored) {
    return (
      <View style={styles.container}>
        <Text>Error =(</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Articles Count:</Text>
        <Text style={styles.info}>{articles.length}</Text>
      </View>

      <FlatList
        data={articles}
        onEndReached={getNews}
        onEndReachedThreshold={1}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.title}
        ListFooterComponent={lastPageReached ?
          <Text>No more articles</Text> :
          <ActivityIndicator
            size="large"
            loading={loading}
          />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 16,
    color: 'grey'
  }
});
