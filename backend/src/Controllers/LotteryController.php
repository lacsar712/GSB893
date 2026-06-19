<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\LotteryRecord;
use App\Services\LotteryService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;

class LotteryController
{
    private $logger;
    private $lotteryService;

    public function __construct(LoggerInterface $logger, LotteryService $lotteryService)
    {
        $this->logger = $logger;
        $this->lotteryService = $lotteryService;
    }

    /**
     * 执行抽奖
     */
    public function draw(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (empty($data['user_id'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '缺少用户ID'
                ], 400);
            }

            $userId = $data['user_id'];

            // 验证用户是否存在
            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '用户不存在'
                ], 404);
            }

            // 检查用户是否有抽奖资格
            if (!$this->lotteryService->checkUserEligibility($userId)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '您没有可用的抽奖机会，请先支付'
                ], 403);
            }

            // 执行抽奖
            $result = $this->lotteryService->draw($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => $result['is_winner'] ? '恭喜中奖！' : '很遗憾，未中奖',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            $this->logger->error("抽奖失败", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '抽奖失败：' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取用户抽奖历史
     */
    public function getHistory(Request $request, Response $response, $args)
    {
        try {
            $userId = $args['userId'];

            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '用户不存在'
                ], 404);
            }

            $history = LotteryRecord::getUserHistory($userId);

            $formattedHistory = $history->map(function($record) {
                return [
                    'id' => $record->id,
                    'is_winner' => $record->is_winner,
                    'prize' => $record->prize ? [
                        'id' => $record->prize->id,
                        'name' => $record->prize->name,
                        'image' => $record->prize->image
                    ] : null,
                    'created_at' => $record->created_at->format('Y-m-d H:i:s')
                ];
            });

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'id_number' => $user->id_number
                    ],
                    'history' => $formattedHistory,
                    'total_count' => $history->count(),
                    'win_count' => $history->where('is_winner', 1)->count()
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error("获取历史失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '获取历史失败'
            ], 500);
        }
    }

    /**
     * 获取用户剩余抽奖次数
     */
    public function getRemainingChances(Request $request, Response $response, $args)
    {
        try {
            $userId = $args['userId'];

            $remaining = $this->lotteryService->getUserRemainingChances($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => [
                    'remaining_chances' => $remaining
                ]
            ]);

        } catch (\Exception $e) {
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
