"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import apiService from "../../../src/services/axiosService";
import config from "../../../src/services/config";
import ChatPanel from './components/ChatPanel';
import Sidebar from './components/Sidebar';
import BotNavbar from './components/BotNavbar';
import { useRouter } from 'next/navigation';

export default function ChatBot() {
  const router = useRouter();
  useEffect(() => {
    // Hide default scrollbar for this page
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello, Store Manager! I'm your AI Assistant. I can help you monitor inventory, track supplier delays, search standard operating procedures (SOPs), check live freezer temperatures, and place auto-reorders in real time. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const messagesEndRef = useRef(null);

  // --- PERSISTENT HISTORY STATE ---
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [storeName, setStoreName] = useState('');

  const fetchStoreName = async (storeId) => {
    try {
      const response = await apiService({
        method: "get",
        url: `/r2r/stores/${storeId}/name`,
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      setStoreName(response.data.name);
    } catch (error) {
      console.error("Error fetching store name:", error);
      setStoreName(storeId);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthorized(true);

    // Extract user profile from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { 
        const u = JSON.parse(storedUser);
        setCurrentUser(u); 
        if (u.role === 'store manager' && u.storeId) {
          fetchStoreName(u.storeId);
        }
      } catch(e) {}
    }

    // Initial fetch of chats
    fetchChats();

    // Force sync requirement on every refresh
    localStorage.setItem('db_sync', 'false');
    setIsSynced(false);

    // Clear chat memory on refresh as requested
    localStorage.removeItem('finance_ai_summaries');
    localStorage.removeItem('finance_ai_active');
    setChatSummaries([]);
    setActiveMessages([]);

    // Automatically trigger sync on load
    handleSync();
  }, []);

  // --- PERSISTENT HISTORY HANDLERS ---
  const fetchChats = async (selectLatest = false) => {
    try {
      const response = await apiService({
        method: "get",
        url: "/r2r/chats",
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      const chatList = response.data.chats || [];
      setChats(chatList);
      
      if (chatList.length > 0) {
        // If no chat is active, or selectLatest is requested, open the most recent chat
        if (!activeChatId || selectLatest) {
          handleOpenChat(chatList[0].id);
        }
      } else {
        // If there are no chats at all, automatically initialize a new chat session
        handleNewChat();
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await apiService({
        method: "post",
        url: "/r2r/chats/new",
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      const newId = response.data.chat_id;
      setActiveChatId(newId);

      // Clear data panel state for new chat
      setCurrentTable(null);
      setCurrentChart(null);
      setCurrentReport(null);
      setCurrentDashboard(null);

      // Clear memory context for the new chat session
      setChatSummaries([]);
      setActiveMessages([]);
      localStorage.removeItem('finance_ai_summaries');
      localStorage.removeItem('finance_ai_active');

      setMessages([{ 
        role: 'assistant', 
        content: "Hello, Store Manager! I'm your AI Assistant. I can help you monitor inventory, track supplier delays, search standard operating procedures (SOPs), check live freezer temperatures, and place auto-reorders in real time. How can I assist you today?" 
      }]);

      // Refresh chat list (without selecting latest again to prevent loops)
      const listResponse = await apiService({
        method: "get",
        url: "/r2r/chats",
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      setChats(listResponse.data.chats || []);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleOpenChat = async (id) => {
    try {
      setActiveChatId(id);
      const response = await apiService({
        method: "get",
        url: `/r2r/chats/${id}`,
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      const history = response.data.messages || [];

      // Reset data views before loading history
      setCurrentTable(null);
      setCurrentChart(null);
      setCurrentReport(null);
      setCurrentDashboard(null);

      if (history.length > 0) {
        setMessages(history.map(m => ({
          role: m.role,
          content: m.content,
          tableData: m.tableData,
          chartData: m.chartData,
          reportData: m.reportData,
          dashboardData: m.dashboardData,
          tools_used: m.tools_used,
          metadata: m.metadata
        })));

        // Load active memory context from loaded history
        const activeMsgs = history.map(m => {
          const prefix = m.role === 'user' ? 'User' : 'Ai';
          return `${prefix}: ${m.content}`;
        });
        setActiveMessages(activeMsgs);
        setChatSummaries([]);
        localStorage.setItem('finance_ai_active', JSON.stringify(activeMsgs));
        localStorage.removeItem('finance_ai_summaries');

        // Load the last state if available
        const lastAiMessage = [...history].reverse().find(m => m.role === 'assistant' && (m.tableData || m.chartData || m.reportData || m.dashboardData));
        if (lastAiMessage) {
          if (lastAiMessage.tableData) { setCurrentTable(lastAiMessage.tableData); setActiveView('table'); }
          if (lastAiMessage.chartData) { setCurrentChart(lastAiMessage.chartData); setActiveView('chart'); }
          if (lastAiMessage.reportData) { setCurrentReport(lastAiMessage.reportData); setActiveView('report'); }
          if (lastAiMessage.dashboardData) { setCurrentDashboard(lastAiMessage.dashboardData); setActiveView('dashboard'); }
        }
      } else {
        setMessages([{ role: 'assistant', content: "Welcome back! How can I help you in this chat?" }]);
        setChatSummaries([]);
        setActiveMessages([]);
        localStorage.removeItem('finance_ai_summaries');
        localStorage.removeItem('finance_ai_active');
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleRenameChat = async (id, newTitle) => {
    try {
      await apiService({
        method: "put",
        url: `/r2r/chats/${id}/title`,
        customBaseUrl: config.FINANCE_AI_Base_url,
        data: { title: newTitle }
      });
      fetchChats();
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await apiService({
        method: "delete",
        url: `/r2r/chats/${id}`,
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      if (activeChatId === id) {
        setActiveChatId(null);
        setMessages([{ role: 'assistant', content: "Chat deleted. Start a new one!" }]);
      }
      fetchChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await apiService({
        method: "post",
        url: "/r2r/sync",
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      // Removed alert for automatic flow
      setIsSynced(true);
      localStorage.setItem('db_sync', 'true');
    } catch (error) {
      console.error("Sync Error:", error);
      // Keep alert for errors so user knows why it failed
      alert("Failed to sync database: " + (error.response?.data?.detail || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const [activeView, setActiveView] = useState('table'); // 'table' | 'chart' | 'report' | 'dashboard'
  const [currentTable, setCurrentTable] = useState(null);
  const [currentChart, setCurrentChart] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState(null);

  // --- MEMORY STATE ---
  const [chatSummaries, setChatSummaries] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);

  useEffect(() => {
    const savedSummaries = localStorage.getItem('finance_ai_summaries');
    const savedActive = localStorage.getItem('finance_ai_active');
    if (savedSummaries) setChatSummaries(JSON.parse(savedSummaries));
    if (savedActive) setActiveMessages(JSON.parse(savedActive));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    const userMessage = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let currentActive = [...activeMessages, `User: ${userText}`];

    const chat_context = [];
    if (chatSummaries.length > 0) {
      chat_context.push("--- PAST CONVERSATION SUMMARIES ---");
      chatSummaries.forEach((s, idx) => chat_context.push(`Summary ${idx + 1}: ${s}`));
    }
    if (activeMessages.length > 0) {
      chat_context.push("--- RECENT MESSAGES ---");
      chat_context.push(...activeMessages);
    }

    try {
      setProgressMessage("Initializing request...");
      
      const baseUrl = config.FINANCE_AI_Base_url.endsWith('/') 
        ? config.FINANCE_AI_Base_url.slice(0, -1) 
        : config.FINANCE_AI_Base_url;
      const response = await fetch(`${baseUrl}/r2r/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          question: userText,
          chat_context: chat_context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialChunk = "";
      let aiResponseText = "";
      
      // Add a placeholder message for the incoming assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        isStreaming: true
      }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        partialChunk += chunkText;

        // Process line-by-line SSE data
        const lines = partialChunk.split("\n");
        partialChunk = lines.pop(); // Keep incomplete last line

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned.startsWith("data: ")) continue;
          
          try {
            const data = JSON.parse(cleaned.slice(6));
            
            if (data.type === "step") {
              setProgressMessage(data.message);
            } else if (data.type === "token") {
              aiResponseText += data.text;
              // Update the streaming assistant message content
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  last.content = aiResponseText;
                }
                return updated;
              });
            } else if (data.type === "result") {
              // Retrieve final payload metadata
              const chartConfig = data.chartData || null;
              
              // Remove streaming flag and update final fields
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  last.content = aiResponseText;
                  last.tableData = data.tableData;
                  last.chartData = chartConfig;
                  last.reportData = data.reportData;
                  last.tools_used = data.tools_used;
                  last.metadata = {
                    model: data.model_name || "mistral-medium-2505",
                    token_usage: data.token_usage || null,
                    chartConfig: chartConfig
                  };
                  delete last.isStreaming;
                }
                return updated;
              });

              // Update data panels
              if (data.tableData) {
                setCurrentTable(data.tableData);
                setActiveView(chartConfig ? 'chart' : 'table');
              }
              if (chartConfig) {
                setCurrentChart(chartConfig);
                setActiveView('chart');
              }
              if (data.reportData) {
                setCurrentReport(data.reportData);
                setActiveView('report');
              }

              // Save messages to history
              if (activeChatId) {
                try {
                  // User Message
                  await apiService({
                    method: "post",
                    url: "/r2r/chats/message",
                    customBaseUrl: config.FINANCE_AI_Base_url,
                    data: { chat_id: activeChatId, role: 'user', content: userText }
                  });
                  // AI Message
                  await apiService({
                    method: "post",
                    url: "/r2r/chats/message",
                    customBaseUrl: config.FINANCE_AI_Base_url,
                    data: {
                      chat_id: activeChatId,
                      role: 'assistant',
                      content: aiResponseText,
                      tableData: data.tableData,
                      chartData: chartConfig,
                      reportData: data.reportData,
                      tools_used: data.tools_used,
                      metadata: {
                        model: data.model_name || "mistral-medium-2505",
                        token_usage: data.token_usage || null,
                        chartConfig: chartConfig
                      }
                    }
                  });

                  // Auto-rename New Chat sessions
                  const activeChat = chats.find(c => c.id === activeChatId);
                  if (activeChat && activeChat.title === "New Chat") {
                    const newTitle = userText.length > 25 ? userText.substring(0, 25) + "..." : userText;
                    await handleRenameChat(activeChatId, newTitle);
                  }
                } catch (saveErr) {
                  console.error("Error saving streaming response to history:", saveErr);
                }
              }

              currentActive.push(`Ai: ${aiResponseText}`);
              if (currentActive.length >= 20) {
                try {
                  const sumRes = await apiService({
                    method: "post",
                    url: "/r2r/summarize",
                    customBaseUrl: config.FINANCE_AI_Base_url,
                    data: { messages: currentActive }
                  });
                  const newSummary = sumRes.data.summary;
                  const newSummariesList = [...chatSummaries, newSummary].slice(-2);
                  setChatSummaries(newSummariesList);
                  setActiveMessages([]);
                  localStorage.setItem('finance_ai_summaries', JSON.stringify(newSummariesList));
                  localStorage.setItem('finance_ai_active', JSON.stringify([]));
                } catch (sumErr) {
                  console.error("Summarization error:", sumErr);
                  setActiveMessages(currentActive);
                  localStorage.setItem('finance_ai_active', JSON.stringify(currentActive));
                }
              } else {
                setActiveMessages(currentActive);
                localStorage.setItem('finance_ai_active', JSON.stringify(currentActive));
              }
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            console.warn("JSON parse error on SSE line:", e, cleaned);
          }
        }
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
      const errorMsg = error.message || "Unknown error occurred.";
      // Replace last placeholder with error or append
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant' && last.content === '') {
          last.content = `I'm sorry, I encountered an error connecting to the brain: ${errorMsg}`;
          delete last.isStreaming;
        } else {
          updated.push({
            role: 'assistant',
            content: `I'm sorry, I encountered an error connecting to the brain: ${errorMsg}`
          });
        }
        return updated;
      });
    } finally {
      setLoading(false);
      setProgressMessage('');
    }
  };

  const handleShowData = (msg) => {
    if (msg.tableData) { setCurrentTable(msg.tableData); setActiveView('table'); }
    if (msg.chartData) { setCurrentChart(msg.chartData); setActiveView('chart'); }
    if (msg.reportData) { setCurrentReport(msg.reportData); setActiveView('report'); }
    if (msg.dashboardData) { setCurrentDashboard(msg.dashboardData); setActiveView('dashboard'); }
  };

  if (!authorized) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      bgcolor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <CssBaseline />

      {/* BotNavbar is handled globally in layout.js, but if we need a specific one here: */}
      <BotNavbar currentUser={currentUser} storeName={storeName} />

      {/* Main Container: Split View */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        height: '100%',
        minHeight: 0
      }}>

        {/* This Sidebar component is for Chat History, distinct from the main App Sidebar */}
        <Sidebar
          documents={chats}
          activeDoc={activeChatId}
          onNewDocument={handleNewChat}
          onOpenDocument={handleOpenChat}
          onRenameDocument={handleRenameChat}
          onDeleteDocument={handleDeleteChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          overflow: 'hidden',
          p: { xs: 1, md: 2, lg: 3 },
          gap: { xs: 2, lg: 2 },
          height: '100%',
          minHeight: 0,
          position: 'relative'
        }}>
          {/* Left Panel: Chat Section */}
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            loading={loading}
            messagesEndRef={messagesEndRef}
            handleSync={handleSync}
            syncing={syncing}
            isSynced={isSynced}
            onShowData={handleShowData}
            currentUser={currentUser}
            progressMessage={progressMessage}
            storeName={storeName}
          />
        </Box>
      </Box>
    </Box>
  );
}

