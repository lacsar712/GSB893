<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRecord extends Model
{
    protected $table = 'payment_records';
    
    protected $fillable = [
        'user_id',
        'amount',
        'status'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'amount' => 'float',
    ];

    public $timestamps = true;
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null; // 没有updated_at字段

    /**
     * 用户关联
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * 创建支付记录
     */
    public static function createPayment($userId, $amount = 1.00)
    {
        return self::create([
            'user_id' => $userId,
            'amount' => $amount,
            'status' => 'success'
        ]);
    }

    /**
     * 获取总收入
     */
    public static function getTotalRevenue()
    {
        return self::where('status', 'success')->sum('amount');
    }
}
