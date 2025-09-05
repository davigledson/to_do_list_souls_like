'use client';

import React, { useState, useEffect, useRef } from 'react';
import TodoService, { Todo, Task } from '@/services/TodoService';
import TaskService from '@/services/TaskService';

// Componente de partículas animadas para o fundo
const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Partículas
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

    // Criar partículas
    for (let i = 0; i < 500; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 5 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Animação
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Atualizar posição
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reposicionar se sair da tela
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Desenhar partícula
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Desenhar conexões entre partículas próximas
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.save();
            ctx.globalAlpha = (150 - distance) / 150 * 0.1;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #836816 100%)' }}
    />
  );
};

const TodosTasksPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // Form data
  const [todoForm, setTodoForm] = useState({ title: '', user_name: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', is_completed: false });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await TodoService.listarTodos();
      setTodos(data);
      if (data.length > 0 && !selectedTodo) {
        setSelectedTodo(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!todoForm.title.trim()) return;
    
    try {
      const newTodo = await TodoService.criar(todoForm);
      setTodos([...todos, newTodo]);
      setTodoForm({ title: '', user_name: '' });
      setShowTodoForm(false);
      if (!selectedTodo) setSelectedTodo(newTodo);
    } catch (error) {
      console.error('Erro ao criar todo:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !selectedTodo?.id) return;
    
    try {
      const taskData = {
        ...taskForm,
        todo_id: selectedTodo.id
      };
      
      await TaskService.criar(taskData);
      
      // Recarregar o todo selecionado
      const updatedTodo = await TodoService.buscarPorId(selectedTodo.id);
      setSelectedTodo(updatedTodo);
      setTodos(todos.map(t => t.id === selectedTodo.id ? updatedTodo : t));
      
      setTaskForm({ title: '', description: '', is_completed: false });
      setShowTaskForm(false);
    } catch (error) {
      console.error('Erro ao criar task:', error);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      const completedTask = await TaskService.completar(taskId);
      console.log('Task completada:', completedTask);
      
      if (selectedTodo?.id) {
        // Atualizar o estado local imediatamente
        const updatedTasks = selectedTodo.tasks?.map(task => 
          task.id === taskId 
            ? { ...task, is_completed: true }
            : task
        ) || [];
        
        const updatedTodo = { ...selectedTodo, tasks: updatedTasks };
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(t => t.id === selectedTodo.id ? updatedTodo : t));
        
        // Depois recarregar do servidor para garantir sincronização
        setTimeout(async () => {
          const refreshedTodo = await TodoService.buscarPorId(selectedTodo.id);
          setSelectedTodo(refreshedTodo);
          setTodos(todos.map(t => t.id === selectedTodo.id ? refreshedTodo : t));
        }, 200);
      }
    } catch (error) {
      console.error('Erro ao completar task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Deletar esta task?')) return;
    
    try {
      await TaskService.deletar(taskId);
      if (selectedTodo?.id) {
        const updatedTodo = await TodoService.buscarPorId(selectedTodo.id);
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(t => t.id === selectedTodo.id ? updatedTodo : t));
      }
    } catch (error) {
      console.error('Erro ao deletar task:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (!confirm('Deletar todo e todas suas tasks?')) return;
    
    try {
      await TodoService.deletar(todoId);
      const newTodos = todos.filter(t => t.id !== todoId);
      setTodos(newTodos);
      
      if (selectedTodo?.id === todoId) {
        setSelectedTodo(newTodos.length > 0 ? newTodos[0] : null);
      }
    } catch (error) {
      console.error('Erro ao deletar todo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200/30 border-t-purple-300 animate-pulse mx-auto"></div>
            </div>
            <p className="text-white font-medium text-lg">Carregando todos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Melhorado */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 hover:shadow-3xl transition-all duration-500 hover:bg-white/95">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Todos & Tasks
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100/80 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-700 font-medium text-sm">{todos.length} todos</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/80 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 font-medium text-sm">{selectedTodo?.tasks?.length || 0} tasks</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowTodoForm(!showTodoForm)}
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg transition-transform duration-300 group-hover:rotate-180">{showTodoForm ? '✕' : '+'}</span>
                  {showTodoForm ? 'Cancelar' : 'Novo Todo'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                disabled={!selectedTodo}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg transition-transform duration-300 group-hover:rotate-180">{showTaskForm ? '✕' : '+'}</span>
                  {showTaskForm ? 'Cancelar' : 'Nova Task'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Formulários Melhorados */}
        {showTodoForm && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 transform transition-all duration-500 animate-in slide-in-from-top-5">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">+</span>
              </div>
              Novo Todo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Todo *</label>
                <input
                  type="text"
                  placeholder="Digite o título..."
                  value={todoForm.title}
                  onChange={(e) => setTodoForm({...todoForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Usuário</label>
                <input
                  type="text"
                  placeholder="Seu nome (opcional)"
                  value={todoForm.user_name}
                  onChange={(e) => setTodoForm({...todoForm, user_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleCreateTodo}
                disabled={!todoForm.title.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                Criar Todo
              </button>
            </div>
          </div>
        )}

        {showTaskForm && selectedTodo && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 transform transition-all duration-500 animate-in slide-in-from-top-5">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">+</span>
              </div>
              Nova Task para "{selectedTodo.title}"
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título da Task *</label>
                <input
                  type="text"
                  placeholder="Digite o título da task..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  placeholder="Descreva os detalhes da task (opcional)"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm resize-none hover:bg-white/90"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50/70 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
                <input
                  type="checkbox"
                  id="completed"
                  checked={taskForm.is_completed}
                  onChange={(e) => setTaskForm({...taskForm, is_completed: e.target.checked})}
                  className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="completed" className="text-gray-700 font-medium">
                  Marcar como completada
                </label>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleCreateTask}
                disabled={!taskForm.title.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                Criar Task
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Lista de Todos Melhorada */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-6 hover:shadow-3xl transition-all duration-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded animate-pulse"></div>
                </div>
                Todos
              </h2>
              {todos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-gray-400">📝</span>
                  </div>
                  <p className="text-gray-500 font-medium text-lg">Nenhum todo encontrado</p>
                  <p className="text-gray-400 text-sm mt-1">Clique em "Novo Todo" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todos.map((todo) => {
                    const completedTasks = todo.tasks?.filter(t => t.is_completed).length || 0;
                    const totalTasks = todo.tasks?.length || 0;
                    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                    
                    return (
                      <div
                        key={todo.id}
                        className={`group p-5 rounded-2xl cursor-pointer border-2 transition-all duration-500 hover:shadow-xl transform hover:scale-105 ${
                          selectedTodo?.id === todo.id
                            ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-blue-300 shadow-lg backdrop-blur-sm'
                            : 'border-gray-200/50 hover:border-gray-300/70 bg-white/70 hover:bg-white/90 backdrop-blur-sm'
                        }`}
                        onClick={() => setSelectedTodo(todo)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300 text-lg">
                              {todo.title}
                            </h3>
                            {todo.user_name && (
                              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                {todo.user_name}
                              </p>
                            )}
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{completedTasks}/{totalTasks} concluídas</span>
                                <span className="font-medium">{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                  style={{width: `${progress}%`}}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTodo(todo.id!);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                            title="Deletar todo"
                          >
                            <span className="text-lg">×</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tasks do Todo Selecionado Melhoradas */}
          <div className="lg:col-span-3">
            {!selectedTodo ? (
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-20 text-center hover:shadow-3xl transition-all duration-500">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-6xl">🎯</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Selecione um Todo</h3>
                <p className="text-gray-600 text-xl">Clique em um todo à esquerda para ver suas tasks</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Header do Todo Selecionado */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {selectedTodo.title}
                      </h2>
                      {selectedTodo.user_name && (
                        <p className="text-gray-600 mt-3 flex items-center gap-2 text-lg">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          Criado por: <span className="font-medium">{selectedTodo.user_name}</span>
                        </p>
                      )}
                      
                      {/* Estatísticas */}
                      <div className="flex flex-wrap items-center gap-4 mt-6">
                        <div className="flex items-center gap-2 px-5 py-3 bg-blue-100/80 rounded-full backdrop-blur-sm">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-blue-700 font-medium">
                            {selectedTodo.tasks?.length || 0} tasks total
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-green-100/80 rounded-full backdrop-blur-sm">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700 font-medium">
                            {selectedTodo.tasks?.filter(t => t.is_completed).length || 0} concluídas
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-orange-100/80 rounded-full backdrop-blur-sm">
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-orange-700 font-medium">
                            {selectedTodo.tasks?.filter(t => !t.is_completed).length || 0} pendentes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Tasks */}
                {!selectedTodo.tasks || selectedTodo.tasks.length === 0 ? (
                  <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-20 text-center hover:shadow-3xl transition-all duration-500">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                      <span className="text-6xl">📋</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">Nenhuma task encontrada</h3>
                    <p className="text-gray-600 text-xl mb-8">Clique em "Nova Task" para criar a primeira task</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedTodo.tasks.map((task) => {
                      const isCompleted = task.is_completed === true || task.is_completed === 1;
                      
                      return (
                        <div
                          key={task.id}
                          className={`group bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-l-6 transition-all duration-500 hover:shadow-3xl transform hover:scale-[1.02] ${
                            isCompleted 
                              ? 'border-green-500 bg-gradient-to-r from-green-50/70 to-emerald-50/70' 
                              : 'border-blue-500 bg-gradient-to-r from-blue-50/70 to-indigo-50/70'
                          }`}
                        >
                          <div className="p-8">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                  <h3 className={`text-2xl font-bold transition-all duration-300 ${
                                    isCompleted 
                                      ? 'text-green-700 line-through' 
                                      : 'text-gray-900 group-hover:text-blue-600'
                                  }`}>
                                    {task.title}
                                  </h3>
                                  
                                  <div className={`px-4 py-2 text-xs rounded-full font-bold uppercase tracking-wide transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                      : 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-lg'
                                  }`}>
                                    {isCompleted ? '✓ Concluída' : '⏳ Pendente'}
                                  </div>
                                </div>
                                
                                {task.description && (
                                  <p className={`text-gray-600 text-lg leading-relaxed transition-all duration-300 ${
                                    isCompleted ? 'line-through opacity-75' : ''
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-4 ml-6">
                                {!isCompleted && (
                                  <button
                                    onClick={() => handleCompleteTask(task.id!)}
                                    className="group/btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-110"
                                    title="Marcar como concluída"
                                  >
                                    <span className="text-lg font-bold">✓</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteTask(task.id!)}
                                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white p-4 rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-110"
                                  title="Deletar task"
                                >
                                  <span className="text-lg font-bold">×</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodosTasksPage;