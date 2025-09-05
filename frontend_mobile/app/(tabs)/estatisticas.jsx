import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componentes visuais
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Services
import TodoService from '../../services/TodoService';

const { width } = Dimensions.get('window');

export default function StatisticsPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    averageTasksPerTodo: 0,
    mostProductiveTodo: null,
    todosWithAllTasksCompleted: 0,
    oldestTodo: null,
    newestTodo: null,
    tasksCreatedThisWeek: 0,
    tasksCompletedThisWeek: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const todosData = await TodoService.listarTodos();
      setTodos(todosData);
      
      // Buscar detalhes de cada todo com suas tarefas
      const todosWithTasks = await Promise.all(
        todosData.map(async (todo) => {
          try {
            const todoDetails = await TodoService.buscarPorId(todo.id);
            return todoDetails;
          } catch (err) {
            console.warn(`Erro ao buscar detalhes do todo ${todo.id}:`, err);
            return { ...todo, tasks: [] };
          }
        })
      );
      
      calculateStats(todosWithTasks);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar os dados. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateStats = (todosWithTasks) => {
    const totalTodos = todosWithTasks.length;
    const allTasks = todosWithTasks.flatMap(todo => todo.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.is_completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const averageTasksPerTodo = totalTodos > 0 ? totalTasks / totalTodos : 0;

    // Todo mais produtivo (mais tarefas concluídas)
    const mostProductiveTodo = todosWithTasks.reduce((prev, current) => {
      const prevCompleted = (prev.tasks || []).filter(t => t.is_completed).length;
      const currentCompleted = (current.tasks || []).filter(t => t.is_completed).length;
      return currentCompleted > prevCompleted ? current : prev;
    }, todosWithTasks[0] || null);

    // Todos com todas as tarefas concluídas
    const todosWithAllTasksCompleted = todosWithTasks.filter(todo => {
      const todoTasks = todo.tasks || [];
      return todoTasks.length > 0 && todoTasks.every(task => task.is_completed);
    }).length;

    // Todo mais antigo e mais novo
    const sortedTodos = [...todosWithTasks].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    const oldestTodo = sortedTodos[0] || null;
    const newestTodo = sortedTodos[sortedTodos.length - 1] || null;

    // Tarefas criadas/concluídas esta semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const tasksCreatedThisWeek = allTasks.filter(task => 
      new Date(task.created_at) >= oneWeekAgo
    ).length;

    const tasksCompletedThisWeek = allTasks.filter(task => 
      task.is_completed && task.updated_at && new Date(task.updated_at) >= oneWeekAgo
    ).length;

    setStats({
      totalTodos,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      averageTasksPerTodo,
      mostProductiveTodo,
      todosWithAllTasksCompleted,
      oldestTodo,
      newestTodo,
      tasksCreatedThisWeek,
      tasksCompletedThisWeek
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#F59E0B' : '#F59E0B'} />
        <ThemedText style={styles.centerText}>Calculando estatísticas...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
        <ThemedText style={[styles.centerText, styles.errorText]}>{error}</ThemedText>
      </View>
    );
  }

  if (todos.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.centerText}>Nenhum dado disponível</ThemedText>
        <ThemedText style={[styles.centerText, styles.subtitle]}>
          Crie algumas listas e tarefas para ver as estatísticas
        </ThemedText>
      </View>
    );
  }

  const StatCard = ({ icon, title, value, subtitle, color = '#6366F1', backgroundColor }) => (
    <View style={[
      styles.statCard, 
      { 
        backgroundColor: backgroundColor || (isDark ? '#1F2937' : 'white'),
        borderLeftColor: color
      }
    ]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <View style={styles.statContent}>
          <ThemedText style={styles.statValue}>{value}</ThemedText>
          <ThemedText style={styles.statTitle}>{title}</ThemedText>
          {subtitle && <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>}
        </View>
      </View>
    </View>
  );

  const ProgressCard = ({ title, current, total, color = '#6366F1' }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return (
      <View style={[
        styles.progressCard, 
        { backgroundColor: isDark ? '#1F2937' : 'white' }
      ]}>
        <ThemedText style={styles.progressTitle}>{title}</ThemedText>
        <View style={styles.progressInfo}>
          <ThemedText style={styles.progressText}>
            {current} de {total}
          </ThemedText>
          <ThemedText style={styles.progressPercentage}>
            {Math.round(percentage)}%
          </ThemedText>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: color
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F59E0B', dark: '#D97706' }}
      headerImage={
        <View style={styles.headerContent}>
          <Ionicons 
            name="analytics-outline" 
            size={80} 
            color={isDark ? '#FDE68A' : '#FEF3C7'} 
            style={styles.headerIcon}
          />
        </View>
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Estatísticas</ThemedText>
        <ThemedText style={styles.subtitle}>
          Acompanhe seu progresso e produtividade
        </ThemedText>
      </ThemedView>

      {/* Estatísticas Gerais */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Visão Geral
        </ThemedText>
        
        <View style={styles.statsGrid}>
          <StatCard
            icon="folder-outline"
            title="Listas Criadas"
            value={stats.totalTodos}
            color="#059669"
          />
          
          <StatCard
            icon="checkmark-done-outline"
            title="Total de Tarefas"
            value={stats.totalTasks}
            color="#7C3AED"
          />
          
          <StatCard
            icon="checkmark-circle"
            title="Tarefas Concluídas"
            value={stats.completedTasks}
            color="#10B981"
          />
          
          <StatCard
            icon="time-outline"
            title="Tarefas Pendentes"
            value={stats.pendingTasks}
            color="#EF4444"
          />
        </View>
      </ThemedView>

      {/* Progresso */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Progresso
        </ThemedText>
        
        <ProgressCard
          title="Taxa de Conclusão Geral"
          current={stats.completedTasks}
          total={stats.totalTasks}
          color="#10B981"
        />
        
        <ProgressCard
          title="Listas 100% Completas"
          current={stats.todosWithAllTasksCompleted}
          total={stats.totalTodos}
          color="#7C3AED"
        />
      </ThemedView>

      {/* Insights */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Insights
        </ThemedText>
        
        <View style={styles.insightsGrid}>
          <StatCard
            icon="trending-up"
            title="Média de Tarefas por Lista"
            value={stats.averageTasksPerTodo.toFixed(1)}
            color="#F59E0B"
          />
          
          <StatCard
            icon="flash-outline"
            title="Taxa de Conclusão"
            value={`${Math.round(stats.completionRate)}%`}
            subtitle="do total de tarefas"
            color="#8B5CF6"
          />
        </View>
        
        {stats.mostProductiveTodo && (
          <View style={[
            styles.highlightCard,
            { backgroundColor: isDark ? '#065F46' : '#D1FAE5' }
          ]}>
            <View style={styles.highlightHeader}>
              <Ionicons name="trophy" size={24} color="#059669" />
              <ThemedText style={styles.highlightTitle}>Lista Mais Produtiva</ThemedText>
            </View>
            <ThemedText style={styles.highlightValue}>
              {stats.mostProductiveTodo.title}
            </ThemedText>
            <ThemedText style={styles.highlightSubtitle}>
              {(stats.mostProductiveTodo.tasks || []).filter(t => t.is_completed).length} tarefas concluídas
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Atividade Recente */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Esta Semana
        </ThemedText>
        
        <View style={styles.activityGrid}>
          <StatCard
            icon="add-circle-outline"
            title="Tarefas Criadas"
            value={stats.tasksCreatedThisWeek}
            subtitle="nos últimos 7 dias"
            color="#3B82F6"
          />
          
          <StatCard
            icon="checkmark-done"
            title="Tarefas Concluídas"
            value={stats.tasksCompletedThisWeek}
            subtitle="nos últimos 7 dias"
            color="#10B981"
          />
        </View>
      </ThemedView>

      {/* Histórico */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Histórico
        </ThemedText>
        
        <View style={styles.historyContainer}>
          {stats.oldestTodo && (
            <View style={[
              styles.historyCard,
              { backgroundColor: isDark ? '#1F2937' : 'white' }
            ]}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.historyContent}>
                <ThemedText style={styles.historyTitle}>Primeira Lista</ThemedText>
                <ThemedText style={styles.historyValue}>{stats.oldestTodo.title}</ThemedText>
                <ThemedText style={styles.historyDate}>
                  {new Date(stats.oldestTodo.created_at).toLocaleDateString('pt-BR')}
                </ThemedText>
              </View>
            </View>
          )}
          
          {stats.newestTodo && stats.newestTodo.id !== stats.oldestTodo?.id && (
            <View style={[
              styles.historyCard,
              { backgroundColor: isDark ? '#1F2937' : 'white' }
            ]}>
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
              <View style={styles.historyContent}>
                <ThemedText style={styles.historyTitle}>Lista Mais Recente</ThemedText>
                <ThemedText style={styles.historyValue}>{stats.newestTodo.title}</ThemedText>
                <ThemedText style={styles.historyDate}>
                  {new Date(stats.newestTodo.created_at).toLocaleDateString('pt-BR')}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

import styles from '../../styles/estatisticas.styles';