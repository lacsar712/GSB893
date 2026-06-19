import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { prizeAPI } from '../services/api';
import { toast } from '@/lib/utils';

// 将相对路径转为绝对 URL，确保图片能正确加载（解决一等奖等图片不显示）
const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
};

const PrizeManage = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    probability: '',
    stock: '-1',
    status: '1',
    image: '',
  });

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const response = await prizeAPI.getAllPrizes();
      if (response.success) {
        setPrizes(response.data);
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPrize(null);
    setFormData({
      name: '',
      probability: '',
      stock: '-1',
      status: '1',
      image: '',
    });
    setShowModal(true);
  };

  const handleEdit = (prize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      probability: prize.probability.toString(),
      stock: prize.stock.toString(),
      status: prize.status.toString(),
      image: prize.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个奖品吗？')) return;

    try {
      const response = await prizeAPI.deletePrize(id);
      if (response.success) {
        toast.success('删除成功');
        loadPrizes();
      }
    } catch (error) {
      toast.error(error.message || '删除失败');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.probability) {
      toast.error('请填写必填字段');
      return;
    }

    const probability = parseFloat(formData.probability);
    if (probability < 0 || probability > 100) {
      toast.error('概率必须在0-100之间');
      return;
    }

    // 概率总和不能超过 100%
    const otherEnabledSum = prizes
      .filter((p) => p.status === 1 && (!editingPrize || p.id !== editingPrize.id))
      .reduce((sum, p) => sum + parseFloat(p.probability), 0);
    const newStatus = parseInt(formData.status, 10);
    const addedProbability = newStatus === 1 ? probability : 0;
    const totalAfter = otherEnabledSum + addedProbability;
    if (totalAfter > 100) {
      toast.error(`概率总和不能超过 100%。当前其他已启用奖品概率和为 ${otherEnabledSum.toFixed(2)}%，加上本次将达 ${totalAfter.toFixed(2)}%，请调整后再保存。`);
      return;
    }

    try {
      const data = {
        name: formData.name,
        probability: probability,
        stock: parseInt(formData.stock),
        status: parseInt(formData.status),
        image: formData.image || null,
      };

      let response;
      if (editingPrize) {
        response = await prizeAPI.updatePrize(editingPrize.id, data);
      } else {
        response = await prizeAPI.createPrize(data);
      }

      if (response.success) {
        toast.success(editingPrize ? '更新成功' : '创建成功');
        setShowModal(false);
        loadPrizes();
      }
    } catch (error) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    try {
      const response = await prizeAPI.uploadImage(file);
      if (response.data && response.data.data.url) {
        setFormData({ ...formData, image: response.data.data.url });
        toast.success('上传成功');
      }
    } catch (error) {
      if (error.response?.status === 413) {
        toast.error('图片太大，请选择小于 20MB 的图片');
      } else {
        toast.error(error.message || '上传失败');
      }
    }
  };

  const totalProbability = prizes
    .filter(p => p.status === 1)
    .reduce((sum, p) => sum + parseFloat(p.probability), 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft size={16} className="mr-2" />
                返回管理后台
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">奖品管理</h1>
          </div>
          <Button onClick={handleAdd}>
            <Plus size={16} className="mr-2" />
            添加奖品
          </Button>
        </div>

        {/* 概率总和提示 */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">已启用奖品的概率总和：</span>
              <span className={`text-2xl font-bold ${
                totalProbability > 100 ? 'text-red-600' : 
                totalProbability === 100 ? 'text-green-600' : 
                'text-orange-600'
              }`}>
                {totalProbability.toFixed(2)}%
              </span>
            </div>
            {totalProbability > 100 && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ 警告：概率总和超过100%，请调整奖品概率
              </p>
            )}
          </CardContent>
        </Card>

        {/* 奖品列表 */}
        <Card>
          <CardHeader>
            <CardTitle>奖品列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
              </div>
            ) : prizes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🎁</div>
                <p>暂无奖品，点击添加按钮创建</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">奖品名称</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">图片</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">概率</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">库存</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prizes.map((prize) => (
                      <tr key={prize.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{prize.name}</td>
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                            {prize.image && (
                              <img
                                src={getImageUrl(prize.image)}
                                alt={prize.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-purple-600">{prize.probability}%</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {prize.stock === -1 ? '无限' : prize.stock}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prize.status === 1 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {prize.status === 1 ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(prize)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(prize.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 添加/编辑模态框 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPrize ? '编辑奖品' : '添加奖品'}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              奖品名称 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：一等奖 - iPhone 15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中奖概率(%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              placeholder="0-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                库存数量
              </label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="-1表示无限"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="1">启用</option>
                <option value="0">禁用</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              奖品图片
            </label>
            <div className="flex items-center space-x-3">
              {formData.image && (
                <img src={getImageUrl(formData.image)} alt="预览" className="w-16 h-16 rounded-lg object-cover" />
              )}
              <label className="flex-1">
                <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <Upload size={20} className="inline-block mr-2" />
                  <span className="text-sm text-gray-600">点击上传图片</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              取消
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {editingPrize ? '更新' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrizeManage;
