import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./QuoteModal.css";

const QuoteModal = ({ isOpen, onClose, currentQuote: propCurrentQuote, onQuoteChange }) => {
  const { t, i18n } = useTranslation();
  const [currentQuote, setCurrentQuote] = useState(propCurrentQuote || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Complete quotes collection
  const quotes = {
    vi: [
      {
        text: "Thành công là tổng hợp của những nỗ lực nhỏ bé được lặp đi lặp lại mỗi ngày.",
        author: "Robert Collier",
        category: "success"
      },
      {
        text: "Học tập không phải là trò chơi ngẫu nhiên, mà là sự theo đuổi không ngừng nghỉ.",
        author: "Abigail Adams",
        category: "learning"
      },
      {
        text: "Giáo dục là vũ khí mạnh mẽ nhất bạn có thể sử dụng để thay đổi thế giới.",
        author: "Nelson Mandela",
        category: "education"
      },
      {
        text: "Đầu tư vào kiến thức luôn mang lại lợi ích tốt nhất.",
        author: "Benjamin Franklin",
        category: "knowledge"
      },
      {
        text: "Hãy bắt đầu từ nơi bạn đang đứng. Sử dụng những gì bạn có. Làm những gì bạn có thể.",
        author: "Arthur Ashe",
        category: "motivation"
      },
      {
        text: "Tương lai thuộc về những người tin vào vẻ đẹp của ước mơ.",
        author: "Eleanor Roosevelt",
        category: "dreams"
      },
      {
        text: "Mục đích của việc học không phải để biết nhiều mà là để hành động tốt hơn.",
        author: "Herbert Spencer",
        category: "learning"
      },
      {
        text: "Thất bại là cơ hội để bắt đầu lại một cách thông minh hơn.",
        author: "Henry Ford",
        category: "perseverance"
      },
      {
        text: "Hãy nghiên cứu chăm chỉ những gì bạn quan tâm, theo cách có ý nghĩa nhất với bạn.",
        author: "Barbara McClintock",
        category: "passion"
      },
      {
        text: "Bất cứ điều gì đáng làm thì đáng làm cho tốt.",
        author: "Philip Stanhope",
        category: "excellence"
      },
      {
        text: "Sự khác biệt giữa thành công và thất bại chính là kiên trì.",
        author: "Unknown",
        category: "perseverance"
      },
      {
        text: "Đừng để ngày hôm qua chiếm quá nhiều ngày hôm nay.",
        author: "Will Rogers",
        category: "motivation"
      },
      {
        text: "Cách duy nhất để làm việc tuyệt vời là yêu những gì bạn làm.",
        author: "Steve Jobs",
        category: "passion"
      },
      {
        text: "Hành trình ngàn dặm bắt đầu bằng một bước chân.",
        author: "Lão Tử",
        category: "beginning"
      },
      {
        text: "Bạn không cần phải giỏi để bắt đầu, nhưng bạn phải bắt đầu để trở nên giỏi.",
        author: "Zig Ziglar",
        category: "motivation"
      }
    ],
    en: [
      {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier",
        category: "success"
      },
      {
        text: "Learning is not a spectator sport, it's a pursuit of passion.",
        author: "Abigail Adams",
        category: "learning"
      },
      {
        text: "Education is the most powerful weapon you can use to change the world.",
        author: "Nelson Mandela",
        category: "education"
      },
      {
        text: "An investment in knowledge pays the best interest.",
        author: "Benjamin Franklin",
        category: "knowledge"
      },
      {
        text: "Start where you are. Use what you have. Do what you can.",
        author: "Arthur Ashe",
        category: "motivation"
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "dreams"
      },
      {
        text: "The purpose of learning is not to know more but to behave better.",
        author: "Herbert Spencer",
        category: "learning"
      },
      {
        text: "Failure is simply the opportunity to begin again, this time more intelligently.",
        author: "Henry Ford",
        category: "perseverance"
      },
      {
        text: "Study hard what interests you the most in the most undisciplined way.",
        author: "Barbara McClintock",
        category: "passion"
      },
      {
        text: "Whatever is worth doing at all, is worth doing well.",
        author: "Philip Stanhope",
        category: "excellence"
      },
      {
        text: "The difference between try and triumph is just a little umph!",
        author: "Marvin Phillips",
        category: "perseverance"
      },
      {
        text: "Don't let yesterday take up too much of today.",
        author: "Will Rogers",
        category: "motivation"
      },
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "passion"
      },
      {
        text: "A journey of a thousand miles begins with a single step.",
        author: "Lao Tzu",
        category: "beginning"
      },
      {
        text: "You don't have to be great to start, but you have to start to be great.",
        author: "Zig Ziglar",
        category: "motivation"
      }
    ]
  };

  // Get daily quote based on date
  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    
    const language = i18n.language === "vi" ? "vi" : "en";
    const quoteList = quotes[language];
    const index = dayOfYear % quoteList.length;
    
    return quoteList[index];
  };

  // Get random quote
  const getRandomQuote = () => {
    const language = i18n.language === "vi" ? "vi" : "en";
    const quoteList = quotes[language];
    const randomIndex = Math.floor(Math.random() * quoteList.length);
    return quoteList[randomIndex];
  };

  useEffect(() => {
    if (isOpen) {
      if (propCurrentQuote) {
        setCurrentQuote(propCurrentQuote);
      } else {
        setCurrentQuote(getDailyQuote());
      }
    }
  }, [isOpen, propCurrentQuote, i18n.language]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newQuote = getRandomQuote();
      setCurrentQuote(newQuote);
      if (onQuoteChange) {
        onQuoteChange(newQuote);
      }
      setIsRefreshing(false);
    }, 300);
  };

  const handleShare = () => {
    if (navigator.share && currentQuote) {
      navigator.share({
        title: t("quote.shareTitle"),
        text: `"${currentQuote.text}" — ${currentQuote.author}`,
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
        alert(t("quote.copiedToClipboard"));
      });
    } else if (currentQuote) {
      navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
      alert(t("quote.copiedToClipboard"));
    }
  };

  if (!isOpen || !currentQuote) return null;

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quote-modal-header">
          <h2 className="quote-modal-title">
            <span className="quote-modal-icon">✨</span>
            {t("quote.dailyInspiration")}
          </h2>
          <button className="quote-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Quote Content */}
        <div className={`quote-modal-body ${isRefreshing ? "refreshing" : ""}`}>
          <div className="quote-decoration quote-decoration-left">"</div>
          <div className="quote-decoration quote-decoration-right">"</div>
          
          <div className="quote-main-content">
            <p className="quote-modal-text">{currentQuote.text}</p>
            <div className="quote-modal-author-section">
              <div className="quote-author-divider"></div>
              <p className="quote-modal-author">— {currentQuote.author}</p>
            </div>
          </div>

          {currentQuote.category && (
            <div className="quote-category">
              <span className="quote-category-tag">
                #{t(`quote.categories.${currentQuote.category}`)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="quote-modal-actions">
          <button className="quote-action-btn quote-refresh-btn" onClick={handleRefresh}>
            <span className={`refresh-icon ${isRefreshing ? "spinning" : ""}`}>🔄</span>
            {t("quote.newQuote")}
          </button>
          <button className="quote-action-btn quote-share-btn" onClick={handleShare}>
            <span>📤</span>
            {t("quote.share")}
          </button>
        </div>

        {/* Footer */}
        <div className="quote-modal-footer">
          <p className="quote-footer-text">
            {t("quote.dailyMessage")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
