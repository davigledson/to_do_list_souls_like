import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  StyleSheet, 
  ScrollView, 
  Alert,
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

export default function TodosPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    user_name: '',
  });

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const todosData = await TodoService.listarTodos();
      setTodos(todosData);
    } catch (err) {
      console.error('Erro ao buscar todos:', err);
      setError('Falha ao carregar as listas. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSaveTodo = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório.');
      return;
    }

    try {
      if (editingTodo) {
        const updatedTodo = await TodoService.atualizar(editingTodo.id, {
          title: formData.title,
          user_name: formData.user_name,
        });
        setTodos(todos.map(t => (t.id === updatedTodo.id ? updatedTodo : t)));
      } else {
        const newTodo = await TodoService.criar({
          title: formData.title,
          user_name: formData.user_name || 'Usuário',
        });
        setTodos([...todos, newTodo]);
      }
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar todo:', err);
      Alert.alert('Erro', 'Não foi possível salvar a lista.');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (todos.length <= 1) {
      Alert.alert('Atenção', 'Você precisa ter pelo menos uma lista.');
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta lista? Todas as tarefas serão perdidas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await TodoService.deletar(todoId);
              setTodos(todos.filter(t => t.id !== todoId));
              Alert.alert('Sucesso', 'Lista excluída com sucesso!');
            } catch (err) {
              console.error('Erro ao deletar todo:', err);
              Alert.alert('Erro', 'Não foi possível excluir a lista.');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      user_name: todo.user_name || '',
    });
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({ title: '', user_name: '' });
    setEditingTodo(null);
    setIsModalVisible(false);
  };

  const getTasksCount = (todo) => {
    const tasks = todo.tasks || [];
    const completed = tasks.filter(task => task.is_completed).length;
    const total = tasks.length;
    return { completed, total, pending: total - completed };
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#A5B4FC' : '#4F46E5'} />
        <ThemedText style={styles.centerText}>Carregando suas listas...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
        <ThemedText style={[styles.centerText, styles.errorText]}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTodos}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#059669', dark: '#065F46' }}
      headerImage={
        <View style={styles.headerContent}>
          <Ionicons 
            name="list-outline" 
            size={80} 
            color={isDark ? '#6EE7B7' : '#D1FAE5'} 
            style={styles.headerIcon}
          />
        </View>
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Gerenciar Listas</ThemedText>
        <ThemedText style={styles.subtitle}>
          Crie e organize suas listas de tarefas
        </ThemedText>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: isDark ? '#059669' : '#10B981' }]} 
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Nova Lista</Text>
      </TouchableOpacity>

      <ThemedView style={styles.todosContainer}>
        {todos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyStateText}>Nenhuma lista ainda</ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>Que tal criar sua primeira lista?</ThemedText>
          </View>
        ) : (
          todos.map((todo) => {
            const { completed, total, pending } = getTasksCount(todo);
            const progress = total > 0 ? (completed / total) * 100 : 0;
            
            return (
              <View key={todo.id} style={[
                styles.todoCard, 
                { backgroundColor: isDark ? '#1F2937' : 'white' }
              ]}>
                <View style={styles.todoHeader}>
                  <View style={styles.todoInfo}>
                    <ThemedText style={styles.todoTitle}>{todo.title}</ThemedText>
                    <ThemedText style={styles.todoUser}>Por: {todo.user_name || 'Usuário'}</ThemedText>
                    <ThemedText style={styles.todoDate}>
                      Criado em: {new Date(todo.created_at).toLocaleDateString('pt-BR')}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.todoActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(todo)}>
                      <Ionicons name="pencil" size={18} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteTodo(todo.id)}>
                      <Ionicons name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.todoStats}>
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <ThemedText style={styles.statText}>{completed} concluídas</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={20} color="#EF4444" />
                      <ThemedText style={styles.statText}>{pending} pendentes</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${progress}%`,
                            backgroundColor: progress === 100 ? '#10B981' : '#6366F1'
                          }
                        ]} 
                      />
                    </View>
                    <ThemedText style={styles.progressText}>
                      {Math.round(progress)}% completo
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ThemedView>

      {/* Modal para criar/editar Todo */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#111827' : 'white' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm}>
              <ThemedText style={styles.modalCancel}>Cancelar</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingTodo ? 'Editar Lista' : 'Nova Lista'}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveTodo}>
              <ThemedText style={styles.modalSave}>Salvar</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Título da Lista *</ThemedText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  borderColor: isDark ? '#4B5563' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827'
                }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Ex: Tarefas do Trabalho, Compras, Projetos..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Nome do Usuário</ThemedText>
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  borderColor: isDark ? '#4B5563' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827'
                }]}
                value={formData.user_name}
                onChangeText={(text) => setFormData({ ...formData, user_name: text })}
                placeholder="Seu nome (opcional)"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>

            <View style={styles.helpContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              <ThemedText style={styles.helpText}>
                Organize suas tarefas criando listas temáticas. Você pode ter listas para trabalho, 
                casa, projetos pessoais, etc.
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

import styles from '@/styles/listas.styles'