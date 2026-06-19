import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, BarChart3, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Admin = () => {
  const menuItems = [
    {
      icon: Gift,
      title: '奖品管理',
      description: '添加、编辑、删除奖品，设置中奖概率',
      link: '/admin/prizes',
      color: 'from-purple-500 to-blue-500',
    },
    {
      icon: BarChart3,
      title: '数据统计',
      description: '查看参与人数、中奖率、收入等统计信息',
      link: '/admin/statistics',
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">后台管理</h1>
            <p className="text-gray-600">管理抽奖系统的各项配置和数据</p>
          </div>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              返回前台
            </Button>
          </Link>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.link}>
              <Card className="h-full hover:scale-105 transition-transform duration-200 cursor-pointer">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 快捷信息 */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">系统版本</p>
                <p className="text-lg font-bold text-purple-600">v1.0.0</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">数据库</p>
                <p className="text-lg font-bold text-blue-600">MySQL 8.0</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">后端</p>
                <p className="text-lg font-bold text-green-600">PHP 8.2</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">前端</p>
                <p className="text-lg font-bold text-orange-600">React 18</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
