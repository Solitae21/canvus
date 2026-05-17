import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '@canvus/shared';
import type { RootState } from '@/redux/store';

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = { messages: [] };

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
  },
});

export const { setMessages } = chatSlice.actions;
export const selectChatMessages = (s: RootState) => s.chat.messages;
export default chatSlice.reducer;
