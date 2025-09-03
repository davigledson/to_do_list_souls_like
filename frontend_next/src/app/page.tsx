'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Trash2, Coins, User } from 'lucide-react';
import TaskService, { Task } from '../services/TaskService';
import UserService, { User as UserType } from '../services/UserService';

interface TaskFormData {
  title: string;
  description: string;
  reward: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    reward: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carrega tasks e usuário (assumindo userId padrão para demo)
      const [tasksData, usersData] = await Promise.all([
        TaskService.listarTodos(),
        UserService.listarTodos()
      ]);
      
      setTasks(tasksData);
      if (usersData.length > 0) {
        setUser(usersData[0]); // Usa o primeiro usuário como demo
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        // Atualiza task existente
        const updatedTask = await TaskService.atualizar(editingTask._id, {
          ...editingTask,
          title: formData.title,
          description: formData.description,
          reward: formData.reward
        });
        
        setTasks(tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ));
      } else {
        // Cria nova task
        const newTask = await TaskService.criar({
          title: formData.title,
          description: formData.description,
          completed: false,
          userId: user?._id || 'demo-user',
          reward: formData.reward
        });
        
        setTasks([...tasks, newTask]);
      }
      
      // Reset form
      setFormData({ title: '', description: '', reward: 0 });
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar task:', error);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const updatedTask = await TaskService.atualizarParcial(task._id, {
        completed: !task.completed
      });
      
      setTasks(tasks.map(t => 
        t._id === updatedTask._id ? updatedTask : t
      ));

      // Se completou a task e tem reward, atualiza o saldo do usuário
      if (!task.completed && updatedTask.completed && task.reward && user) {
        const updatedUser = await UserService.atualizarParcial(user._id, {
          balance: (user.balance || 0) + task.reward
        });
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro ao atualizar task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await TaskService.deletar(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Erro ao deletar task:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      reward: task.reward || 0
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', reward: 0 });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Minha Lista de Tarefas
            </h1>
            <p className="text-gray-600">
              Complete suas tarefas e ganhe recompensas!
            </p>
          </div>
          
          {user && (
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
              <User className="w-5 h-5 text-gray-600 mr-2" />
              <div className="text-right">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <div className="flex items-center text-yellow-600">
                  <Coins className="w-4 h-4 mr-1" />
                  <span className="font-bold">{user.balance || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Tarefas</h3>
            <p className="text-3xl font-bold text-indigo-600">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Concluídas</h3>
            <p className="text-3xl font-bold text-green-600">
              {tasks.filter(task => task.completed).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pendentes</h3>
            <p className="text-3xl font-bold text-orange-600">
              {tasks.filter(task => !task.completed).length}
            </p>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Tarefa
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <p className="text-gray-500 text-lg">
                Nenhuma tarefa encontrada. Crie sua primeira tarefa!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${
                  task.completed ? 'border-green-500' : 'border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-indigo-500'
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${
                          task.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                      
                      {task.reward && (
                        <div className="flex items-center mt-2">
                          <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-yellow-600 font-semibold">
                            {task.reward} moedas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recompensa (moedas)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reward}
                  onChange={(e) =>
                    setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  {editingTask ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}