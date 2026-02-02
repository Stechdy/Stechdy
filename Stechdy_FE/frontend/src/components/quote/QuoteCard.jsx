import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import IdeaMascot from "../../assets/idea.png";
import "./QuoteCard.css";

const QuoteCard = ({ onClick, currentQuote: propCurrentQuote, onQuoteChange }) => {
  const { t, i18n } = useTranslation();
  const [currentQuote, setCurrentQuote] = useState(propCurrentQuote || null);

  // Motivational quotes collection (Vietnamese and English)
  const quotes = {
    vi: [
      {
        text: "Thành công là tổng hợp của những nỗ lực nhỏ bé được lặp đi lặp lại mỗi ngày.",
        author: "Robert Collier"
      },
      {
        text: "Học tập không phải là trò chơi ngẫu nhiên, mà là sự theo đuổi không ngừng nghỉ.",
        author: "Abigail Adams"
      },
      {
        text: "Giáo dục là vũ khí mạnh mẽ nhất bạn có thể sử dụng để thay đổi thế giới.",
        author: "Nelson Mandela"
      },
      {
        text: "Đầu tư vào kiến thức luôn mang lại lợi ích tốt nhất.",
        author: "Benjamin Franklin"
      },
      {
        text: "Hãy bắt đầu từ nơi bạn đang đứng. Sử dụng những gì bạn có. Làm những gì bạn có thể.",
        author: "Arthur Ashe"
      },
      {
        text: "Tương lai thuộc về những người tin vào vẻ đẹp của ước mơ.",
        author: "Eleanor Roosevelt"
      },
      {
        text: "Mục đích của việc học không phải để biết nhiều mà là để hành động tốt hơn.",
        author: "Herbert Spencer"
      },
      {
        text: "Thất bại là cơ hội để bắt đầu lại một cách thông minh hơn.",
        author: "Henry Ford"
      },
      {
        text: "Hãy nghiên cứu chăm chỉ những gì bạn quan tâm, theo cách có ý nghĩa nhất với bạn.",
        author: "Barbara McClintock"
      },
      {
        text: "Bất cứ điều gì đáng làm thì đáng làm cho tốt.",
        author: "Philip Stanhope"
      }
    ],
    en: [
      {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier"
      },
      {
        text: "Learning is not a spectator sport, it's a pursuit of passion.",
        author: "Abigail Adams"
      },
      {
        text: "Education is the most powerful weapon you can use to change the world.",
        author: "Nelson Mandela"
      },
      {
        text: "An investment in knowledge pays the best interest.",
        author: "Benjamin Franklin"
      },
      {
        text: "Start where you are. Use what you have. Do what you can.",
        author: "Arthur Ashe"
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
      },
      {
        text: "The purpose of learning is not to know more but to behave better.",
        author: "Herbert Spencer"
      },
      {
        text: "Failure is simply the opportunity to begin again, this time more intelligently.",
        author: "Henry Ford"
      },
      {
        text: "Study hard what interests you the most in the most undisciplined way.",
        author: "Barbara McClintock"
      },
      {
        text: "Whatever is worth doing at all, is worth doing well.",
        author: "Philip Stanhope"
      }
    ]
  };

  // Get daily quote based on date (consistent quote for the day)
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

  useEffect(() => {
    if (propCurrentQuote) {
      setCurrentQuote(propCurrentQuote);
    } else {
      const quote = getDailyQuote();
      setCurrentQuote(quote);
      if (onQuoteChange) {
        onQuoteChange(quote);
      }
    }
  }, [propCurrentQuote, i18n.language]);

  // Update parent when quote changes
  useEffect(() => {
    if (currentQuote && onQuoteChange && !propCurrentQuote) {
      onQuoteChange(currentQuote);
    }
  }, [currentQuote, onQuoteChange, propCurrentQuote]);

  if (!currentQuote) return null;

  return (
    <div className="quote-card" onClick={onClick}>
      <div className="mascot-container">
        <div className="mascot-avatar">
          <img 
            src={IdeaMascot}
            alt="Idea Mascot" 
            className="mascot-image"
          />
        </div>
        <div className="speech-bubble">
          <div className="quote-content">
            <p className="quote-text">"{currentQuote.text}"</p>
            <p className="quote-author">— {currentQuote.author}</p>
          </div>
          <div className="speech-tail"></div>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
