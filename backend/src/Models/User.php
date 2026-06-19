<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    
    protected $fillable = [
        'id_number'
    ];

    public $timestamps = true;
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null; // 没有updated_at字段

    /**
     * 根据证件号获取或创建用户
     */
    public static function getOrCreateByIdNumber($idNumber)
    {
        return self::firstOrCreate(['id_number' => $idNumber]);
    }

    /**
     * 抽奖记录关联
     */
    public function lotteryRecords()
    {
        return $this->hasMany(LotteryRecord::class, 'user_id');
    }

    /**
     * 支付记录关联
     */
    public function paymentRecords()
    {
        return $this->hasMany(PaymentRecord::class, 'user_id');
    }

    /**
     * 获取用户总抽奖次数
     */
    public function getTotalLotteryCount()
    {
        return $this->lotteryRecords()->count();
    }

    /**
     * 获取用户中奖次数
     */
    public function getWinCount()
    {
        return $this->lotteryRecords()->where('is_winner', 1)->count();
    }
}
