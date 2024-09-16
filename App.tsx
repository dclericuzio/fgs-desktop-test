/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

function App(): React.JSX.Element {
  const [price, setPrice] = useState<{ symbol: string; price: number } | null>(null);
  const [stats, setStats] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://103.183.74.176:8080/fgs');

    ws.onopen = () => ws.send('CONNECT\x0Aaccept-version:1.2,1.1,1.0\x0Aheart-beat:10000,10000\x0A\x0A\x00');

    ws.onclose = event => console.log('WebSocket Disconnected Close: ' + event);
    ws.onerror = event => console.log('WebSocket Disconnected Error: ' + event);

    ws.onmessage = event => {
      const [c, ...data] = event?.data?.split('\x0A') || [];
      if (c === 'CONNECTED') {
        setStats('SUBS-ING');
        ws.send('SUBSCRIBE\x0Aid:sub-0\x0Adestination:/topic/price\x0A\x0A\x00');
      } else {
        setStats('SUBS-ED');
        const parsedData = JSON.parse(JSON.parse(data[data.length - 1].replace('\x00', '')));
        setPrice(parsedData);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scrollView}>
        <View>
          <Text style={styles.priceText}>
            {price !== null ? `${price.symbol}: $${price.price.toFixed(2)}` : 'Loading...'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 40,
    textAlign: 'center',
    color: 'green',
  },
});

export default App;
