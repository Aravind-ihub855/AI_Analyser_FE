"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import apiService from "../../../src/services/axiosService";
import config from "../../../src/services/config";
import ChatPanel from './components/ChatPanel';
import DisplayPanel from './components/DisplayPanel';
import Sidebar from './components/Sidebar';
import BotNavbar from './components/BotNavbar';

export default function ChatBot() {
  useEffect(() => {
    // Hide default scrollbar for this page
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Finance Assistant. I can help you analyze your data, detect anomalies, and create visualizations. How can I assist you today?" }
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

  useEffect(() => {
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
  const fetchChats = async () => {
    try {
      const response = await apiService({
        method: "get",
        url: "/r2r/chats",
        customBaseUrl: config.FINANCE_AI_Base_url
      });
      setChats(response.data.chats || []);
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

      setMessages([{ role: 'assistant', content: "Hello! I'm a Finance AI. How can I assist you today?" }]);
      fetchChats();
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
          dashboardData: m.dashboardData
        })));

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
      const response = await apiService({
        method: "post",
        url: "/r2r/chat",
        customBaseUrl: config.FINANCE_AI_Base_url,
        data: {
          question: userText,
          chat_context: chat_context
        }
      });
      const data = response.data;

      const aiText = data.answer;

      // Update UI state immediately
      if (data.tableData) {
        setCurrentTable(data.tableData);
        setActiveView('table');
      }
      if (data.chartData) {
        setCurrentChart(data.chartData);
        setActiveView('chart');
      }
      if (data.reportData) {
        setCurrentReport(data.reportData);
        setActiveView('report');
      }
      if (data.dashboardData) {
        setCurrentDashboard(data.dashboardData);
        setActiveView('dashboard');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiText,
        tableData: data.tableData,
        chartData: data.chartData,
        reportData: data.reportData,
        dashboardData: data.dashboardData
      }]);

      // --- PERSISTENT SAVE ---
      if (activeChatId) {
        try {
          // Save User Message
          await apiService({
            method: "post",
            url: "/r2r/chats/message", // Add this to route
            customBaseUrl: config.FINANCE_AI_Base_url,
            data: { chat_id: activeChatId, role: 'user', content: userText }
          });
          // Save AI Message with Data
          await apiService({
            method: "post",
            url: "/r2r/chats/message",
            customBaseUrl: config.FINANCE_AI_Base_url,
            data: {
              chat_id: activeChatId,
              role: 'assistant',
              content: aiText,
              tableData: data.tableData,
              chartData: data.chartData,
              reportData: data.reportData,
              dashboardData: data.dashboardData
            }
          });
        } catch (saveErr) {
          console.error("Error saving to history:", saveErr);
        }
      }

      currentActive.push(`Ai: ${aiText}`);

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
          console.error("Summarization Error:", sumErr);
          setActiveMessages(currentActive);
          localStorage.setItem('finance_ai_active', JSON.stringify(currentActive));
        }
      } else {
        setActiveMessages(currentActive);
        localStorage.setItem('finance_ai_active', JSON.stringify(currentActive));
      }

    } catch (error) {
      console.error("Chat Error Detail:", error);
      const errorMsg = error.message || (typeof error === 'string' ? error : "Unknown error");
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm sorry, I encountered an error connecting to the brain: ${errorMsg}.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowData = (msg) => {
    if (msg.tableData) { setCurrentTable(msg.tableData); setActiveView('table'); }
    if (msg.chartData) { setCurrentChart(msg.chartData); setActiveView('chart'); }
    if (msg.reportData) { setCurrentReport(msg.reportData); setActiveView('report'); }
    if (msg.dashboardData) { setCurrentDashboard(msg.dashboardData); setActiveView('dashboard'); }
  };

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
      <BotNavbar />

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
          />

          {/* Right Panel: Data Display Section */}
          <DisplayPanel
            activeView={activeView}
            setActiveView={setActiveView}
            currentTable={currentTable}
            currentChart={currentChart}
            currentReport={currentReport}
            currentDashboard={currentDashboard}
          />
        </Box>
      </Box>
    </Box>
  );
}

