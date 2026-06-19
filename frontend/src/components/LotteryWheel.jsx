import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LotteryWheel = ({ prizes = [], onSpin, isSpinning, winningIndex = -1 }) => {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 确保至少有奖品
  const displayPrizes = prizes.length > 0 ? prizes : [
    { id: 1, name: '加载中...', probability: 100 }
  ];

  const totalPrizes = displayPrizes.length;
  const degreesPerPrize = 360 / totalPrizes;

  // 生成扇形的颜色
  const colors = [
    'from-red-400 to-red-500',
    'from-yellow-400 to-yellow-500',
    'from-green-400 to-green-500',
    'from-blue-400 to-blue-500',
    'from-purple-400 to-purple-500',
    'from-pink-400 to-pink-500',
    'from-orange-400 to-orange-500',
    'from-cyan-400 to-cyan-500',
  ];

  // 监听中奖结果，触发动画
  useEffect(() => {
    if (isSpinning && winningIndex >= 0) {
      setIsAnimating(true);
      // 计算目标角度：至少转5圈 + 目标位置
      const baseRotation = 360 * 8; // 8圈，更多圈数更刺激
      const targetAngle = degreesPerPrize * winningIndex + degreesPerPrize / 2;
      const finalRotation = rotation + baseRotation + (360 - targetAngle);
      
      setRotation(finalRotation);
      
      // 动画结束后重置状态
      setTimeout(() => {
        setIsAnimating(false);
      }, 5000);
    }
  }, [isSpinning, winningIndex]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* 指针 - 增加发光效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
        <div className={cn(
          "w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500",
          "drop-shadow-lg filter",
          isAnimating && "animate-pulse"
        )} 
        style={{
          filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))'
        }}
        />
      </div>

      {/* 发光外环效果 */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-75">
          <div className="w-full h-full rounded-full border-8 border-yellow-400" />
        </div>
      )}

      {/* 转盘容器 */}
      <div className="relative aspect-square">
        {/* 转盘 */}
        <div
          className={cn(
            'w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8',
            isAnimating ? 'border-yellow-400 shadow-yellow-400/50' : 'border-yellow-300',
            isAnimating && 'transition-transform duration-[5000ms] ease-[cubic-bezier(0.17,0.67,0.12,0.99)]'
          )}
          style={{
            transform: `rotate(${rotation}deg)`,
            boxShadow: isAnimating 
              ? '0 0 40px rgba(251, 191, 36, 0.6), 0 20px 40px rgba(0, 0, 0, 0.3)' 
              : '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* 使用SVG绘制扇形 */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {displayPrizes.map((prize, index) => {
              const startAngle = (index * degreesPerPrize - 90) * (Math.PI / 180);
              const endAngle = ((index + 1) * degreesPerPrize - 90) * (Math.PI / 180);
              
              const x1 = 100 + 100 * Math.cos(startAngle);
              const y1 = 100 + 100 * Math.sin(startAngle);
              const x2 = 100 + 100 * Math.cos(endAngle);
              const y2 = 100 + 100 * Math.sin(endAngle);
              
              const largeArcFlag = degreesPerPrize > 180 ? 1 : 0;
              
              const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // 文字位置和角度
              const textAngle = index * degreesPerPrize + degreesPerPrize / 2;
              const textRadius = 65;
              const textX = 100 + textRadius * Math.cos((textAngle - 90) * (Math.PI / 180));
              const textY = 100 + textRadius * Math.sin((textAngle - 90) * (Math.PI / 180));
              
              // 图片位置（更靠近中心）
              const imageRadius = 50;
              const imageX = 100 + imageRadius * Math.cos((textAngle - 90) * (Math.PI / 180));
              const imageY = 100 + imageRadius * Math.sin((textAngle - 90) * (Math.PI / 180));
              
              return (
                <g key={prize.id || index}>
                  <path
                    d={pathData}
                    fill={`hsl(${index * (360 / totalPrizes)}, 75%, 65%)`}
                    stroke="white"
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                  
                  {/* 奖品图片（如果有） */}
                  {prize.image && (
                    <image
                      href={prize.image}
                      x={imageX - 12}
                      y={imageY - 12}
                      width="24"
                      height="24"
                      transform={`rotate(${textAngle}, ${imageX}, ${imageY})`}
                      className="select-none"
                      style={{
                        clipPath: 'circle(40%)',
                      }}
                    />
                  )}
                  
                  {/* 奖品名称 */}
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    className="select-none"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'
                    }}
                  >
                    {prize.name.length > 10 ? prize.name.substring(0, 9) + '...' : prize.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 中心按钮 - 增加3D效果 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className={cn(
            "w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500",
            "shadow-2xl flex items-center justify-center border-4 border-white",
            "transform hover:scale-110 transition-transform duration-200",
            isAnimating && "animate-bounce"
          )}
          style={{
            boxShadow: '0 10px 30px rgba(251, 191, 36, 0.5), inset 0 -3px 10px rgba(0, 0, 0, 0.2)'
          }}
          >
            <span className="text-white font-bold text-lg drop-shadow-md">抽奖</span>
          </div>
        </div>
      </div>

      {/* 底座装饰 */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-full shadow-lg" />
    </div>
  );
};

export default LotteryWheel;
