import React, { useState } from "react";
import CelebrationModal from "../../components/common/CelebrationModal";
import "./CelebrationTest.css";

const CelebrationTest = () => {
  const [celebration, setCelebration] = useState({
    show: false,
    emoji: "",
    title: "",
    message: "",
  });

  const testCelebrations = [
    {
      emoji: "🐰",
      title: "Cute Bunny!",
      message: "Bạn đã duy trì 3 ngày streak!",
    },
    {
      emoji: "🦊",
      title: "Clever Fox!",
      message: "Một tuần kiên trì - Thật tuyệt vời!",
    },
    {
      emoji: "🐼",
      title: "Peaceful Panda!",
      message: "2 tuần liên tiếp - Bạn thật phi thường!",
    },
    {
      emoji: "🏆",
      title: "Huy hiệu mới!",
      message: 'Bạn đã nhận được huy hiệu "Self-aware Learner"! 🌟',
    },
    {
      emoji: "🔥",
      title: "7 ngày streak!",
      message: "Bạn đang làm rất tốt! Tiếp tục duy trì nhé! 💪",
    },
    {
      emoji: "🐧",
      title: "Happy Penguin!",
      message: "1 tháng hoàn hảo - Bạn là siêu sao!",
    },
  ];

  const showCelebration = (index) => {
    const celeb = testCelebrations[index];
    setCelebration({
      show: true,
      ...celeb,
    });
  };

  return (
    <div className="celebration-test-container">
      <h1>Test Celebration Modal</h1>
      <p>Click các nút dưới đây để xem các hiệu ứng chúc mừng khác nhau:</p>

      <div className="test-buttons">
        {testCelebrations.map((celeb, index) => (
          <button
            key={index}
            onClick={() => showCelebration(index)}
            className="test-button"
          >
            {celeb.emoji} {celeb.title}
          </button>
        ))}
      </div>

      <CelebrationModal
        show={celebration.show}
        emoji={celebration.emoji}
        title={celebration.title}
        message={celebration.message}
        onClose={() =>
          setCelebration({ show: false, emoji: "", title: "", message: "" })
        }
      />
    </div>
  );
};

export default CelebrationTest;
