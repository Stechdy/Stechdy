import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import SidebarNav from "../../components/common/SidebarNav";
import BottomNav from "../../components/common/BottomNav";
import "./AIChat.css";

const AIChat = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Usage tracking for free users
  const [remainingMessages, setRemainingMessages] = useState(10);
  const [isPremium, setIsPremium] = useState(null); // null = loading, false = free, true = premium
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  useEffect(() => {
    // Check user premium status and usage
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            // Check premium status - can be isPremium boolean OR premiumStatus string
            const userIsPremium = userData.isPremium === true || userData.premiumStatus === 'premium' || userData.user?.isPremium === true || userData.user?.premiumStatus === 'premium';
            setIsPremium(userIsPremium);
          } else {
            setIsPremium(false); // Default to free if no data
          }
        } else {
          setIsPremium(false); // Default to free if no token
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setIsPremium(false); // Default to free if error occurs
      }

      // Load remaining messages from localStorage for free users
      const today = new Date().toDateString();
      const savedData = localStorage.getItem(`aiChatUsage_${today}`);
      if (savedData) {
        const { remaining } = JSON.parse(savedData);
        setRemainingMessages(remaining);
      }
    };
    
    checkUserStatus();
    
    // Initial greeting message
    const initialMessage = {
      id: Date.now(),
      text: "Good morning! What do you want to do?",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    // Check if free user has remaining messages
    if (isPremium === false && remainingMessages <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Update remaining messages for free users
    if (isPremium === false) {
      const newRemaining = remainingMessages - 1;
      setRemainingMessages(newRemaining);
      
      // Save to localStorage
      const today = new Date().toDateString();
      localStorage.setItem(`aiChatUsage_${today}`, JSON.stringify({
        remaining: newRemaining,
        date: today
      }));
    }

    try {
      const prompt = `You are S'Techdy AI, a helpful study assistant. The user asked: "${currentInput}". 
                  
If they want to create a study schedule, respond with: "Of course! Please press on create Schedule to continue!!!"

Otherwise, provide a helpful, friendly response related to studying, productivity, or scheduling.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      if (aiText) {
        const aiMessage = {
          id: Date.now() + 1,
          text: aiText,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    navigate("/ai-generator");
  };

  return (
    <div className="ai-chat-container">
      <SidebarNav />

      <div className="ai-chat-wrapper">
        {/* Header */}
        <header className="ai-chat-header">
          <h1 className="ai-page-title">S'Techdy AI</h1>
        </header>

        {/* Add New Schedule Button */}
        <div className="ai-quick-actions">
          <button className="ai-action-btn" onClick={handleCreateSchedule}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.9955 13.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t("aiChat.addNewSchedule") || "Add new schedule"}</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="ai-chat-content" ref={chatContainerRef}>
          <div className="ai-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-message ${message.sender === "user" ? "user-message" : "ai-message"}`}
              >
                {message.sender === "ai" && (
                  <div className="ai-avatar">
                    <img 
                      src={`${process.env.PUBLIC_URL}/LogoAIStechdy.png?v=${Date.now()}`}
                      alt="AI" 
                    />
                  </div>
                )}
                <div className="ai-message-content">
                  <p>{message.text}</p>
                  {message.text.toLowerCase().includes("create schedule") && 
                   message.text.toLowerCase().includes("press") && (
                    <button className="ai-create-schedule-btn" onClick={handleCreateSchedule}>
                      Create Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message ai-message">
                <div className="ai-avatar">
                  <img 
                    src={`${process.env.PUBLIC_URL}/LogoAIStechdy.png?v=${Date.now()}`}
                    alt="AI" 
                  />
                </div>
                <div className="ai-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="ai-input-container">
          {(isPremium === false || isPremium === null) && (
            <div className="ai-usage-counter-bottom">
              <span className="usage-text">{remainingMessages}/10 {t("aiChat.remainingQuestions")}</span>
              <button className="upgrade-btn" onClick={() => navigate('/pricing')}>
                ✨ {t("aiChat.premium")}
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="ai-input-form">
            <input
              type="text"
              className="ai-input"
              placeholder={!isPremium && remainingMessages <= 0 ? "Hết lượt sử dụng miễn phí" : (t("aiChat.inputPlaceholder") || "Ask me everything")}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading || (isPremium === false && remainingMessages <= 0)}
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={!inputMessage.trim() || isLoading || (!isPremium && remainingMessages <= 0)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7.39999 6.32003L15.89 3.49003C19.7 2.22003 21.77 4.30003 20.51 8.11003L17.68 16.6C15.78 22.31 12.66 22.31 10.76 16.6L9.91999 14.08L7.39999 13.24C1.68999 11.34 1.68999 8.23003 7.39999 6.32003Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.11 13.6501L13.69 10.0601"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="upgrade-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upgrade-modal-header">
              <h3>🚀 Hết lượt sử dụng miễn phí!</h3>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
            </div>
            <div className="upgrade-modal-content">
              <p>Bạn đã sử dụng hết 10 câu hỏi miễn phí hôm nay.</p>
              <div className="premium-features">
                <h4>✨ Ưu đãi Premium:</h4>
                <ul>
                  <li>✓ Không giới hạn câu hỏi AI</li>
                  <li>✓ Không giới hạn tạo lịch học</li>
                  <li>✓ Phân tích chi tiết hơn</li>
                  <li>✓ Ưu tiên hỗ trợ</li>
                </ul>
              </div>
              <div className="upgrade-modal-actions">
                <button className="upgrade-now-btn" onClick={() => navigate('/pricing')}>
                  Đăng ký Premium
                </button>
                <button className="maybe-later-btn" onClick={() => setShowUpgradeModal(false)}>
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default AIChat;
