FROM php:8.2-apache

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 安装MySQL扩展和依赖
RUN docker-php-ext-install pdo pdo_mysql

# 安装Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 复制composer文件
COPY composer.json ./

# 安装PHP依赖
RUN composer install --no-dev --optimize-autoloader --no-scripts

# 复制项目文件
COPY . .

# 创建上传目录
RUN mkdir -p uploads && chmod 777 uploads

# 配置Apache
RUN a2enmod rewrite
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

# 提高 PHP 上传限制（解决 413 Request Entity Too Large）
RUN echo "upload_max_filesize = 20M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/uploads.ini

EXPOSE 80

CMD ["apache2-foreground"]
