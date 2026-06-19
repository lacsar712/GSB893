import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, History as HistoryIcon, Settings, Sparkles, Zap } from 'lucide-react';
import LotteryWheel from '../components/LotteryWheel';
import PaymentModal from '../components/PaymentModal';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { prizeAPI, userAPI, paymentAPI, lotteryAPI } from '../services/api';
import { toast } from '@/lib/utils';

const Lottery = () => {
  const [prizes, setPrizes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winningIndex, setWinningIndex] = useState(-1);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const response = await prizeAPI.getActivePrizes();
      if (response.success) {
        setPrizes(response.data);
      }
    } catch (error) {
      toast.error('加载奖品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLottery = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (idNumber) => {
    try {
      // 1. 注册/获取用户
      const userResponse = await userAPI.register(idNumber);
      if (!userResponse.success) {
        toast.error(userResponse.message);
        return;
      }

      const userId = userResponse.data.user_id;
      setCurrentUser({ id: userId, idNumber });

      // 2. 创建支付记录（模拟支付）
      const paymentResponse = await paymentAPI.createPayment(userId);
      if (!paymentResponse.success) {
        toast.error('支付失败');
        return;
      }

      // 3. 执行抽奖
      await performLottery(userId);

    } catch (error) {
      toast.error(error.message || '操作失败');
    }
  };

  const performLottery = async (userId) => {
    try {
      setIsSpinning(true);

      // 调用抽奖API
      const response = await lotteryAPI.draw(userId);
      
      if (!response.success) {
        toast.error(response.message);
        setIsSpinning(false);
        return;
      }

      // 找到中奖奖品在列表中的索引
      const noPrizeIdx = prizes.findIndex(p => p.name.includes('谢谢参与'));
      let winnerIdx = noPrizeIdx !== -1 ? noPrizeIdx : 0;
      
      if (response.data.is_winner && response.data.prize) {
        const index = prizes.findIndex(p => p.id === response.data.prize.id);
        if (index !== -1) {
          winnerIdx = index;
        }
      }

      // 设置中奖索引，触发转盘动画
      setWinningIndex(winnerIdx);

      // 等待转盘动画完成后显示结果
      setTimeout(() => {
        setIsSpinning(false);
        setWinningIndex(-1);
        setResult(response.data);
        setShowResultModal(true);
      }, 5500); // 等待转盘动画完成（5秒动画 + 0.5秒缓冲）

    } catch (error) {
      toast.error(error.message || '抽奖失败');
      setIsSpinning(false);
    }
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
          <p className="text-cyan-300 text-lg font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 动态背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" 
             style={{ top: '10%', left: '10%' }} />
        <div className="absolute w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" 
             style={{ top: '60%', right: '10%', animationDelay: '1s' }} />
        <div className="absolute w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" 
             style={{ bottom: '10%', left: '50%', animationDelay: '2s' }} />
      </div>

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* 导航栏 */}
      <div className="relative z-10 backdrop-blur-md bg-slate-900/50 border-b border-purple-500/30 shadow-lg shadow-purple-500/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Sparkles className="text-cyan-400 animate-pulse" size={32} />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                未来抽奖系统
              </span>
              <Zap className="text-pink-400 animate-pulse" size={32} />
            </h1>
            <div className="flex gap-2 md:gap-3">
              <Link to="/history">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-slate-800/50 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 backdrop-blur-sm transition-all duration-300"
                >
                  <HistoryIcon size={16} className="mr-2" />
                  <span className="hidden md:inline">抽奖记录</span>
                </Button>
              </Link>
              <Link to="/admin">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 backdrop-blur-sm transition-all duration-300"
                >
                  <Settings size={16} className="mr-2" />
                  <span className="hidden md:inline">后台管理</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* 转盘区域 */}
            <div className="flex flex-col items-center space-y-6">
              {/* 转盘容器 - 科技感边框 */}
              <div className="relative w-full">
                {/* 外发光效果 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse" />
                
                {/* 转盘卡片 */}
                <div className="relative rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[2px] rounded-3xl">
                    <div className="w-full h-full bg-slate-900/95 backdrop-blur-xl rounded-3xl" />
                  </div>
                  <Card className="relative bg-transparent border-0 shadow-2xl">
                    <CardContent className="p-8">
                      <LotteryWheel
                        prizes={prizes}
                        isSpinning={isSpinning}
                        winningIndex={winningIndex}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 开始按钮 - 未来科技感 */}
              <div className="relative w-full max-w-md group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
                <Button
                  onClick={handleStartLottery}
                  disabled={isSpinning}
                  className="relative w-full h-16 text-xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20"
                >
                  <span className="flex items-center justify-center gap-3">
                    {isSpinning ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>抽奖中...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={28} className="animate-pulse" />
                        <span>开始抽奖</span>
                        <span className="px-3 py-1 bg-yellow-400 text-slate-900 rounded-full text-base font-bold">¥1.00</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            {/* 奖品列表 - 科技面板 */}
            <div className="relative">
              {/* 外发光 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-2xl blur-lg" />
              
              <Card className="relative bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 rounded-2xl">
                <div className="px-6 py-4 border-b border-purple-500/30">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/50">
                      <Gift className="text-white" size={24} />
                    </div>
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      奖品列表
                    </span>
                  </h2>
                </div>
                
                <CardContent className="max-h-[600px] overflow-y-auto p-4">
                  <div className="space-y-3">
                    {prizes.map((prize, index) => (
                      <div
                        key={prize.id}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-800/30 hover:from-slate-700/60 hover:to-slate-700/40 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-500/50 backdrop-blur-sm"
                      >
                        {/* hover发光效果 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative flex items-center gap-4 p-4">
                          {/* 奖品图片或编号 */}
                          {prize.image ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/30 flex-shrink-0">
                              <img 
                                src={prize.image} 
                                alt={prize.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // 如果图片加载失败，显示备用样式
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                                      ${index + 1}
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/50 flex-shrink-0">
                              {index + 1}
                            </div>
                          )}
                          
                          {/* 奖品信息 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base md:text-lg text-white mb-1 truncate">{prize.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/50 rounded text-xs text-purple-300 font-mono">
                                {prize.probability}%
                              </div>
                              {prize.stock > 0 && (
                                <div className="px-2 py-0.5 bg-cyan-500/30 border border-cyan-400/50 rounded text-xs text-cyan-300 font-mono">
                                  剩余 {prize.stock}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 闪烁指示器 */}
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 支付模态框 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* 结果模态框 - 科技感样式 */}
      <Modal
        isOpen={showResultModal}
        onClose={closeResultModal}
        title=""
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 p-8">
          {/* 背景动画 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
          
          <div className="relative text-center">
            <div className="text-7xl mb-6 animate-bounce">
              {result?.is_winner ? '🎉' : '😔'}
            </div>
            
            <h3 className="text-3xl font-bold mb-2">
              <span className={`bg-gradient-to-r ${result?.is_winner ? 'from-yellow-400 to-pink-400' : 'from-gray-400 to-gray-600'} bg-clip-text text-transparent`}>
                {result?.is_winner ? '恭喜中奖！' : '很遗憾'}
              </span>
            </h3>
            
            {result?.is_winner ? (
              <>
                <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50">
                  <p className="text-2xl font-bold text-cyan-300 mb-2">
                    {result.prize?.name}
                  </p>
                  <p className="text-purple-300">
                    请凭证件号到指定地点领取奖品
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400 my-6">
                再接再厉，下次一定能中！
              </p>
            )}

            {currentUser && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-purple-500/30">
                <p className="text-sm text-gray-400">
                  证件号：<span className="font-medium text-cyan-300">{currentUser.idNumber}</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={closeResultModal} 
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                关闭
              </Button>
              <Button 
                onClick={() => {
                  closeResultModal();
                  setShowPaymentModal(true);
                }} 
                className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0"
              >
                再来一次
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Lottery;
