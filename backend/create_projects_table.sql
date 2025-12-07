-- ============================
-- 프로젝트 테이블 생성
-- ============================
-- 이 파일을 MySQL에서 직접 실행하거나, Python 스크립트로 실행하세요

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(100),
    duration VARCHAR(100),
    required_skills TEXT,
    status ENUM('OPEN', 'CLOSED', 'IN_PROGRESS') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);
