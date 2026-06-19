<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LotteryRecord extends Model
{
    protected $table = 'lottery_records';
    
    protected $fillable = [
        'user_id',
        'prize_id',
        'is_winner'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'prize_id' => 'integer',
        'is_winner' => 'integer',
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
     * 奖品关联
     */
    public function prize()
    {
        return $this->belongsTo(Prize::class, 'prize_id');
    }

    /**
     * 获取用户的抽奖历史（带奖品信息）
     */
    public static function getUserHistory($userId, $limit = 50)
    {
        return self::where('user_id', $userId)
            ->with('prize')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
