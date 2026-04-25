import { createDrawerNavigator } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StudentStack from "./StudentStack";
import CustomDrawer from "../components/CustomDrawer";

const Drawer = createDrawerNavigator();

export default function StudentDrawer() {
  const insets = useSafeAreaInsets();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: "86%",
          backgroundColor: "#F4F7FB",
        },
        drawerType: "front",
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 8,
          marginVertical: 4,
          paddingHorizontal: 4,
        },
        drawerContentStyle: {
          paddingTop: insets.top,
        },
      }}
    >
      <Drawer.Screen name="Home" component={StudentStack} />
    </Drawer.Navigator>
  );
}
