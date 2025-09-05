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
import TaskService from '../../services/TaskService';

export default function TasksPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const todosData = await TodoService.listarTodos();
      setTodos(todosData);
      
      if (todosData.length > 0) {
        const currentTodo = selectedTodo 
          ? todosData.find(t => t.id === selectedTodo.id) || todosData[0]
          : todosData[0];
        
        const todoWithTasks = await TodoService.buscarPorId(currentTodo.id);
        setSelectedTodo(todoWithTasks);
        setTasks(todoWithTasks.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar os dados. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTodo]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleTodoSelect = async (todo) => {
    try {
      const todoWithTasks = await TodoService.buscarPorId(todo.id);
      setSelectedTodo(todoWithTasks);
      setTasks(todoWithTasks.tasks || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    }
  };

  const handleSaveTask = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório.');
      return;
    }

    if (!selectedTodo) {
      Alert.alert('Erro', 'Selecione uma lista primeiro.');
      return;
    }

    try {
      if (editingTask) {
        const updatedTask = await TaskService.atualizar(editingTask.id, {
          title: formData.title,
          description: formData.description,
        });
        setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
      } else {
        const newTask = await TaskService.criar({
          title: formData.title,
          description: formData.description,
          is_completed: false,
          todo_id: selectedTodo.id,
        });
        setTasks([...tasks, newTask]);
      }
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
      Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
    }
  };

  const toggleTaskComplete = async (taskToToggle) => {
    try {
      const updatedTask = await TaskService.completar(taskToToggle.id);
      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    } catch (err) {
      console.error('Erro ao completar tarefa:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await TaskService.deletar(taskId);
              setTasks(tasks.filter(task => task.id !== taskId));
            } catch (err) {
              console.error('Erro ao deletar tarefa:', err);
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
    });
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setEditingTask(null);
    setIsModalVisible(false);
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task.is_completed);
      case 'pending':
        return tasks.filter(task => !task.is_completed);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const completedCount = tasks.filter(task => task.is_completed).length;
  const pendingCount = tasks.length - completedCount;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#A5B4FC' : '#4F46E5'} />
        <ThemedText style={styles.centerText}>Carregando suas tarefas...</ThemedText>
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

  if (todos.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="folder-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.centerText}>Nenhuma lista encontrada</ThemedText>
        <ThemedText style={[styles.centerText, styles.subtitle]}>
          Crie uma lista primeiro para adicionar tarefas
        </ThemedText>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#7C3AED', dark: '#5B21B6' }}
      headerImage={
        <View style={styles.headerContent}>
          <Ionicons 
            name="checkmark-done-outline" 
            size={80} 
            color={isDark ? '#C4B5FD' : '#EDE9FE'} 
            style={styles.headerIcon}
          />
        </View>
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Gerenciar Tarefas</ThemedText>
        <ThemedText style={styles.subtitle}>
          Organize e complete suas atividades
        </ThemedText>
      </ThemedView>

      {/* Seletor de Todo */}
      <ThemedView style={styles.todoSelector}>
        <ThemedText style={styles.selectorLabel}>Lista atual:</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.todoScrollView}>
          {todos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={[
                styles.todoChip,
                {
                  backgroundColor: selectedTodo?.id === todo.id 
                    ? (isDark ? '#7C3AED' : '#8B5CF6')
                    : (isDark ? '#374151' : '#F3F4F6')
                }
              ]}
              onPress={() => handleTodoSelect(todo)}
            >
              <ThemedText style={[
                styles.todoChipText,
                {
                  color: selectedTodo?.id === todo.id 
                    ? 'white'
                    : (isDark ? '#F9FAFB' : '#374151')
                }
              ]}>
                {todo.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Filtros */}
      <ThemedView style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <ThemedText style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas ({tasks.length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <ThemedText style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pendentes ({pendingCount})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <ThemedText style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Concluídas ({completedCount})
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {selectedTodo && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: isDark ? '#7C3AED' : '#8B5CF6' }]} 
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Nova Tarefa</Text>
        </TouchableOpacity>
      )}

      <ThemedView style={styles.tasksContainer}>
        {!selectedTodo ? (
          <View style={styles.emptyState}>
            <Ionicons name="arrow-up-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyStateText}>Selecione uma lista acima</ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>Escolha uma lista para ver suas tarefas</ThemedText>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyStateText}>
              {filter === 'all' ? 'Nenhuma tarefa ainda' : 
               filter === 'pending' ? 'Nenhuma tarefa pendente' : 
               'Nenhuma tarefa concluída'}
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              {filter === 'all' ? 'Que tal adicionar sua primeira tarefa?' : 
               filter === 'pending' ? 'Todas as tarefas foram concluídas!' : 
               'Complete algumas tarefas para vê-las aqui'}
            </ThemedText>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View key={task.id} style={[
              styles.taskCard, 
              { 
                backgroundColor: isDark ? '#1F2937' : 'white', 
                borderLeftColor: task.is_completed ? '#10B981' : '#8B5CF6',
                opacity: task.is_completed && filter !== 'completed' ? 0.7 : 1
              }
            ]}>
              <View style={styles.taskMain}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox, 
                    task.is_completed ? styles.checkboxCompleted : styles.checkboxEmpty
                  ]} 
                  onPress={() => toggleTaskComplete(task)}
                >
                  {task.is_completed && <Ionicons name="checkmark" size={16} color="white" />}
                </TouchableOpacity>
                
                <View style={styles.taskContent}>
                  <ThemedText style={[
                    styles.taskTitle, 
                    task.is_completed && styles.taskTitleCompleted
                  ]}>
                    {task.title}
                  </ThemedText>
                  {task.description && (
                    <ThemedText style={[
                      styles.taskDescription, 
                      task.is_completed && styles.taskDescriptionCompleted
                    ]}>
                      {task.description}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.taskDate}>
                    Criada em: {new Date(task.created_at).toLocaleDateString('pt-BR')}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.taskActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(task)}>
                  <Ionicons name="pencil" size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteTask(task.id)}>
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ThemedView>

      {/* Modal para criar/editar Tarefa */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#111827' : 'white' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm}>
              <ThemedText style={styles.modalCancel}>Cancelar</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveTask}>
              <ThemedText style={styles.modalSave}>Salvar</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.selectedTodoInfo}>
              <Ionicons name="folder-outline" size={20} color="#8B5CF6" />
              <ThemedText style={styles.selectedTodoText}>
                Lista: {selectedTodo?.title}
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Título da Tarefa *</ThemedText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  borderColor: isDark ? '#4B5563' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827'
                }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Ex: Estudar React Native, Fazer compras..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Descrição</ThemedText>
              <TextInput
                style={[styles.textArea, {
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  borderColor: isDark ? '#4B5563' : '#D1D5DB',
                  color: isDark ? '#F9FAFB' : '#111827'
                }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descreva os detalhes da tarefa (opcional)"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.helpContainer}>
              <Ionicons name="lightbulb-outline" size={20} color="#8B5CF6" />
              <ThemedText style={styles.helpText}>
                Dica: Seja específico no título e use a descrição para adicionar detalhes importantes.
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

import styles from '@/styles/tarefas.styles'