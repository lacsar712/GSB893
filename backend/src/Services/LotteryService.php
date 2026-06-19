<?php

namespace App\Services;

use App\Models\Prize;
use App\Models\User;
use App\Models\LotteryRecord;
use App\Models\PaymentRecord;
use Illuminate\Database\Capsule\Manager as DB;
use Psr\Log\LoggerInterface;

class LotteryService
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * 执行抽奖逻辑
     * 
     * @param int $userId 用户ID
     * @return array 抽奖结果
     */
    public function draw($userId)
    {
        try {
            // 获取用户信息
            $user = User::find($userId);
            if (!$user) {
                throw new \Exception('用户不存在');
            }

            // 获取所有可用奖品
            $prizes = Prize::getActiveWithStock();
            
            if ($prizes->isEmpty()) {
                throw new \Exception('暂无可用奖品');
            }

            // 执行抽奖算法
            $wonPrize = $this->performLottery($prizes);

            // 开始数据库事务
            DB::beginTransaction();

            try {
                // 如果中奖且库存不是无限，减少库存
                if ($wonPrize && $wonPrize->stock > 0) {
                    $wonPrize->decrement('stock');
                    $this->logger->info("奖品库存减少", [
                        'prize_id' => $wonPrize->id,
                        'prize_name' => $wonPrize->name,
                        'remaining_stock' => $wonPrize->stock - 1
                    ]);
                }

                // 记录抽奖结果
                $record = LotteryRecord::create([
                    'user_id' => $userId,
                    'prize_id' => $wonPrize ? $wonPrize->id : null,
                    'is_winner' => $wonPrize ? 1 : 0
                ]);

                DB::commit();

                $this->logger->info("抽奖成功", [
                    'user_id' => $userId,
                    'id_number' => $user->id_number,
                    'prize_id' => $wonPrize ? $wonPrize->id : null,
                    'prize_name' => $wonPrize ? $wonPrize->name : '未中奖',
                    'is_winner' => $wonPrize ? 1 : 0
                ]);

                return [
                    'success' => true,
                    'is_winner' => $wonPrize ? true : false,
                    'prize' => $wonPrize ? [
                        'id' => $wonPrize->id,
                        'name' => $wonPrize->name,
                        'image' => $wonPrize->image
                    ] : null,
                    'record_id' => $record->id
                ];

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            $this->logger->error("抽奖失败", [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * 加权随机抽奖算法
     * 
     * @param \Illuminate\Support\Collection $prizes 奖品列表
     * @return Prize|null 中奖奖品或null
     */
    private function performLottery($prizes)
    {
        // 构建累积概率数组
        $probabilityRanges = [];
        $cumulative = 0;

        foreach ($prizes as $prize) {
            $start = $cumulative;
            $end = $cumulative + $prize->probability;
            
            $probabilityRanges[] = [
                'prize' => $prize,
                'start' => $start,
                'end' => $end
            ];
            
            $cumulative = $end;
        }

        $this->logger->debug("概率区间构建完成", [
            'total_probability' => $cumulative,
            'prize_count' => count($probabilityRanges)
        ]);

        // 如果总概率小于100，添加"未中奖"区间
        if ($cumulative < 100) {
            $probabilityRanges[] = [
                'prize' => null,
                'start' => $cumulative,
                'end' => 100
            ];
            $cumulative = 100;
        }

        // 生成随机数 (0-100之间，支持小数)
        $random = $this->getRandomFloat(0, $cumulative);
        
        $this->logger->debug("生成随机数", ['random' => $random]);

        // 查找中奖区间
        foreach ($probabilityRanges as $range) {
            if ($random >= $range['start'] && $random < $range['end']) {
                $prizeName = $range['prize'] ? $range['prize']->name : '未中奖';
                $this->logger->info("抽奖命中区间", [
                    'random' => $random,
                    'start' => $range['start'],
                    'end' => $range['end'],
                    'prize' => $prizeName
                ]);
                return $range['prize'];
            }
        }

        // 边界情况：如果没有命中任何区间，返回null
        $this->logger->warning("未命中任何区间", ['random' => $random]);
        return null;
    }

    /**
     * 生成随机浮点数
     * 
     * @param float $min 最小值
     * @param float $max 最大值
     * @return float
     */
    private function getRandomFloat($min, $max)
    {
        return $min + mt_rand() / mt_getrandmax() * ($max - $min);
    }

    /**
     * 验证用户是否有抽奖资格（已支付）
     * 
     * @param int $userId 用户ID
     * @return bool
     */
    public function checkUserEligibility($userId)
    {
        // 获取用户的支付次数和抽奖次数
        $paymentCount = PaymentRecord::where('user_id', $userId)
            ->where('status', 'success')
            ->count();
        
        $lotteryCount = LotteryRecord::where('user_id', $userId)->count();

        // 支付次数必须大于抽奖次数（即有剩余机会）
        return $paymentCount > $lotteryCount;
    }

    /**
     * 获取用户剩余抽奖次数
     * 
     * @param int $userId 用户ID
     * @return int
     */
    public function getUserRemainingChances($userId)
    {
        $paymentCount = PaymentRecord::where('user_id', $userId)
            ->where('status', 'success')
            ->count();
        
        $lotteryCount = LotteryRecord::where('user_id', $userId)->count();

        return max(0, $paymentCount - $lotteryCount);
    }
}
