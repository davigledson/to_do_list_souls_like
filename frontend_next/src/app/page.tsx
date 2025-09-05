'use client';

import React, { useState, useEffect } from 'react';
import TodoService, { Todo, Task } from '@/services/TodoService';
import TaskService from '@/services/TaskService';

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
      await TaskService.completar(taskId);
      if (selectedTodo?.id) {
        const updatedTodo = await TodoService.buscarPorId(selectedTodo.id);
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(t => t.id === selectedTodo.id ? updatedTodo : t));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Todos & Tasks</h1>
              <p className="text-gray-600">{todos.length} todos | {selectedTodo?.tasks?.length || 0} tasks</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTodoForm(!showTodoForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                {showTodoForm ? 'Cancelar' : '+ Todo'}
              </button>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                disabled={!selectedTodo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
              >
                {showTaskForm ? 'Cancelar' : '+ Task'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulários */}
        {showTodoForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Novo Todo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título do Todo"
                value={todoForm.title}
                onChange={(e) => setTodoForm({...todoForm, title: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Nome do Usuário (opcional)"
                value={todoForm.user_name}
                onChange={(e) => setTodoForm({...todoForm, user_name: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateTodo}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg mr-3"
              >
                Criar Todo
              </button>
            </div>
          </div>
        )}

        {showTaskForm && selectedTodo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Nova Task - {selectedTodo.title} (ID: {selectedTodo.id})
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título da Task"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={taskForm.is_completed}
                  onChange={(e) => setTaskForm({...taskForm, is_completed: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-gray-700">Marcar como completada</label>
              </div>
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                Debug: Todo ID selecionado = {selectedTodo.id} | Título = "{taskForm.title}" | Completada = {taskForm.is_completed ? 'Sim' : 'Não'}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateTask}
                disabled={!taskForm.title.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
              >
                Criar Task
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Lista de Todos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Todos</h2>
              {todos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum todo encontrado</p>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedTodo?.id === todo.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTodo(todo)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{todo.title}</h3>
                          {todo.user_name && (
                            <p className="text-sm text-gray-500">{todo.user_name}</p>
                          )}
                          <p className="text-xs text-gray-400">{todo.tasks?.length || 0} tasks</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTodo(todo.id!);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Deletar todo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tasks do Todo Selecionado */}
          <div className="lg:col-span-3">
            {!selectedTodo ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Selecione um Todo</h3>
                <p className="text-gray-600">Clique em um todo à esquerda para ver suas tasks</p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTodo.title}</h2>
                      {selectedTodo.user_name && (
                        <p className="text-gray-600">Por: {selectedTodo.user_name}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedTodo.tasks?.length || 0} tasks • 
                        {selectedTodo.tasks?.filter(t => t.is_completed).length || 0} completadas
                      </p>
                    </div>
                  </div>
                </div>

                {!selectedTodo.tasks || selectedTodo.tasks.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma task encontrada</h3>
                    <p className="text-gray-600">Clique em "+ Task" para criar a primeira task</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTodo.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                          task.is_completed ? 'border-green-500' : 'border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${
                                task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                task.is_completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {task.is_completed ? 'Completada' : 'Pendente'}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className={`text-gray-600 mb-3 ${
                                task.is_completed ? 'line-through' : ''
                              }`}>
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!task.is_completed && (
                              <button
                                onClick={() => handleCompleteTask(task.id!)}
                                className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors"
                                title="Completar task"
                              >
                                ✓
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteTask(task.id!)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                              title="Deletar task"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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