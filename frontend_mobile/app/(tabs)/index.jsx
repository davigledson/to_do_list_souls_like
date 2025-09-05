import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componentes visuais
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Services
import TodoService from '../../services/TodoService';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTodos: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    todayTasks: 0,
    recentTodos: [],
    urgentTasks: []
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const todosData = await TodoService.listarTodos();
      setTodos(todosData);
      
      // Buscar detalhes dos todos recentes
      const todosWithTasks = await Promise.all(
        todosData.slice(0, 3).map(async (todo) => {
          try {
            const todoDetails = await TodoService.buscarPorId(todo.id);
            return todoDetails;
          } catch (err) {
            console.warn(`Erro ao buscar detalhes do todo ${todo.id}:`, err);
            return { ...todo, tasks: [] };
          }
        })
      );
      
      calculateStats(todosData, todosWithTasks);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar os dados. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateStats = async (allTodos, recentTodosWithTasks) => {
    // Buscar todos os todos com tarefas para estatísticas completas
    const allTodosWithTasks = await Promise.all(
      allTodos.map(async (todo) => {
        try {
          const todoDetails = await TodoService.buscarPorId(todo.id);
          return todoDetails;
        } catch (err) {
          return { ...todo, tasks: [] };
        }
      })
    );

    const totalTodos = allTodos.length;
    const allTasks = allTodosWithTasks.flatMap(todo => todo.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.is_completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tarefas de hoje (criadas hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = allTasks.filter(task => {
      const taskDate = new Date(task.created_at);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    // Tarefas urgentes (pendentes há mais de 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const urgentTasks = allTasks.filter(task => 
      !task.is_completed && new Date(task.created_at) < oneWeekAgo
    ).slice(0, 5);

    setStats({
      totalTodos,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      todayTasks,
      recentTodos: recentTodosWithTasks,
      urgentTasks
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToTodos = () => {
    // Aqui você navegaria para a página de todos
    console.log('Navegando para página de Todos');
  };

  const navigateToTasks = () => {
    // Aqui você navegaria para a página de tarefas
    console.log('Navegando para página de Tarefas');
  };

  const navigateToStats = () => {
    // Aqui você navegaria para a página de estatísticas
    console.log('Navegando para página de Estatísticas');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#A5B4FC' : '#4F46E5'} />
        <ThemedText style={styles.centerText}>Carregando dashboard...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
        <ThemedText style={[styles.centerText, styles.errorText]}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const QuickStatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.quickStatCard,
        { backgroundColor: isDark ? '#1F2937' : 'white' }
      ]}
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#4F46E5', dark: '#312E81' }}
      headerImage={
        <View style={styles.headerContent}>
          <Ionicons 
            name="home-outline" 
            size={80} 
            color={isDark ? '#A5B4FC' : '#EEF2FF'} 
            style={styles.headerIcon}
          />
        </View>
      }>
      
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="title">Bem-vindo ao TaskManager! 👋</ThemedText>
        <ThemedText style={styles.subtitle}>
          Gerencie suas tarefas de forma eficiente
        </ThemedText>
      </ThemedView>

      {/* Estatísticas Rápidas */}
      <ThemedView style={styles.quickStatsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Visão Geral
        </ThemedText>
        
        <View style={styles.quickStatsGrid}>
          <QuickStatCard
            icon="folder-outline"
            title="Listas"
            value={stats.totalTodos}
            color="#059669"
            onPress={navigateToTodos}
          />
          
          <QuickStatCard
            icon="checkmark-done-outline"
            title="Tarefas"
            value={stats.totalTasks}
            color="#7C3AED"
            onPress={navigateToTasks}
          />
          
          <QuickStatCard
            icon="checkmark-circle"
            title="Concluídas"
            value={stats.completedTasks}
            color="#10B981"
            onPress={navigateToStats}
          />
          
          <QuickStatCard
            icon="time-outline"
            title="Pendentes"
            value={stats.pendingTasks}
            color="#EF4444"
            onPress={navigateToTasks}
          />
        </View>
      </ThemedView>

      {/* Progresso Geral */}
      <ThemedView style={styles.progressSection}>
        <View style={[
          styles.progressCard,
          { backgroundColor: isDark ? '#1F2937' : 'white' }
        ]}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Progresso Geral</ThemedText>
            <ThemedText style={styles.progressPercentage}>
              {Math.round(stats.completionRate)}%
            </ThemedText>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${stats.completionRate}%`,
                    backgroundColor: stats.completionRate >= 80 ? '#10B981' : 
                                   stats.completionRate >= 50 ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>
          </View>
          
          <ThemedText style={styles.progressSubtext}>
            {stats.completedTasks} de {stats.totalTasks} tarefas concluídas
          </ThemedText>
        </View>
      </ThemedView>

      {/* Ações Rápidas */}
      <ThemedView style={styles.actionsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ações Rápidas
        </ThemedText>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? '#059669' : '#10B981' }
            ]}
            onPress={navigateToTodos}
          >
            <Ionicons name="add-circle-outline" size={32} color="white" />
            <Text style={styles.actionButtonText}>Criar Lista</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? '#7C3AED' : '#8B5CF6' }
            ]}
            onPress={navigateToTasks}
          >
            <Ionicons name="add-outline" size={32} color="white" />
            <Text style={styles.actionButtonText}>Nova Tarefa</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Listas Recentes */}
      {stats.recentTodos.length > 0 && (
        <ThemedView style={styles.recentSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Listas Recentes
          </ThemedText>
          
          {stats.recentTodos.map((todo) => {
            const tasks = todo.tasks || [];
            const completed = tasks.filter(t => t.is_completed).length;
            const total = tasks.length;
            const progress = total > 0 ? (completed / total) * 100 : 0;
            
            return (
              <TouchableOpacity
                key={todo.id}
                style={[
                  styles.recentTodoCard,
                  { backgroundColor: isDark ? '#1F2937' : 'white' }
                ]}
                onPress={navigateToTasks}
              >
                <View style={styles.recentTodoHeader}>
                  <ThemedText style={styles.recentTodoTitle}>{todo.title}</ThemedText>
                  <ThemedText style={styles.recentTodoProgress}>
                    {completed}/{total}
                  </ThemedText>
                </View>
                
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill,
                      { 
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? '#10B981' : '#6366F1'
                      }
                    ]}
                  />
                </View>
                
                <ThemedText style={styles.recentTodoDate}>
                  {new Date(todo.created_at).toLocaleDateString('pt-BR')}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      )}

      {/* Tarefas Urgentes */}
      {stats.urgentTasks.length > 0 && (
        <ThemedView style={styles.urgentSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" /> Tarefas Urgentes
          </ThemedText>
          
          {stats.urgentTasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.urgentTaskCard,
                { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }
              ]}
            >
              <View style={styles.urgentTaskContent}>
                <ThemedText style={styles.urgentTaskTitle}>{task.title}</ThemedText>
                <ThemedText style={styles.urgentTaskDate}>
                  Pendente há {Math.floor((new Date() - new Date(task.created_at)) / (1000 * 60 * 60 * 24))} dias
                </ThemedText>
              </View>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={navigateToTasks}
          >
            <ThemedText style={styles.viewAllText}>Ver todas as tarefas</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Hoje */}
      {stats.todayTasks > 0 && (
        <ThemedView style={styles.todaySection}>
          <View style={[
            styles.todayCard,
            { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' }
          ]}>
            <View style={styles.todayHeader}>
              <Ionicons name="today-outline" size={24} color="#3B82F6" />
              <ThemedText style={styles.todayTitle}>Hoje</ThemedText>
            </View>
            <ThemedText style={styles.todayCount}>
              {stats.todayTasks} {stats.todayTasks === 1 ? 'tarefa criada' : 'tarefas criadas'}
            </ThemedText>
          </View>
        </ThemedView>
      )}

      {/* Link para Estatísticas */}
      <ThemedView style={styles.statsLinkSection}>
        <TouchableOpacity 
          style={[
            styles.statsLinkButton,
            { backgroundColor: isDark ? '#D97706' : '#F59E0B' }
          ]}
          onPress={navigateToStats}
        >
          <Ionicons name="analytics-outline" size={24} color="white" />
          <Text style={styles.statsLinkText}>Ver Estatísticas Completas</Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

import styles from '@/styles/index.styles'