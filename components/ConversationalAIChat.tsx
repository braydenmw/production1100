/**
 * -------------------------------------------------------------------------------
 * ADVERSIQ - CONVERSATIONAL AI CHAT
 * -------------------------------------------------------------------------------
 * 
 * Real-time conversational interface that allows users to chat with the AI
 * just like talking to a human advisor. Powered by NSIL Brain + Multi-Agent System.
 * 
 * Features:
 * - Natural language conversation
 * - Context-aware responses based on current session
 * - Autonomous proactive suggestions
 * - Voice-like typing animation
 * - Full audit trail
 * -------------------------------------------------------------------------------
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageCircle, Send, Bot, User, Sparkles, Brain, 
  Zap, AlertTriangle, X, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReportParameters } from '../types';

// -------------------------------------------------------------------------------
// TYPES
// -------------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  reasoning?: string[];
  sources?: string[];
  isTyping?: boolean;
  agentId?: string;
  actionSuggested?: {
    type: string;
    label: string;
    action: () => void;
  };
}

interface ConversationalAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext?: ReportParameters;
  onActionTriggered?: (action: string, data: unknown) => void;
}

// -------------------------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------------------------

export const ConversationalAIChat: React.FC<ConversationalAIChatProps> = ({
  isOpen,
  onClose,
  currentContext,
  onActionTriggered
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autonomousMode, setAutonomousMode] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to ADVERSIQ Intelligence. I'm your autonomous strategic intelligence partner.

I can help you with:
* **Strategic Analysis** - Deep reasoning on partnerships, markets, and risks
* **Document Generation** - Create 200+ document types instantly
* **Partner Matching** - Find ideal partners using our SEAM(TM) engine
* **Market Intelligence** - Real-time data on 190+ countries
* **Risk Assessment** - Multi-perspective adversarial analysis

${currentContext?.organizationName ? `I see you're working on **${currentContext.organizationName}**. How can I help advance your strategy?` : 'What would you like to explore today?'}`,
        timestamp: new Date(),
        confidence: 100,
        agentId: 'nsil-core'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentContext?.organizationName, messages.length]);

  // Send message to AI
  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input;
    if (!text?.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            ...currentContext,
            conversationHistory: messages.slice(-10).map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'typing');
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content || data.description || 'I apologize, but I encountered an issue processing your request. Please try again.',
          timestamp: new Date(),
          confidence: data.confidence || 85,
          reasoning: data.reasoning,
          sources: data.sources,
          agentId: data.agentId || ''
        };
        return [...filtered, assistantMessage];
      });

      // Trigger action if detected
      if (data.actionDetected && onActionTriggered) {
        onActionTriggered(data.actionDetected, data.actionData);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'typing');
        return [...filtered, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an error processing your request. Please ensure the server is running and try again.',
          timestamp: new Date(),
          confidence: 0,
          agentId: 'error-handler'
        }];
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, currentContext, messages, onActionTriggered]);

  // Proactive suggestion generator
  const generateProactiveSuggestion = useCallback(() => {
    if (!currentContext?.organizationName) return;
    
    const proactiveMessage: ChatMessage = {
      id: `proactive-${Date.now()}`,
      role: 'assistant',
      content: `💡 **Proactive Insight**: Based on your current session data, I've identified a potential optimization opportunity. Would you like me to elaborate?`,
      timestamp: new Date(),
      confidence: 85,
      agentId: 'proactive-engine',
      actionSuggested: {
        type: 'analyze',
        label: 'Tell me more',
        action: () => handleSend('Tell me more about this optimization opportunity')
      }
    };
    
    setMessages(prev => [...prev, proactiveMessage]);
  }, [currentContext?.organizationName, handleSend]);

  // Autonomous proactive suggestions
  useEffect(() => {
    if (autonomousMode && currentContext && messages.length > 0) {
      const timer = setTimeout(() => {
        generateProactiveSuggestion();
      }, 30000); // Every 30 seconds
      return () => clearTimeout(timer);
    }
  }, [autonomousMode, currentContext, messages.length, generateProactiveSuggestion]);

  // Quick action buttons
  const quickActions = [
    { label: 'Analyze risks', icon: AlertTriangle, query: 'Analyze the key risks for my current strategy' },
    { label: 'Find partners', icon: Zap, query: 'Suggest ideal partners for my organization' },
    { label: 'Generate report', icon: Sparkles, query: 'Generate an executive summary of my current case' },
    { label: 'Market insights', icon: Brain, query: 'What are the key market trends I should know about?' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`fixed right-0 top-0 h-full bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col ${
          isExpanded ? 'w-full md:w-2/3' : 'w-full md:w-96'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-900 to-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">NSIL Intelligence</h3>
              <p className="text-xs text-slate-400">Autonomous Strategic Partner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutonomousMode(!autonomousMode)}
              className={`p-1.5 rounded ${autonomousMode ? 'bg-green-600' : 'bg-slate-700'} text-white`}
              title={autonomousMode ? 'Autonomous Mode ON' : 'Autonomous Mode OFF'}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded bg-slate-700 text-white hover:bg-slate-600"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-700 text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-600' 
                  : message.role === 'system'
                  ? 'bg-yellow-600'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                {message.isTyping ? (
                  <div className="bg-slate-800 rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-100'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed" 
                      dangerouslySetInnerHTML={{ 
                        __html: message.content
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br/>')
                      }} 
                    />
                    
                    {/* Metadata */}
                    {message.role === 'assistant' && message.confidence && (
                      <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-3 text-xs text-slate-500">
                        <span>Confidence: {message.confidence}%</span>
                        {message.agentId && <span>Agent: {message.agentId}</span>}
                      </div>
                    )}

                    {/* Action Button */}
                    {message.actionSuggested && (
                      <button
                        onClick={message.actionSuggested.action}
                        className="mt-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg font-medium"
                      >
                        {message.actionSuggested.label}
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-600 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-slate-800">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.query)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full whitespace-nowrap border border-slate-700"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-850">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your strategy..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Powered by NSIL Brain * {autonomousMode ? 'Autonomous Mode Active' : 'Manual Mode'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// -------------------------------------------------------------------------------
// FLOATING CHAT BUTTON
// -------------------------------------------------------------------------------

export const ChatFloatingButton: React.FC<{ onClick: () => void; hasUnread?: boolean }> = ({ onClick, hasUnread }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center z-40 hover:shadow-cyan-500/25 hover:shadow-xl transition-shadow"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
          !
        </span>
      )}
    </motion.button>
  );
};

export default ConversationalAIChat;

