import Button from '@/components/Button';
import { useAuth } from '@/providers/AuthProvider';
import { Link, Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const index = () => {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  if (profile?.group === 'ADMIN') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 10 }}>
        <Link href={'/(user)'} asChild>
          <Button text="User" />
        </Link>
        <Link href={'/(admin)'} asChild>
          <Button text="Admin A" />
        </Link>
      </View>
    );
  }

  return <Redirect href="/(user)" />;
};

export default index;