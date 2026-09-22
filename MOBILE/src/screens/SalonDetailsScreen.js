import SalonPhotos from '../components/SalonPhotos';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import SalonLocation from '../components/SalonLocation';
import {
  Badge,
  Button,
  Card,
  SectionHeader,
  StateMessage,
  Title,
  uiStyles,
} from '../components/UI';
import { catalogApi } from '../api/services';
import { getApiError } from '../api/client';
import { isActive, money } from '../utils/format';
import { colors, radius, spacing } from '../styles/theme';

export default function SalonDetailsScreen({ route, navigation }) {
  const { salonId } = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [service, setService] = useState(null);
  const [employee, setEmployee] = useState(null);

  const [employeeError, setEmployeeError] = useState('');
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeRetry, setEmployeeRetry] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [salon, services] = await Promise.all([
        catalogApi.salon(salonId),
        catalogApi.services(salonId),
      ]);

      setData({
        salon: salon.data,
        services: (services.data || []).filter(isActive),
        employees: [],
      });
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          'Não foi possível carregar o salão.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!service) return;

    let active = true;

    setEmployeeLoading(true);
    setEmployeeError('');

    catalogApi.employees(salonId, service.id)
      .then(({ data: employees }) => {
        if (!active) return;

        setData(current =>
          current
            ? {
                ...current,
                employees: employees || [],
              }
            : current
        );
      })
      .catch(requestError => {
        if (!active) return;

        setEmployeeError(
          getApiError(
            requestError,
            'Não foi possível carregar os profissionais.'
          )
        );
      })
      .finally(() => {
        if (active) {
          setEmployeeLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [salonId, service, employeeRetry]);

  function selectService(nextService) {
    setService(nextService);
    setEmployee(null);
    setEmployeeError('');

    setData(current =>
      current
        ? {
            ...current,
            employees: [],
          }
        : current
    );

    // Também permite recarregar ao tocar no mesmo serviço.
    setEmployeeRetry(value => value + 1);
  }

  if (loading || error || !data) {
    return (
      <Screen>
        <StateMessage
          loading={loading}
          error={error}
          onRetry={load}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <SalonPhotos salonId={salonId} />

      <Title
        eyebrow="Estabelecimento"
        subtitle={data.salon.telefone}
      >
        {data.salon.nome}
      </Title>

      <Card>
        <Text style={styles.optionTitle}>
          Endereço
        </Text>

        <Text style={uiStyles.subtitle}>
          {data.salon.logradouro
            ? [
                data.salon.logradouro,
                data.salon.bairro,
                data.salon.cidade,
                data.salon.uf,
              ]
                .filter(Boolean)
                .join(', ')
            : data.salon.endereco}
        </Text>

        {data.salon.numero?.trim() ? (
          <Text style={uiStyles.subtitle}>
            Número: {data.salon.numero}
          </Text>
        ) : null}

        {data.salon.complemento?.trim() ? (
          <Text style={uiStyles.subtitle}>
            Complemento: {data.salon.complemento}
          </Text>
        ) : null}

        {data.salon.pontoReferencia?.trim() ? (
          <Text style={uiStyles.subtitle}>
            Ponto de referência: {data.salon.pontoReferencia}
          </Text>
        ) : null}

        {data.salon.cep?.trim() ? (
          <Text style={uiStyles.subtitle}>
            CEP: {data.salon.cep}
          </Text>
        ) : null}
      </Card>

      <SalonLocation
        key={data.salon.id}
        salon={data.salon}
      />

      <SectionHeader title="1. Escolha o serviço" />

      <StateMessage
        empty={
          !data.services.length
            ? 'Nenhum serviço ativo disponível.'
            : null
        }
      />

      {data.services.map(item => {
        const selected = service?.id === item.id;

        return (
          <Card
            key={item.id}
            onPress={() => selectService(item)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected && styles.selectedText,
                  ]}
                >
                  {item.nome}
                </Text>

                {item.descricao ? (
                  <Text style={uiStyles.subtitle}>
                    {item.descricao}
                  </Text>
                ) : null}
              </View>

              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primaryDark}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color={colors.border}
                />
              )}
            </View>

            <View style={styles.meta}>
              <Badge>
                {money(item.preco)}
              </Badge>

              <Text style={styles.duration}>
                {item.duracao} min
              </Text>
            </View>
          </Card>
        );
      })}

      <SectionHeader title="2. Escolha o profissional" />

      {!service ? (
        <View style={styles.guidance}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.secondary}
          />

          <Text style={styles.guidanceText}>
            Escolha primeiro um serviço
          </Text>
        </View>
      ) : (
        <Text style={styles.helper}>
          Profissionais ativos deste estabelecimento.
        </Text>
      )}

      {service && employeeLoading ? (
        <Text style={styles.helper}>
          Carregando profissionais...
        </Text>
      ) : null}

      {service && employeeError ? (
        <View>
          <Text style={uiStyles.error}>
            {employeeError}
          </Text>

          <Button
            title="Tentar novamente"
            secondary
            onPress={() =>
              setEmployeeRetry(value => value + 1)
            }
          />
        </View>
      ) : null}

      {service &&
      !employeeLoading &&
      !employeeError &&
      !data.employees.length ? (
        <StateMessage
          empty="Nenhum funcionário ativo disponível para este serviço."
        />
      ) : null}

      {service &&
      !employeeLoading &&
      !employeeError
        ? data.employees.map(item => {
            const selected = employee?.id === item.id;

            return (
              <Card
                key={item.id}
                onPress={() => setEmployee(item)}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.avatar}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.secondary}
                    />
                  </View>

                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionTitle,
                        selected && styles.selectedText,
                      ]}
                    >
                      {item.nome}
                    </Text>

                    {item.funcao ? (
                      <Text style={uiStyles.subtitle}>
                        {item.funcao}
                      </Text>
                    ) : null}
                  </View>

                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primaryDark}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={24}
                      color={colors.border}
                    />
                  )}
                </View>
              </Card>
            );
          })
        : null}

      <View style={styles.footer}>
        <Button
          title="Continuar para data e horário"
          icon="arrow-forward-outline"
          disabled={
            !service ||
            !employee ||
            employeeLoading ||
            !!employeeError
          }
          onPress={() =>
            navigation.navigate('NewAppointment', {
              salon: data.salon,
              service,
              employee,
            })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 112,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  coverIcon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },

  selectedText: {
    color: colors.primaryDark,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  duration: {
    color: colors.muted,
    fontWeight: '700',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helper: {
    color: colors.muted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  guidance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  guidanceText: {
    color: colors.secondary,
    fontWeight: '800',
  },

  footer: {
    marginTop: spacing.sm,
  },
});