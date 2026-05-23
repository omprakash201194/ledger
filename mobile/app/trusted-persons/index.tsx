import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  TrustedPerson,
  trustedPersonsApi,
  TRUSTED_PERSON_TYPE_LABELS,
} from '@/api/trustedPersons';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, useToast } from '@/components/Toast';
import { TypeBadge } from '@/components/TypeBadge';
import { CardWrap } from '@/components/CardWrap';
import { SectionIntro } from '@/components/SectionIntro';
import { timeAgo } from '@/utils/timeAgo';
import { useAppTheme } from '@/contexts/ThemeContext';
import { CC } from '@/theme';

export default function TrustedPersonsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  card: { marginBottom: 8 },
  cardContent: { padding: 14 },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 14, fontWeight: '700' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 },
  name: { fontSize: 14, fontWeight: '700', color: theme.tx },
  relationship: { fontSize: 12, color: theme.txS, marginBottom: 5 },
  contactRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { fontSize: 12 },
  rightCol: { alignItems: 'center', justifyContent: 'space-between', height: 48 },
  rowActions: { flexDirection: 'row', gap: 2 },
  actionBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: theme.green,
    borderRadius: 18,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
}), [theme]);

  const { toast, show: showToast, hide: hideToast } = useToast();

  const [persons, setPersons] = useState<TrustedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPersons = useCallback(async () => {
    try {
      const data = await trustedPersonsApi.getAll();
      setPersons(data);
    } catch {
      showToast('Failed to load trusted persons', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPersons().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPersons();
    setRefreshing(false);
  }, []);

  const handleDelete = (person: TrustedPerson) => {
    Alert.alert('Remove person', `Remove "${person.name}" from trusted persons?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await trustedPersonsApi.delete(person.id);
            setPersons((prev) => prev.filter((p) => p.id !== person.id));
            showToast('Person removed', 'success');
          } catch {
            showToast('Failed to remove', 'error');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {loading ? (
        <LoadingState message="Loading..." />
      ) : persons.length === 0 ? (
        <>
          <SectionIntro sectionKey="trusted-persons" note="Family members, executors, your CA, lawyer, doctor and other key contacts. These are the people your family should reach first." />
          <EmptyState
            icon="people-outline"
            title="No trusted persons"
            subtitle="Add family members, advisors, and executors who should know about your finances."
            ctaLabel="Add person"
            onCta={() => router.push('/trusted-persons/form')}
          />
        </>
      ) : (
        <FlatList
          data={persons}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <SectionIntro sectionKey="trusted-persons" note="Family members, executors, your CA, lawyer, doctor and other key contacts. These are the people your family should reach first." />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.green} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item: person }) => {
            const colors = CC[person.type] ?? CC.FAMILY;
            const initials = person.name.slice(0, 2).toUpperCase();
            return (
              <CardWrap
                onPress={() => router.push(`/trusted-persons/form?id=${person.id}`)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    {/* Avatar */}
                    <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.avatarText, { color: colors.tx }]}>{initials}</Text>
                    </View>
                    <View style={styles.info}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name}>{person.name}</Text>
                        <TypeBadge code={person.type} label={TRUSTED_PERSON_TYPE_LABELS[person.type]} />
                      </View>
                      {person.relationship && (
                        <Text style={styles.relationship}>{person.relationship}</Text>
                      )}
                      <View style={styles.contactRow}>
                        {person.phone && (
                          <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${person.phone}`)}
                            style={styles.contactItem}
                          >
                            <Ionicons name="call-outline" size={12} color={theme.green} />
                            <Text style={[styles.contactText, { color: theme.greenL }]}>{person.phone}</Text>
                          </TouchableOpacity>
                        )}
                        {person.email && (
                          <TouchableOpacity
                            onPress={() => Linking.openURL(`mailto:${person.email}`)}
                            style={styles.contactItem}
                          >
                            <Ionicons name="mail-outline" size={12} color={theme.brandL} />
                            <Text style={[styles.contactText, { color: theme.brandL }]}>{person.email}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <View style={styles.rightCol}>
                      <Ionicons name="chevron-forward" size={16} color={theme.txM} />
                      <View style={styles.rowActions}>
                        <TouchableOpacity
                          onPress={() => router.push(`/trusted-persons/form?id=${person.id}`)}
                          style={styles.actionBtn}
                        >
                          <Ionicons name="pencil-outline" size={13} color={theme.txM} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(person)} style={styles.actionBtn}>
                          <Ionicons name="trash-outline" size={13} color={theme.redL} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </CardWrap>
            );
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/trusted-persons/form')}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

