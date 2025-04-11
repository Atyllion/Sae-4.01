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
        return 'Remove the is_verified column from the user table';
    }

    public function up(Schema $schema): void
    {
        // Supprime la colonne is_verified de la table user
        $this->addSql('ALTER TABLE user DROP COLUMN is_verified');
    }

    public function down(Schema $schema): void
    {
        // Ajoute à nouveau la colonne is_verified dans la table user
        $this->addSql('ALTER TABLE user ADD is_verified TINYINT(1) NOT NULL');
    }
}
