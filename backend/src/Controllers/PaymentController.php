<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\PaymentRecord;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;

class PaymentController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * 创建支付订单（模拟支付）
     */
    public function createPayment(Request $request, Response $response)
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
            $amount = $data['amount'] ?? 1.00;

            // 验证用户是否存在
            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '用户不存在'
                ], 404);
            }

            // 创建支付记录（模拟支付成功）
            $payment = PaymentRecord::createPayment($userId, $amount);

            $this->logger->info("支付成功", [
                'user_id' => $userId,
                'id_number' => $user->id_number,
                'amount' => $amount,
                'payment_id' => $payment->id
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => '支付成功',
                'data' => [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                    'status' => $payment->status
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error("支付失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '支付失败：' . $e->getMessage()
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
