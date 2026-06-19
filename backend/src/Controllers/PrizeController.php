<?php

namespace App\Controllers;

use App\Models\Prize;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;

class PrizeController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * 获取启用的奖品列表（前台）
     */
    public function getActivePrizes(Request $request, Response $response)
    {
        try {
            $prizes = Prize::where('status', 1)
                ->orderBy('probability', 'desc')
                ->get();

            $formattedPrizes = $prizes->map(function($prize) {
                return [
                    'id' => $prize->id,
                    'name' => $prize->name,
                    'image' => $prize->image,
                    'probability' => $prize->probability
                ];
            });

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $formattedPrizes
            ]);

        } catch (\Exception $e) {
            $this->logger->error("获取奖品列表失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '获取失败'
            ], 500);
        }
    }

    /**
     * 获取所有奖品（后台）
     */
    public function getAllPrizes(Request $request, Response $response)
    {
        try {
            $prizes = Prize::orderBy('created_at', 'desc')->get();

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $prizes
            ]);

        } catch (\Exception $e) {
            $this->logger->error("获取所有奖品失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '获取失败'
            ], 500);
        }
    }

    /**
     * 创建奖品
     */
    public function createPrize(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // 验证必填字段
            if (empty($data['name']) || !isset($data['probability'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '缺少必填字段'
                ], 400);
            }

            // 验证概率范围
            if ($data['probability'] < 0 || $data['probability'] > 100) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '概率必须在0-100之间'
                ], 400);
            }

            // 概率总和不能超过 100%
            $status = $data['status'] ?? 1;
            $otherSum = Prize::where('status', 1)->sum('probability');
            $totalAfter = $otherSum + ($status == 1 ? (float) $data['probability'] : 0);
            if ($totalAfter > 100) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '已启用奖品的概率总和不能超过 100%，当前为 ' . round($otherSum, 2) . '%，请调整后再创建'
                ], 400);
            }

            $prize = Prize::create([
                'name' => $data['name'],
                'image' => $data['image'] ?? null,
                'probability' => $data['probability'],
                'stock' => $data['stock'] ?? -1,
                'status' => $data['status'] ?? 1
            ]);

            $this->logger->info("创建奖品", [
                'prize_id' => $prize->id,
                'name' => $prize->name
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => '创建成功',
                'data' => $prize
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error("创建奖品失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '创建失败：' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 更新奖品
     */
    public function updatePrize(Request $request, Response $response, $args)
    {
        try {
            $prizeId = $args['id'];
            $data = json_decode($request->getBody()->getContents(), true);

            $prize = Prize::find($prizeId);
            if (!$prize) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '奖品不存在'
                ], 404);
            }

            // 验证概率
            if (isset($data['probability']) && ($data['probability'] < 0 || $data['probability'] > 100)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '概率必须在0-100之间'
                ], 400);
            }

            // 概率总和不能超过 100%
            $otherSum = Prize::where('status', 1)->where('id', '!=', $prizeId)->sum('probability');
            $newStatus = isset($data['status']) ? (int) $data['status'] : $prize->status;
            $newProb = isset($data['probability']) ? (float) $data['probability'] : (float) $prize->probability;
            $totalAfter = $otherSum + ($newStatus == 1 ? $newProb : 0);
            if ($totalAfter > 100) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '已启用奖品的概率总和不能超过 100%，请调整后再保存'
                ], 400);
            }

            $prize->update($data);

            $this->logger->info("更新奖品", [
                'prize_id' => $prize->id,
                'name' => $prize->name
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => '更新成功',
                'data' => $prize
            ]);

        } catch (\Exception $e) {
            $this->logger->error("更新奖品失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '更新失败'
            ], 500);
        }
    }

    /**
     * 删除奖品
     */
    public function deletePrize(Request $request, Response $response, $args)
    {
        try {
            $prizeId = $args['id'];

            $prize = Prize::find($prizeId);
            if (!$prize) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '奖品不存在'
                ], 404);
            }

            $prizeName = $prize->name;
            $prize->delete();

            $this->logger->info("删除奖品", [
                'prize_id' => $prizeId,
                'name' => $prizeName
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => '删除成功'
            ]);

        } catch (\Exception $e) {
            $this->logger->error("删除奖品失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '删除失败'
            ], 500);
        }
    }

    /**
     * 上传奖品图片
     */
    public function uploadImage(Request $request, Response $response)
    {
        try {
            $uploadedFiles = $request->getUploadedFiles();
            
            if (empty($uploadedFiles['image'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '未上传文件'
                ], 400);
            }

            $uploadedFile = $uploadedFiles['image'];
            
            if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '文件上传失败'
                ], 400);
            }

            // 验证文件类型
            $mimeType = $uploadedFile->getClientMediaType();
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            
            if (!in_array($mimeType, $allowedTypes)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => '只支持JPG、PNG、GIF格式的图片'
                ], 400);
            }

            // 生成唯一文件名
            $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
            $filename = uniqid('prize_') . '.' . $extension;
            $uploadPath = __DIR__ . '/../../uploads/' . $filename;

            // 移动文件
            $uploadedFile->moveTo($uploadPath);

            $imageUrl = '/uploads/' . $filename;

            $this->logger->info("上传图片", ['filename' => $filename]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => '上传成功',
                'data' => [
                    'url' => $imageUrl
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error("上传图片失败", ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => '上传失败：' . $e->getMessage()
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
