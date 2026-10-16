/**
 * AppTabs - Bottom tab navigation with 5 entries: Accueil, Ventes, Dépenses, Produits, Rapports.
 * Uses native tabs with vector icons and red theme for active state.
 */

import { Colors } from '@/constants/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Colors.background}
      indicatorColor={Colors.primary}
      tintColor={Colors.primary}
      iconColor={{ default: Colors.textSecondary, selected: Colors.primary }}
      labelStyle={{
        selected: { color: Colors.primary, fontWeight: 600 },
        default: { color: Colors.textSecondary },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialCommunityIcons}
              name="home"
            />
          }
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ventes">
        <NativeTabs.Trigger.Label>Ventes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialCommunityIcons}
              name="cash-multiple"
            />
          }
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="depenses">
        <NativeTabs.Trigger.Label>Dépenses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialCommunityIcons}
              name="format-list-bulleted"
            />
          }
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="produits">
        <NativeTabs.Trigger.Label>Produits</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialCommunityIcons}
              name="food-apple"
            />
          }
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rapports">
        <NativeTabs.Trigger.Label>Rapports</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialCommunityIcons}
              name="chart-bar"
            />
          }
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
