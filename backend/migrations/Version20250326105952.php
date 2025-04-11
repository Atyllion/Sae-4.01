<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250326105952 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Safe version for post-user relationship';
    }

    public function up(Schema $schema): void
    {
        // S'assurer que la table post existe
        $tableExists = $this->connection->executeQuery(
            "SHOW TABLES LIKE 'post'"
        )->fetchOne();
        
        if ($tableExists) {
            // Vérifier si la colonne user_id existe
            $sql = "SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = '{$this->connection->getDatabase()}' 
                    AND TABLE_NAME = 'post' 
                    AND COLUMN_NAME = 'user_id'";
            
            $columnExists = $this->connection->executeQuery($sql)->fetchOne();
            
            if (!$columnExists) {
                // Ajouter la colonne si elle n'existe pas
                $this->addSql('ALTER TABLE post ADD user_id INT DEFAULT NULL');
                $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
                $this->addSql('CREATE INDEX IDX_5A8A6C8DA76ED395 ON post (user_id)');
            }
            
            // Ici, ajoutez le reste du code de la migration originale
            // qui n'implique pas directement la colonne user_id
        }
    }

    public function down(Schema $schema): void
    {
        // Code pour annuler les modifications
        // avec vérifications similaires
    }
}