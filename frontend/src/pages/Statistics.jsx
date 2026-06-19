import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Ticket, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { adminAPI } from '../services/api';
import { toast } from '@/lib/utils';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await adminAPI.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      title: '总参与人数',
      value: stats?.total_users || 0,
      color: 'from-blue-500 to-cyan-500',
      suffix: '人',
    },
    {
      icon: Ticket,
      title: '总抽奖次数',
      value: stats?.total_lottery_count || 0,
      color: 'from-purple-500 to-pink-500',
      suffix: '次',
    },
    {
      icon: Trophy,
      title: '总中奖次数',
      value: stats?.total_win_count || 0,
      color: 'from-green-500 to-teal-500',
      suffix: '次',
    },
    {
      icon: TrendingUp,
      title: '中奖率',
      value: stats?.win_rate || 0,
      color: 'from-orange-500 to-red-500',
      suffix: '%',
    },
    {
      icon: DollarSign,
      title: '总收入',
      value: stats?.total_revenue || 0,
      color: 'from-yellow-500 to-orange-500',
      prefix: '¥',
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              返回管理后台
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">数据统计</h1>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.prefix}{card.value}{card.suffix}
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon size={32} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 奖品统计 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>各奖品中奖统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">奖品名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">设置概率</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">中奖次数</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">剩余库存</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.prize_stats && stats.prize_stats.map((prize) => (
                    <tr key={prize.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{prize.name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-purple-600">{prize.probability}%</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{prize.win_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {prize.stock === -1 ? '无限' : prize.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 最近7天趋势 */}
        {stats?.recent_trend && stats.recent_trend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>最近7天抽奖趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recent_trend.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-700 font-medium">{day.date}</div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-sm">
                        <span className="text-gray-600">抽奖：</span>
                        <span className="font-bold text-blue-600">{day.count}次</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">中奖：</span>
                        <span className="font-bold text-green-600">{day.win_count}次</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">中奖率：</span>
                        <span className="font-bold text-orange-600">
                          {day.count > 0 ? ((day.win_count / day.count) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Statistics;
