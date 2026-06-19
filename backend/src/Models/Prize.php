<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prize extends Model
{
    protected $table = 'prizes';
    
    protected $fillable = [
        'name',
        'image',
        'probability',
        'stock',
        'status'
    ];

    protected $casts = [
        'probability' => 'float',
        'stock' => 'integer',
        'status' => 'integer',
    ];

    public $timestamps = true;
    
    const UPDATED_AT = 'updated_at';
    const CREATED_AT = 'created_at';

    /**
     * 获取启用的奖品
     */
    public static function getActiveWithStock()
    {
        return self::where('status', 1)
            ->where(function($query) {
                $query->where('stock', '>', 0)
                      ->orWhere('stock', -1);
            })
            ->get();
    }

    /**
     * 抽奖记录关联
     */
    public function lotteryRecords()
    {
        return $this->hasMany(LotteryRecord::class, 'prize_id');
    }
}
