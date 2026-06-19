import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { userAPI, lotteryAPI } from '../services/api';
import { toast } from '@/lib/utils';

const History = () => {
  const [idNumber, setIdNumber] = useState('');
  const [history, setHistory] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!idNumber || idNumber.length !== 6) {
      toast.error('请输入6位证件号');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // 获取用户信息
      const userResponse = await userAPI.getUserByIdNumber(idNumber.toLowerCase().trim());
      
      if (!userResponse.success) {
        toast.error('未找到该用户的记录');
        setHistory([]);
        setUserInfo(null);
        return;
      }

      const userId = userResponse.data.user_id;
      setUserInfo(userResponse.data);

      // 获取抽奖历史
      const historyResponse = await lotteryAPI.getHistory(userId);
      
      if (historyResponse.success) {
        setHistory(historyResponse.data.history);
      }

    } catch (error) {
      toast.error(error.message || '查询失败');
      setHistory([]);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              返回抽奖
            </Button>
          </Link>
        </div>

        {/* 查询卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>查询抽奖记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="请输入证件号后六位"
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search size={16} className="mr-2" />
                {loading ? '查询中...' : '查询'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户信息 */}
        {userInfo && (
          <Card className="mb-8">
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-600 text-sm">证件号</p>
                  <p className="text-lg font-bold text-purple-600">{userInfo.id_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">总抽奖次数</p>
                  <p className="text-lg font-bold text-blue-600">{history.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">中奖次数</p>
                  <p className="text-lg font-bold text-green-600">
                    {history.filter(h => h.is_winner).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 历史记录 */}
        {searched && (
          <Card>
            <CardHeader>
              <CardTitle>抽奖历史</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p>暂无抽奖记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          record.is_winner 
                            ? 'bg-gradient-to-br from-green-400 to-green-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <span className="text-white text-xl">
                            {record.is_winner ? '🎁' : '😔'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {record.prize ? record.prize.name : '未中奖'}
                          </h4>
                          <p className="text-sm text-gray-500">{record.created_at}</p>
                        </div>
                      </div>
                      <div>
                        {record.is_winner ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            已中奖
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            未中奖
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
