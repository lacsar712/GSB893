<?php

namespace App\Controllers;

use App\Models\User;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;

class UserController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * 用户注册/登录（根据证件号）
     */
    public function register(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // 验证证件号
            if (empty($data['id_number'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '请输入证件号后六位'
                ], 400);
            }

            $idNumber = strtolower(trim($data['id_number']));
            
            // 验证格式：6位，可包含数字和字母x
            if (!preg_match('/^[0-9a-z]{6}$/', $idNumber) || 
                (strpos($idNumber, 'x') !== false && substr_count($idNumber, 'x') > 1)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '证件号格式不正确，请输入6位数字或字母（支持小写x）'
                ], 400);
            }

            // 获取或创建用户
            $user = User::getOrCreateByIdNumber($idNumber);

            $this->logger->info("用户注册/登录", [
                'user_id' => $user->id,
                'id_number' => $idNumber
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => '验证成功',
                'data' => [
                    'user_id' => $user->id,
                    'id_number' => $user->id_number
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error("用户注册失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '系统错误：' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 根据证件号获取用户ID
     */
    public function getUserByIdNumber(Request $request, Response $response, $args)
    {
        try {
            $idNumber = strtolower($args['idNumber']);
            $user = User::where('id_number', $idNumber)->first();

            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '用户不存在'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => [
                    'user_id' => $user->id,
                    'id_number' => $user->id_number
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error("获取用户失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '系统错误'
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
