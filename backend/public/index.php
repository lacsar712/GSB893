<?php

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Factory\ServerRequestCreatorFactory;
use Illuminate\Database\Capsule\Manager as Capsule;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use App\Middleware\CorsMiddleware;
use App\Controllers\UserController;
use App\Controllers\PaymentController;
use App\Controllers\LotteryController;
use App\Controllers\PrizeController;
use App\Controllers\AdminController;
use App\Services\LotteryService;

// 初始化数据库连接
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => getenv('DB_HOST') ?: 'db',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_NAME') ?: 'lottery',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: 'root',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    'strict' => false,
    'engine' => null,
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ],
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// 强制设置连接字符集
$capsule->getConnection()->getPdo()->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

// 初始化日志
$logger = new Logger('lottery');
$logger->pushHandler(new StreamHandler('php://stdout', Logger::DEBUG));

// 创建Slim应用
$app = AppFactory::create();

// 添加错误处理
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// 添加CORS中间件
$app->add(new CorsMiddleware());

// 添加路由
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// 依赖注入容器
$container = $app->getContainer();

// 用户相关路由
$app->post('/api/user/register', function ($request, $response) use ($logger) {
    $controller = new UserController($logger);
    return $controller->register($request, $response);
});

$app->get('/api/user/{idNumber}', function ($request, $response, $args) use ($logger) {
    $controller = new UserController($logger);
    return $controller->getUserByIdNumber($request, $response, $args);
});

// 支付相关路由
$app->post('/api/payment/create', function ($request, $response) use ($logger) {
    $controller = new PaymentController($logger);
    return $controller->createPayment($request, $response);
});

// 抽奖相关路由
$app->post('/api/lottery/draw', function ($request, $response) use ($logger) {
    $lotteryService = new LotteryService($logger);
    $controller = new LotteryController($logger, $lotteryService);
    return $controller->draw($request, $response);
});

$app->get('/api/lottery/history/{userId}', function ($request, $response, $args) use ($logger) {
    $lotteryService = new LotteryService($logger);
    $controller = new LotteryController($logger, $lotteryService);
    return $controller->getHistory($request, $response, $args);
});

$app->get('/api/lottery/remaining/{userId}', function ($request, $response, $args) use ($logger) {
    $lotteryService = new LotteryService($logger);
    $controller = new LotteryController($logger, $lotteryService);
    return $controller->getRemainingChances($request, $response, $args);
});

// 奖品相关路由（前台）
$app->get('/api/prizes/active', function ($request, $response) use ($logger) {
    $controller = new PrizeController($logger);
    return $controller->getActivePrizes($request, $response);
});

// 后台管理路由
$app->get('/api/admin/prizes', function ($request, $response) use ($logger) {
    $controller = new PrizeController($logger);
    return $controller->getAllPrizes($request, $response);
});

$app->post('/api/admin/prizes', function ($request, $response) use ($logger) {
    $controller = new PrizeController($logger);
    return $controller->createPrize($request, $response);
});

$app->put('/api/admin/prizes/{id}', function ($request, $response, $args) use ($logger) {
    $controller = new PrizeController($logger);
    return $controller->updatePrize($request, $response, $args);
});

$app->delete('/api/admin/prizes/{id}', function ($request, $response, $args) use ($logger) {
    $controller = new PrizeController($logger);
    return $controller->deletePrize($request, $response, $args);
});

$app->post('/api/admin/prizes/upload', function ($request, $response) use ($logger) {
    $controller = new PrizeController($logger);
    return $controller->uploadImage($request, $response);
});

$app->get('/api/admin/statistics', function ($request, $response) use ($logger) {
    $controller = new AdminController($logger);
    return $controller->getStatistics($request, $response);
});

$app->get('/api/admin/records', function ($request, $response) use ($logger) {
    $controller = new AdminController($logger);
    return $controller->getRecentRecords($request, $response);
});

// 健康检查
$app->get('/api/health', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s')
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 静态文件服务（上传的图片）
$app->get('/uploads/{filename}', function ($request, $response, $args) {
    $filename = $args['filename'];
    $filepath = __DIR__ . '/../uploads/' . $filename;
    
    if (!file_exists($filepath)) {
        $response->getBody()->write('File not found');
        return $response->withStatus(404);
    }
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filepath);
    finfo_close($finfo);
    
    $response->getBody()->write(file_get_contents($filepath));
    return $response->withHeader('Content-Type', $mimeType);
});

$logger->info("Application started", [
    'db_host' => getenv('DB_HOST') ?: 'db',
    'db_name' => getenv('DB_NAME') ?: 'lottery'
]);

$app->run();
