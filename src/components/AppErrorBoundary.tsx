import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Keep the fallback silent in production UI; runtime logs still capture the stack.
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          Restart this screen and try again. If the issue continues, sign in again
          or contact support.
        </Text>
        <Pressable onPress={this.handleRetry} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  container: {
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  message: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 320,
    textAlign: "center",
  },
  title: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
});
