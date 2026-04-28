-- =====================================================
-- SmartCS — Article Management Schema
-- Database: u444914729_smartcs
-- Run this SQL manually in phpMyAdmin / MySQL client
-- =====================================================

-- 1. TABEL UTAMA ARTIKEL
CREATE TABLE IF NOT EXISTS `articles` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL-friendly title, e.g. peluncuran-model-terbaru',
    `title` VARCHAR(500) NOT NULL,
    `subtitle` VARCHAR(500) DEFAULT NULL COMMENT 'Ringkasan singkat / subjudul',
    `category` ENUM('berita','kegiatan','insight','promo','tips') NOT NULL DEFAULT 'berita',
    `author` VARCHAR(100) NOT NULL DEFAULT 'Mitsubishi Dwindo',
    `image` VARCHAR(500) DEFAULT NULL COMMENT 'Path/URL hero image',
    `content` LONGTEXT NOT NULL COMMENT 'Isi artikel (HTML)',
    `gallery` JSON DEFAULT NULL COMMENT 'Array of image URLs, e.g. ["url1","url2"]',
    `tags` JSON DEFAULT NULL COMMENT 'Array of tag strings, e.g. ["otomotif","promo"]',
    `read_time` VARCHAR(20) DEFAULT '3 min read',
    
    -- CTA Configuration (judul, deskripsi, tombol ditentukan statis di frontend sesuai type)
    `cta_type` ENUM('booking','test_drive','prospect','emergency','sparepart','aksesoris','complaint','none') NOT NULL DEFAULT 'test_drive' COMMENT 'Jenis CTA, semua diarahkan ke VirtualCS chat sesuai konteks',
    
    -- Status & Visibility
    `status` ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    `published_at` DATETIME DEFAULT NULL COMMENT 'Tanggal publish (null = belum dipublish)',
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Tampilkan di homepage?',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Urutan tampil, makin kecil makin atas',
    
    -- Metadata
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_status` (`status`),
    INDEX `idx_category` (`category`),
    INDEX `idx_published_at` (`published_at`),
    INDEX `idx_featured` (`is_featured`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. TABEL VIEWS (Artikel Dilihat)
CREATE TABLE IF NOT EXISTS `article_views` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `article_id` INT UNSIGNED NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(500) DEFAULT NULL,
    `viewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_article_id` (`article_id`),
    INDEX `idx_article_ip` (`article_id`, `ip_address`),
    FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. TABEL LIKES (Suka Artikel)
CREATE TABLE IF NOT EXISTS `article_likes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `article_id` INT UNSIGNED NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `liked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY `uq_article_ip` (`article_id`, `ip_address`) COMMENT 'Satu IP hanya bisa 1x like per artikel',
    FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. TABEL COMMENTS (Komentar Artikel)
CREATE TABLE IF NOT EXISTS `article_comments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `article_id` INT UNSIGNED NOT NULL,
    `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Untuk reply/thread, null = root',
    `sender_name` VARCHAR(100) DEFAULT 'Anonim',
    `sender_type` ENUM('visitor','admin') NOT NULL DEFAULT 'visitor',
    `comment` TEXT NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `is_approved` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=tampil, 0=pending moderasi',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_article_id` (`article_id`),
    INDEX `idx_parent_id` (`parent_id`),
    FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `article_comments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- SEED DATA (Sample Articles)
-- =====================================================

INSERT INTO `articles` (`slug`, `title`, `subtitle`, `category`, `author`, `image`, `content`, `gallery`, `tags`, `read_time`, `cta_type`, `status`, `published_at`, `is_featured`, `sort_order`) VALUES

('peluncuran-model-terbaru-mitsubishi', 
 'Peluncuran Model Terbaru Mitsubishi: Inovasi Tanpa Batas', 
 'Temukan fitur-fitur mutakhir dan desain revolusioner dari lini kendaraan terbaru kami.',
 'berita', 'Mitsubishi Dwindo', '/images/updates/news.png',
 '<p class=\"text-lg md:text-xl text-gray-700 leading-relaxed mb-6\">Jakarta - Mitsubishi Motors kembali menggebrak pasar otomotif Tanah Air dengan peluncuran model terbarunya.</p><h3>Desain Dynamic Shield Generasi Terbaru</h3><p class=\"text-gray-600 leading-relaxed mb-6\">Tampilan depan kendaraan kini mengusung konsep Dynamic Shield generasi terbaru yang lebih agresif dan futuristik.</p>',
 '["https://i.pinimg.com/1200x/c0/81/fc/c081fc31d86065bf1ccf48ac1ed53ad1.jpg","https://i.pinimg.com/1200x/a9/2c/8f/a92c8f24970944e1832bcac0ed7277c0.jpg","https://i.pinimg.com/736x/0d/16/f2/0d16f2a497de0f5ccf682b2d1ae46af5.jpg"]',
 '["otomotif","mitsubishi","peluncuran"]', '3 min read',
 'test_drive',
 'published', '2026-04-23 10:00:00', 1, 1),

('gathering-komunitas-mitsubishi-bintaro-2026', 
 'Gathering Komunitas Mitsubishi Bintaro 2026', 
 'Kemeriahan acara kumpul bareng ratusan pemilik kendaraan Mitsubishi di Bintaro.',
 'kegiatan', 'Mitsubishi Dwindo', '/images/updates/activity.png',
 '<p class=\"text-lg md:text-xl text-gray-700 leading-relaxed mb-6\">Kemeriahan acara kumpul bareng ratusan pemilik kendaraan Mitsubishi di Bintaro.</p>',
 NULL, '["komunitas","gathering","bintaro"]', '5 min read',
 'whatsapp',
 'published', '2026-04-15 08:00:00', 0, 2),

('pentingnya-perawatan-berkala-di-bengkel-resmi', 
 'Pentingnya Perawatan Berkala di Bengkel Resmi', 
 'Ketahui mengapa servis rutin di dealer resmi memperpanjang umur kendaraan Anda.',
 'insight', 'Mitsubishi Dwindo', '/images/updates/insight.png',
 '<p class=\"text-lg md:text-xl text-gray-700 leading-relaxed mb-6\">Ketahui mengapa servis rutin dengan suku cadang asli dapat memperpanjang umur kendaraan Anda.</p>',
 NULL, '["service","perawatan","tips"]', '4 min read',
 'booking',
 'published', '2026-04-10 09:00:00', 0, 3);

