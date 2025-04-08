<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250407072618 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE reply (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, post_id INT NOT NULL, content VARCHAR(280) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_FDA8C6E0A76ED395 (user_id), INDEX IDX_FDA8C6E04B89032C (post_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE reply_like (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, reply_id INT NOT NULL, INDEX IDX_FCCDD585A76ED395 (user_id), INDEX IDX_FCCDD5858A0E4E7F (reply_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E0A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E04B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE reply_like ADD CONSTRAINT FK_FCCDD585A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE reply_like ADD CONSTRAINT FK_FCCDD5858A0E4E7F FOREIGN KEY (reply_id) REFERENCES reply (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E0A76ED395');
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E04B89032C');
        $this->addSql('ALTER TABLE reply_like DROP FOREIGN KEY FK_FCCDD585A76ED395');
        $this->addSql('ALTER TABLE reply_like DROP FOREIGN KEY FK_FCCDD5858A0E4E7F');
        $this->addSql('DROP TABLE reply');
        $this->addSql('DROP TABLE reply_like');
    }
}
