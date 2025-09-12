import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  image?: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  input: string;
  selectedImages: File[];
  imagePreviews: string[];

  // Actions
  addMessage: (message: Message) => void;
  updateMessageStatus: (id: string, status: Message['status']) => void;
  setIsTyping: (typing: boolean) => void;
  setInput: (input: string) => void;
  addImage: (file: File, preview: string) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      messages: [],
      isTyping: false,
      input: "",
      selectedImages: [],
      imagePreviews: [],

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessageStatus: (id, status) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, status } : msg
          ),
        })),

      setIsTyping: (typing) => set({ isTyping: typing }),

      setInput: (input) => set({ input }),

      addImage: (file, preview) =>
        set((state) => ({
          selectedImages: [...state.selectedImages, file],
          imagePreviews: [...state.imagePreviews, preview],
        })),

      removeImage: (index) =>
        set((state) => ({
          selectedImages: state.selectedImages.filter((_, i) => i !== index),
          imagePreviews: state.imagePreviews.filter((_, i) => i !== index),
        })),

      clearImages: () =>
        set({
          selectedImages: [],
          imagePreviews: [],
        }),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-store',
    }
  )
);
