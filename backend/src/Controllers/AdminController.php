<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Prize;
use App\Models\LotteryRecord;
use App\Models\PaymentRecord;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;

class AdminController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * 获取统计数据
     */
    public function getStatistics(Request $request, Response $response)
    {
        try {
            // 总参与人数
            $totalUsers = User::count();

            // 总抽奖次数
            $totalLotteryCount = LotteryRecord::count();

            // 总中奖次数
            $totalWinCount = LotteryRecord::where('is_winner', 1)->count();

            // 中奖率
            $winRate = $totalLotteryCount > 0 
                ? round(($totalWinCount / $totalLotteryCount) * 100, 2) 
                : 0;

            // 总收入
            $totalRevenue = PaymentRecord::getTotalRevenue();

            // 各奖品中奖统计
            $prizeStats = Prize::leftJoin('lottery_records', 'prizes.id', '=', 'lottery_records.prize_id')
                ->selectRaw('prizes.id, prizes.name, prizes.probability, prizes.stock, COUNT(lottery_records.id) as win_count')
                ->where('prizes.status', 1)
                ->groupBy('prizes.id', 'prizes.name', 'prizes.probability', 'prizes.stock')
                ->get();

            // 最近7天的抽奖趋势
            $recentTrend = LotteryRecord::selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(is_winner) as win_count')
                ->where('created_at', '>=', date('Y-m-d', strtotime('-7 days')))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            $statistics = [
                'total_users' => $totalUsers,
                'total_lottery_count' => $totalLotteryCount,
                'total_win_count' => $totalWinCount,
                'win_rate' => $winRate,
                'total_revenue' => floatval($totalRevenue),
                'prize_stats' => $prizeStats,
                'recent_trend' => $recentTrend
            ];

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $statistics
            ]);

        } catch (\Exception $e) {
            $this->logger->error("获取统计数据失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '获取统计数据失败'
            ], 500);
        }
    }

    /**
     * 获取最近的抽奖记录
     */
    public function getRecentRecords(Request $request, Response $response)
    {
        try {
            $limit = $request->getQueryParams()['limit'] ?? 100;

            $records = LotteryRecord::with(['user', 'prize'])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            $formattedRecords = $records->map(function($record) {
                return [
                    'id' => $record->id,
                    'user' => [
                        'id' => $record->user->id,
                        'id_number' => $record->user->id_number
                    ],
                    'prize' => $record->prize ? [
                        'id' => $record->prize->id,
                        'name' => $record->prize->name
                    ] : null,
                    'is_winner' => $record->is_winner,
                    'created_at' => $record->created_at->format('Y-m-d H:i:s')
                ];
            });

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $formattedRecords
            ]);

        } catch (\Exception $e) {
            $this->logger->error("获取抽奖记录失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '获取失败'
            ], 500);
        }
    }

    private function jsonResponse(Response $response, array $data, int $status = 200)
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }
}
