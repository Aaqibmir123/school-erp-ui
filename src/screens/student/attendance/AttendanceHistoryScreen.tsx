import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useGetAttendanceHistoryQuery } from "../../../api/student/student.api";

export default function AttendanceHistoryScreen() {
  const { selectedStudent } = useAuth();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    data = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAttendanceHistoryQuery(
    { studentId: selectedStudent?._id || "", page, limit: 10 },
    {
      skip: !selectedStudent?._id,
      refetchOnMountOrArgChange: false,
    },
  );

  const onEndReachedCalledDuringMomentum = useRef(false);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (data.length < page * 10 && hasMore && page > 1) {
      setHasMore(false);
    }
  }, [data.length, hasMore, page]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("default", {
      month: "short",
    })}`;
  };

  const renderItem = ({ item }: any) => {
    const isPresent = item.status === "PRESENT";

    return (
      <View style={styles.card}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>

        <View style={styles.row}>
          <Text style={styles.subject}>{item.subjectId?.name || "N/A"}</Text>

          <View
            style={[
              styles.badge,
              isPresent ? styles.presentBg : styles.absentBg,
            ]}
          >
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.meta}>Updated: {formatDate(item.updatedAt)}</Text>
      </View>
    );
  };

  if (!selectedStudent?._id) {
    return <Text style={styles.empty}>Select a child first</Text>;
  }

  if (isLoading && page === 1) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (isError) {
    return (
      <Text style={styles.empty} onPress={refetch}>
        Error loading attendance (tap to retry)
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            loadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No attendance found</Text>
        }
        ListFooterComponent={
          isFetching ? <ActivityIndicator style={{ margin: 10 }} /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 3,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subject: {
    fontSize: 15,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  presentBg: {
    backgroundColor: "#e6f7ec",
  },
  absentBg: {
    backgroundColor: "#ffe6e6",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
});
