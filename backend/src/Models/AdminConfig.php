<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminConfig extends Model
{
    protected $table = 'admin_config';
    
    protected $fillable = [
        'config_key',
        'config_value'
    ];

    public $timestamps = true;
    
    const UPDATED_AT = 'updated_at';
    const CREATED_AT = null; // 没有created_at字段

    /**
     * 获取配置值
     */
    public static function getValue($key, $default = null)
    {
        $config = self::where('config_key', $key)->first();
        return $config ? $config->config_value : $default;
    }

    /**
     * 设置配置值
     */
    public static function setValue($key, $value)
    {
        return self::updateOrCreate(
            ['config_key' => $key],
            ['config_value' => $value]
        );
    }
}
