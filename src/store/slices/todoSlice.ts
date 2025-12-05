import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoState {
  items: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const initialState: TodoState = {
  items: [],
  filter: 'all',
};

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // 添加待办事项
    addTodo: (state, action: PayloadAction<Omit<Todo, 'id' | 'createdAt'>>) => {
      const newTodo: Todo = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      state.items.push(newTodo);
    },

    // 删除待办事项
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    // 更新待办事项
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // 切换完成状态
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    // 设置过滤器
    setFilter: (state, action: PayloadAction<TodoState['filter']>) => {
      state.filter = action.payload;
    },

    // 清空所有已完成的任务
    clearCompleted: (state: TodoState) => {
      state.items = state.items.filter(item => !item.completed);
    },

    // 加载持久化数据
    loadFromStorage: (_state: TodoState, action: PayloadAction<TodoState>) => {
      return action.payload;
    },
  },
});

export const {
  addTodo,
  removeTodo,
  updateTodo,
  toggleTodo,
  setFilter,
  clearCompleted,
  loadFromStorage,
} = todoSlice.actions;

export default todoSlice.reducer;
