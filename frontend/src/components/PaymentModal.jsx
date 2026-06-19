import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { toast } from '@/lib/utils';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('input'); // 'input' | 'payment' | 'processing'
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');

  const validateIdNumber = (value) => {
    const cleaned = value.toLowerCase().trim();
    
    if (cleaned.length !== 6) {
      return '请输入6位证件号';
    }
    
    if (!/^[0-9a-z]{6}$/.test(cleaned)) {
      return '只能包含数字和字母';
    }
    
    const xCount = (cleaned.match(/x/g) || []).length;
    if (xCount > 1) {
      return '最多只能包含一个字母x';
    }
    
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateIdNumber(idNumber);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setStep('payment');
  };

  const handlePayment = () => {
    setStep('processing');
    
    // 模拟支付处理
    setTimeout(() => {
      toast.success('支付成功！');
      onSuccess(idNumber.toLowerCase().trim());
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setStep('input');
    setIdNumber('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="参与抽奖">
      {step === 'input' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ 请输入您的证件号后六位进行登记，证件号错误将无法兑奖！
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              证件号后六位 <span className="text-red-500">*</span>
            </label>
            <Input
              value={idNumber}
              onChange={(e) => {
                setIdNumber(e.target.value);
                setError('');
              }}
              placeholder="支持数字和字母x"
              maxLength={6}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              取消
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              下一步
            </Button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">支付 ¥1.00</h3>
            <p className="text-gray-600">
              每次抽奖需要支付1元获取抽奖机会
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">证件号：</span>
              <span className="font-medium">{idNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-600">金额：</span>
              <span className="font-medium text-lg text-purple-600">¥1.00</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setStep('input')} className="flex-1">
              返回
            </Button>
            <Button onClick={handlePayment} variant="success" className="flex-1">
              确认支付
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">支付处理中...</p>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
