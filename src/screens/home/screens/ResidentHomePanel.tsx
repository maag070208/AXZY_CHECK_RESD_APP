import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useAppNavigation } from '../../../navigation/hooks/useAppNavigation';
import { RootState } from '../../../core/store/redux.config';
import { ITTouchableOpacity } from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';

interface ResidentCard {
  id: string;
  label: string;
  icon: string;
  stack: string;
  screen: string;
  gradient: string[];
}

const RESIDENT_CARDS: ResidentCard[] = [
  {
    id: 'accesses',
    label: 'Control de Accesos',
    icon: 'shield-check',
    stack: 'ACCESSES_STACK',
    screen: 'ACCESSES_LIST',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    id: 'complaints',
    label: 'Buzón de Quejas',
    icon: 'email-alert-outline',
    stack: 'COMPLAINTS_STACK',
    screen: 'COMPLAINTS_LIST',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    id: 'payments',
    label: 'Estado de Cuenta',
    icon: 'cash-multiple',
    stack: 'PAYMENTS_STACK',
    screen: 'PAYMENTS_LIST',
    gradient: ['#065911', '#046a38'],
  },
  {
    id: 'contacts',
    label: 'Mis Contactos',
    icon: 'phone-outline',
    stack: 'CONTACTS_STACK',
    screen: 'CONTACTS_LIST',
    gradient: ['#46a545', '#3d8e3d'],
  },
];

export const ResidentHomePanel = () => {
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.userState);
  const { navigateToScreen } = useAppNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header / Welcome */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Icon source="home-city-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>
            ¡Bienvenido{user.fullName ? ',' : ''}!
          </Text>
          {user.fullName && (
            <Text style={styles.welcomeName}>{user.fullName}</Text>
          )}
          <Text style={styles.welcomeSub}>
            Residencial AXZY CHECK
          </Text>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.cardsGrid}>
          {RESIDENT_CARDS.map(card => (
            <ITTouchableOpacity
              key={card.id}
              onPress={() => navigateToScreen(card.stack as any, card.screen as any)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={card.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Icon source={card.icon} size={36} color="#FFFFFF" />
                <Text style={styles.cardLabel}>{card.label}</Text>
              </LinearGradient>
            </ITTouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon source="shield-check" size={16} color="#CBD5E1" />
          <Text style={styles.footerText}>Residencial AXZY CHECK</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 6,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrapper: {
    width: '47%',
    aspectRatio: 1,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 24,
    marginTop: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
});
