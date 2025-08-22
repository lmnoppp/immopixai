import { create } from 'zustand';

export interface AnalysisResult {
  issues: string[];
  summary: string;
}

export interface ProcessingOptions {
  removeObjects: boolean;
  improveLighting: boolean;
  neutralizeDecor: boolean;
  preserveElements: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'image';
  content: string;
  timestamp: Date;
  imageType?: 'original' | 'processed';
}

export interface ConversationState {
  uploadedImage: string | null;
  isUploading: boolean;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  isProcessing: boolean;
  processingOptions: ProcessingOptions;
  processedImage: string | null;
  currentStep: 'upload' | 'analysis' | 'options' | 'custom' | 'processing' | 'result';
  messages: Message[];
}

interface ConversationActions {
  setUploadedImage: (image: string | null) => void;
  setUploading: (uploading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setProcessing: (processing: boolean) => void;
  setProcessingOptions: (options: ProcessingOptions) => void;
  setProcessedImage: (image: string | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentStep: (step: ConversationState['currentStep']) => void;
  reset: () => void;
}

export const useConversationStore = create<ConversationState & ConversationActions>((set, get) => ({
  uploadedImage: null,
  isUploading: false,
  isAnalyzing: false,
  analysisResult: null,
  isProcessing: false,
  processingOptions: {
    removeObjects: true,
    improveLighting: true,
    neutralizeDecor: true,
    preserveElements: ''
  },
  processedImage: null,
  currentStep: 'upload',
  messages: [],

  setUploadedImage: (image) => set({ uploadedImage: image }),
  setUploading: (uploading) => set({ isUploading: uploading }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setProcessingOptions: (options) => set({ processingOptions: options }),
  setProcessedImage: (image) => set({ processedImage: image }),
  
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    set((state) => ({
      messages: [...state.messages, newMessage]
    }));
  },
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  reset: () => set({
    uploadedImage: null,
    isUploading: false,
    isAnalyzing: false,
    analysisResult: null,
    isProcessing: false,
    processingOptions: {
      removeObjects: true,
      improveLighting: true,
      neutralizeDecor: true,
      preserveElements: ''
    },
    processedImage: null,
    currentStep: 'upload',
    messages: []
  })
})); 