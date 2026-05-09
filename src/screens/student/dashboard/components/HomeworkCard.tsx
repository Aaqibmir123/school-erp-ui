// import { View, Text, StyleSheet } from "react-native";

// const formatDate = (date: string) => {
//   const d = new Date(date);
//   return `${d.getDate()}/${d.getMonth() + 1}`;
// };

// export default function HomeworkCard({ title, data }: any) {
//   return (
//     <View style={styles.card}>
//       <Text style={styles.title}>{title}</Text>

//       {data.length === 0 ? (
//         <Text style={styles.empty}>No data</Text>
//       ) : (
//         data.slice(0, 3).map((item: any) => (
//           <View key={item.id} style={styles.row}>
//             <View style={{ flex: 1 }}>
//               {/* TITLE */}
//               <Text
//                 style={[
//                   styles.item,
//                   item.isExpired && styles.expiredText,
//                 ]}
//               >
//                 • {item.title}
//               </Text>

//               {/* 🔥 DESCRIPTION */}
//               {item.description && (
//                 <Text style={styles.description}>
//                   {item.description}
//                 </Text>
//               )}

//               {/* DATE */}
//               <Text style={styles.date}>
//                 Due: {formatDate(item.dueDate)}
//               </Text>
//             </View>

//             {/* EXPIRED BADGE */}
//             {item.isExpired && (
//               <Text style={styles.expiredBadge}>Expired</Text>
//             )}
//           </View>
//         ))
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 2,
//   },

//   title: {
//     fontWeight: "700",
//     marginBottom: 10,
//   },

//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },

//   item: {
//     fontSize: 14,
//     fontWeight: "500",
//   },

//   description: {
//     fontSize: 12,
//     color: "#555",
//     marginTop: 2,
//   },

//   date: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },

//   expiredText: {
//     color: "red",
//     textDecorationLine: "line-through",
//   },

//   expiredBadge: {
//     color: "red",
//     fontSize: 12,
//     alignSelf: "center",
//   },

//   empty: {
//     color: "#888",
//   },
// });
