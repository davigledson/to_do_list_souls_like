'use client';

import React, { useState, useEffect } from 'react';
import TaskService, { Task } from '@/services/TaskService';
import TodoService, { Todo } from '@/services/ToDoService';

const TodosTasksPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados dos formulários
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Dados dos formulários
  const [todoFormData, setTodoFormData] = useState({
    title: '',
    user_name: ''
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    todo_id: 0,
    is_completed: false
  });

  // Carregar todos ao montar o componente
  useEffect(() => {
    carregarTodos();
  }, []);

  const carregarTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const todosList = await TodoService.listarTodos();
      setTodos(todosList);
      if (todosList.length > 0 && !selectedTodo) {
        setSelectedTodo(todosList[0]);
      }
    } catch (err) {
      setError('Erro ao carregar todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Todos
  const handleTodoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (editingTodo) {
        const updatedTodo = await TodoService.atualizar(editingTodo.id!, todoFormData);
        setTodos(todos.map(todo => todo.id === editingTodo.id ? updatedTodo : todo));
        if (selectedTodo?.id === editingTodo.id) {
          setSelectedTodo(updatedTodo);
        }
        setEditingTodo(null);
      } else {
        const newTodo = await TodoService.criar(todoFormData);
        setTodos([...todos, newTodo]);
        if (!selectedTodo) {
          setSelectedTodo(newTodo);
        }
      }

      setTodoFormData({ title: '', user_name: '' });
      setShowTodoForm(false);
    } catch (err) {
      setError(editingTodo ? 'Erro ao atualizar todo' : 'Erro ao criar todo');
      console.error(err);
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setTodoFormData({
      title: todo.title,
      user_name: todo.user_name || ''
    });
    setShowTodoForm(true);
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (!confirm('Tem certeza? Isso deletará todas as tasks deste todo.')) return;

    try {
      setError(null);
      await TodoService.deletar(todoId);
      const newTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(newTodos);
      
      if (selectedTodo?.id === todoId) {
        setSelectedTodo(newTodos.length > 0 ? newTodos[0] : null);
      }
    } catch (err) {
      setError('Erro ao deletar todo');
      console.error(err);
    }
  };

  // Handlers para Tasks
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTodo) return;

    try {
      setError(null);
      const taskData = { ...taskFormData, todo_id: selectedTodo.id! };

      if (editingTask) {
        const updatedTask = await TaskService.atualizar(editingTask.id!, taskData);
        // Recarregar o todo selecionado para pegar as tasks atualizadas
        const updatedTodo = await TodoService.buscarPorId(selectedTodo.id!);
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(todo => todo.id === selectedTodo.id ? updatedTodo : todo));
        setEditingTask(null);
      } else {
        const newTask = await TaskService.criar(taskData);
        // Recarregar o todo selecionado
        const updatedTodo = await TodoService.buscarPorId(selectedTodo.id!);
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(todo => todo.id === selectedTodo.id ? updatedTodo : todo));
      }

      setTaskFormData({ title: '', description: '', todo_id: 0, is_completed: false });
      setShowTaskForm(false);
    } catch (err) {
      setError(editingTask ? 'Erro ao atualizar task' : 'Erro ao criar task');
      console.error(err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      todo_id: task.todo_id,
      is_completed: task.is_completed
    });
    setShowTaskForm(true);
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      setError(null);
      await TaskService.completar(task.id!);
      // Recarregar o todo selecionado
      if (selectedTodo) {
        const updatedTodo = await TodoService.buscarPorId(selectedTodo.id!);
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(todo => todo.id === selectedTodo.id ? updatedTodo : todo));
      }
    } catch (err) {
      setError('Erro ao completar task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta task?')) return;

    try {
      setError(null);
      await TaskService.deletar(taskId);
      // Recarregar o todo selecionado
      if (selectedTodo) {
        const updatedTodo = await TodoService.buscarPorId(selectedTodo.id!);
        setSelectedTodo(updatedTodo);
        setTodos(todos.map(todo => todo.id === selectedTodo.id ? updatedTodo : todo));
      }
    } catch (err) {
      setError('Erro ao deletar task');
      console.error(err);
    }
  };

  const cancelForms = () => {
    setShowTodoForm(false);
    setShowTaskForm(false);
    setEditingTodo(null);
    setEditingTask(null);
    setTodoFormData({ title: '', user_name: '' });
    setTaskFormData({ title: '', description: '', todo_id: 0, is_completed: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciamento de Todos & Tasks
              </h1>
              <p className="text-gray-600 mt-2">
                {todos.length} todo(s) | {selectedTodo ? selectedTodo.tasks?.length || 0 : 0} task(s) no todo selecionado
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTodoForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
              >
                + Novo Todo
              </button>
              <button
                onClick={() => setShowTaskForm(true)}
                disabled={!selectedTodo}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm ${
                  selectedTodo
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                + Nova Task
              </button>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Lista de Todos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Todos</h2>
              
              {todos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum todo encontrado
                </p>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                        selectedTodo?.id === todo.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTodo(todo)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {todo.title}
                          </h3>
                          {todo.user_name && (
                            <p className="text-sm text-gray-500">
                              {todo.user_name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {todo.tasks?.length || 0} tasks
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTodo(todo);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar todo"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTodo(todo.id!);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Deletar todo"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formulários */}
          <div className="lg:col-span-1">
            {(showTodoForm || showTaskForm) && (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                
                {/* Formulário de Todo */}
                {showTodoForm && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {editingTodo ? 'Editar Todo' : 'Novo Todo'}
                    </h2>
                    
                    <form onSubmit={handleTodoSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título *
                        </label>
                        <input
                          type="text"
                          required
                          value={todoFormData.title}
                          onChange={(e) => setTodoFormData({...todoFormData, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Digite o título do todo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Usuário
                        </label>
                        <input
                          type="text"
                          value={todoFormData.user_name}
                          onChange={(e) => setTodoFormData({...todoFormData, user_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nome do usuário (opcional)"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                        >
                          {editingTodo ? 'Atualizar' : 'Criar Todo'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelForms}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* Formulário de Task */}
                {showTaskForm && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {editingTask ? 'Editar Task' : 'Nova Task'}
                      {selectedTodo && (
                        <span className="text-sm text-gray-500 block">
                          em "{selectedTodo.title}"
                        </span>
                      )}
                    </h2>
                    
                    <form onSubmit={handleTaskSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título *
                        </label>
                        <input
                          type="text"
                          required
                          value={taskFormData.title}
                          onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite o título da task"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={taskFormData.description}
                          onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite a descrição (opcional)"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="completed"
                          checked={taskFormData.is_completed}
                          onChange={(e) => setTaskFormData({...taskFormData, is_completed: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">
                          Task completada
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                        >
                          {editingTask ? 'Atualizar' : 'Criar Task'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelForms}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Lista de Tasks do Todo Selecionado */}
          <div className={`${(showTodoForm || showTaskForm) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {!selectedTodo ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Todo</h3>
                <p className="text-gray-600">Clique em um todo na lista lateral para ver suas tasks.</p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedTodo.title}
                  </h2>
                  {selectedTodo.user_name && (
                    <p className="text-gray-600 mb-2">Usuário: {selectedTodo.user_name}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Total: {selectedTodo.tasks?.length || 0} tasks
                    </span>
                    <span>
                      Completadas: {selectedTodo.tasks?.filter(t => t.is_completed).length || 0}
                    </span>
                    {selectedTodo.created_at && (
                      <span>
                        Criado: {new Date(selectedTodo.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {!selectedTodo.tasks || selectedTodo.tasks.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma task encontrada</h3>
                    <p className="text-gray-600">Clique em "Nova Task" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTodo.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                          task.is_completed ? 'border-green-400' : 'border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${
                                task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
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

                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {task.created_at && (
                                <span>
                                  Criada: {new Date(task.created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!task.is_completed && (
                              <button
                                onClick={() => handleCompleteTask(task)}
                                className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-md transition-colors duration-200"
                                title="Completar task"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleEditTask(task)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-md transition-colors duration-200"
                              title="Editar task"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTask(task.id!)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors duration-200"
                              title="Deletar task"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
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