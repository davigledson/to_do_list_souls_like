import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  StyleSheet, 
  ScrollView, 
  Alert,
  useColorScheme 
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Interfaces baseadas nos seus services
interface Task {
  _key: string;
  _id: string;
  _rev: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  reward?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _key: string;
  _id: string;
  _rev: string;
  name: string;
  email: string;
  balance?: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User>({
    _key: 'user1',
    _id: 'user1',
    _rev: 'rev1',
    name: 'Davi Gledson',
    email: 'davi@example.com',
    balance: 150
  });
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: ''
  });

  // Mock de dados iniciais
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _key: '1',
        _id: '1',
        _rev: 'rev1',
        title: 'Estudar React Native',
        description: 'Completar tutorial de todo list',
        completed: false,
        userId: 'user1',
        reward: 50,
        createdAt: new Date().toISOString()
      },
      {
        _key: '2',
        _id: '2',
        _rev: 'rev2',
        title: 'Fazer exercícios',
        description: 'Academia - treino de pernas',
        completed: true,
        userId: 'user1',
        reward: 30,
        createdAt: new Date().toISOString()
      },
      {
        _key: '3',
        _id: '3',
        _rev: 'rev3',
        title: 'Ler livro técnico',
        description: 'Continuar lendo Clean Code',
        completed: false,
        userId: 'user1',
        reward: 40,
        createdAt: new Date().toISOString()
      }
    ];
    setTasks(mockTasks);
  }, []);

  // Funções
  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    const newTask: Task = {
      _key: Date.now().toString(),
      _id: Date.now().toString(),
      _rev: 'rev1',
      title: formData.title,
      description: formData.description,
      completed: false,
      userId: user._id,
      reward: parseInt(formData.reward) || 0,
      createdAt: new Date().toISOString()
    };

    if (editingTask) {
      // Editando task existente
      setTasks(tasks.map(task => 
        task._id === editingTask._id 
          ? { ...task, ...newTask, _id: editingTask._id, _key: editingTask._key }
          : task
      ));
    } else {
      // Nova task
      setTasks([...tasks, newTask]);
    }

    resetForm();
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task._id === taskId) {
        const updatedTask = { ...task, completed: !task.completed };
        
        // Se completou a task, adiciona recompensa
        if (!task.completed && updatedTask.completed && task.reward) {
          setUser(prev => ({ 
            ...prev, 
            balance: (prev.balance || 0) + (task.reward || 0) 
          }));
        }
        // Se descompletou, remove recompensa
        else if (task.completed && !updatedTask.completed && task.reward) {
          setUser(prev => ({ 
            ...prev, 
            balance: (prev.balance || 0) - (task.reward || 0) 
          }));
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => setTasks(tasks.filter(task => task._id !== taskId))
        }
      ]
    );
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      reward: task.reward?.toString() || ''
    });
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', reward: '' });
    setEditingTask(null);
    setIsModalVisible(false);
  };

  // Estatísticas
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#4F46E5', dark: '#312E81' }}
      headerImage={
        <View style={styles.headerContent}>
          <Ionicons 
            name="checkbox-outline" 
            size={80} 
            color={isDark ? '#A5B4FC' : '#EEF2FF'} 
            style={styles.headerIcon}
          />
        </View>
      }>
      
      {/* Header com informações do usuário */}
      <ThemedView style={styles.userContainer}>
        <View style={styles.userInfo}>
          <ThemedText type="title">Olá, {user.name}! 👋</ThemedText>
          <ThemedText style={styles.subtitle}>
            Vamos ser produtivos hoje?
          </ThemedText>
        </View>
        <View style={[styles.balanceContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          <Ionicons name="diamond" size={16} color="#F59E0B" />
          <ThemedText style={styles.balanceText}>{user.balance || 0}</ThemedText>
        </View>
      </ThemedView>

      {/* Estatísticas */}
      <ThemedView style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#EFF6FF' }]}>
          <ThemedText style={styles.statNumber}>{tasks.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#F0FDF4' }]}>
          <ThemedText style={[styles.statNumber, { color: '#10B981' }]}>
            {completedTasks}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Concluídas</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }]}>
          <ThemedText style={[styles.statNumber, { color: '#F59E0B' }]}>
            {pendingTasks}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Pendentes</ThemedText>
        </View>
      </ThemedView>

      {/* Botão para adicionar task */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: isDark ? '#4F46E5' : '#6366F1' }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Nova Tarefa</Text>
      </TouchableOpacity>

      {/* Lista de tasks */}
      <ThemedView style={styles.tasksContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Suas Tarefas
        </ThemedText>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="clipboard-outline" 
              size={64} 
              color={isDark ? '#6B7280' : '#9CA3AF'} 
            />
            <ThemedText style={styles.emptyText}>
              Nenhuma tarefa encontrada
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Crie sua primeira tarefa tocando no botão acima
            </ThemedText>
          </View>
        ) : (
          tasks.map((task) => (
            <View 
              key={task._id} 
              style={[
                styles.taskCard, 
                { 
                  backgroundColor: isDark ? '#1F2937' : 'white',
                  borderLeftColor: task.completed ? '#10B981' : '#6366F1'
                }
              ]}
            >
              <View style={styles.taskMain}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    { 
                      backgroundColor: task.completed ? '#10B981' : 'transparent',
                      borderColor: task.completed ? '#10B981' : '#D1D5DB'
                    }
                  ]}
                  onPress={() => toggleTaskComplete(task._id)}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                
                <View style={styles.taskContent}>
                  <ThemedText 
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted
                    ]}
                  >
                    {task.title}
                  </ThemedText>
                  
                  {task.description && (
                    <ThemedText 
                      style={[
                        styles.taskDescription,
                        task.completed && styles.taskDescriptionCompleted
                      ]}
                    >
                      {task.description}
                    </ThemedText>
                  )}
                  
                  {task.reward && (
                    <View style={styles.rewardContainer}>
                      <Ionicons name="diamond" size={12} color="#F59E0B" />
                      <ThemedText style={styles.rewardText}>
                        {task.reward} moedas
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.taskActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => editTask(task)}
                >
                  <Ionicons name="pencil" size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => deleteTask(task._id)}
                >
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ThemedView>

      {/* Modal para criar/editar task */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#111827' : 'white' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm}>
              <ThemedText style={styles.modalCancel}>Cancelar</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </ThemedText>
            <TouchableOpacity onPress={handleCreateTask}>
              <ThemedText style={styles.modalSave}>Salvar</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Título *</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    color: isDark ? 'white' : 'black',
                    borderColor: isDark ? '#374151' : '#D1D5DB'
                  }
                ]}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Digite o título da tarefa"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Descrição</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  { 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    color: isDark ? 'white' : 'black',
                    borderColor: isDark ? '#374151' : '#D1D5DB'
                  }
                ]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Descrição opcional"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Recompensa (moedas)</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    color: isDark ? 'white' : 'black',
                    borderColor: isDark ? '#374151' : '#D1D5DB'
                  }
                ]}
                value={formData.reward}
                onChangeText={(text) => setFormData({...formData, reward: text})}
                placeholder="0"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    position: 'absolute',
    bottom: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  userInfo: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  balanceText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  tasksContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    lineHeight: 20,
  },
  taskDescriptionCompleted: {
    opacity: 0.5,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    color: '#6B7280',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSave: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
});