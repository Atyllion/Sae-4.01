<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250322195925 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Safe version to handle is_verified column';
    }

    public function up(Schema $schema): void
    {
        // Vérifier si la colonne existe avant de la supprimer
        $sql = "SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '{$this->connection->getDatabase()}' 
                AND TABLE_NAME = 'user' 
                AND COLUMN_NAME = 'is_verified'";
        
        $result = $this->connection->executeQuery($sql)->fetchOne();
        
        if ($result) {
            $this->addSql('ALTER TABLE user DROP is_verified');
        }
    }

    public function down(Schema $schema): void
    {
        // Vérifier si la colonne n'existe pas avant de l'ajouter
        $sql = "SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '{$this->connection->getDatabase()}' 
                AND TABLE_NAME = 'user' 
                AND COLUMN_NAME = 'is_verified'";
        
        $result = $this->connection->executeQuery($sql)->fetchOne();
        
        if (!$result) {
            $this->addSql('ALTER TABLE user ADD is_verified TINYINT(1) NOT NULL');
        }
    }
}