<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250322192135 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Safe migration to ensure column compatibility';
    }

    public function up(Schema $schema): void
    {
        // Vérifie d'abord si la colonne existe avant d'essayer de la supprimer
        $columns = $this->connection->fetchAllAssociative(
            "SHOW COLUMNS FROM user LIKE 'is_verified'"
        );
        
        if (!empty($columns)) {
            $this->addSql('ALTER TABLE user DROP COLUMN is_verified');
        }
    }

    public function down(Schema $schema): void
    {
        // Vérifier si la colonne n'existe pas avant de l'ajouter
        $columns = $this->connection->fetchAllAssociative(
            "SHOW COLUMNS FROM user LIKE 'is_verified'"
        );
        
        if (empty($columns)) {
            $this->addSql('ALTER TABLE user ADD is_verified TINYINT(1) NOT NULL');
        }
    }
}