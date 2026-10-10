import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  currentTab: 'articles' | 'admin' | 'my-posts';
  isNewPostOpen: boolean;
  isAuthOpen: boolean;
  isApiDocsOpen: boolean;
  isTestRunnerOpen: boolean;
  isNotificationsOpen: boolean;
  isDemoGuideOpen: boolean;
}

const initialState: UIState = {
  currentTab: 'articles',
  isNewPostOpen: false,
  isAuthOpen: false,
  isApiDocsOpen: false,
  isTestRunnerOpen: false,
  isNotificationsOpen: false,
  isDemoGuideOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentTab: (state, action: PayloadAction<'articles' | 'admin' | 'my-posts'>) => {
      state.currentTab = action.payload;
    },
    setNewPostOpen: (state, action: PayloadAction<boolean>) => {
      state.isNewPostOpen = action.payload;
    },
    setAuthOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthOpen = action.payload;
    },
    setApiDocsOpen: (state, action: PayloadAction<boolean>) => {
      state.isApiDocsOpen = action.payload;
    },
    setTestRunnerOpen: (state, action: PayloadAction<boolean>) => {
      state.isTestRunnerOpen = action.payload;
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationsOpen = action.payload;
    },
    setDemoGuideOpen: (state, action: PayloadAction<boolean>) => {
      state.isDemoGuideOpen = action.payload;
    },
  },
});

export const {
  setCurrentTab,
  setNewPostOpen,
  setAuthOpen,
  setApiDocsOpen,
  setTestRunnerOpen,
  setNotificationsOpen,
  setDemoGuideOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
