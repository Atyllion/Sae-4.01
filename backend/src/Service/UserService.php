<?php

namespace App\Service;

use App\Dto\Payload\CreateUserPayload;
use App\Dto\Payload\UpdateUserPayload;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Token;
use App\Repository\UserRepository;

class UserService
{
    private EntityManagerInterface $entityManager;
    private LoggerInterface $logger;
    private UserRepository $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        UserRepository $userRepository,
    ) {
        $this->entityManager = $entityManager;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
    }

    public function findUserByEmail(string $email): ?User
    {
        return $this->userRepository->findOneBy(['email' => $email]);
    }

    public function create(CreateUserPayload $payload, UserPasswordHasherInterface $passwordHasher): User
        {
            // Création d'un nouvel objet User
            $user = new User();
            $user->setUsername($payload->username);
            $user->setEmail($payload->email);
            $hashedPassword = $passwordHasher->hashPassword($user, $payload->password); // Hash du mot de passe avec le hasheur de Symfony
            $user->setPassword($hashedPassword);
            $user->setRoles($payload->roles);

            // Sauvegarde dans la base de données
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $user;
    }

    public function update(User $user, UpdateUserPayload $payload): User
        {

        // Mise à jour conditionnelle des propriétés
        if (!is_null($payload->username)) { // Vérifie si le champ est défini
            $this->logger->info('Mise à jour du username : ' . $payload->username);
            $user->setUsername($payload->username);
        } else {
            $user->setUsername($user->getUsername()); // Réinitialise la valeur
        }

        if (!is_null($payload->email)) { // Vérifie si le champ est défini
            $this->logger->info('Mise à jour de l\'email : ' . $payload->email);
            $user->setEmail($payload->email);
        } else {
            $user->setEmail($user->getEmail()); // Réinitialise la valeur
        }

        // Sauvegarde dans la base de données
        $this->saveUser($user);
        return $user;
    }

    public function saveUser(User $user): void
    {
        // Sauvegarde dans la base de données
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    public function registerToken(User $user): Token
    {
        // Vérifie si l'utilisateur existe dans la base de données
        $user = $this->entityManager->getRepository(User::class)->find($user->getId());
        if (!$user) {
            throw new \Exception('User not found');
        }
    
        // Invalide tous les anciens tokens de l'utilisateur
        $tokens = $this->entityManager->getRepository(Token::class)->findBy(['user' => $user, 'isValid' => true]);
        foreach ($tokens as $token) {
            $token->setIsValid(false);
        }
    
        // Crée un nouveau token
        $newToken = new Token();
        $rawToken = bin2hex(random_bytes(32)); // Génère un token aléatoire
        $hashedToken = hash('sha256', $rawToken); // Hache le token avec SHA-256
        $newToken->setValue($hashedToken); // Stocke uniquement le token haché
        $newToken->setCreatedAt(new \DateTime());
        $newToken->setExpiresAt((new \DateTime())->modify('+1 hour')); // Expire dans 1 heure
        $newToken->setIsValid(true); // Le nouveau token est valide
        $newToken->setUser($user);
    
        // Persiste les modifications
        $this->entityManager->persist($newToken);
        $this->entityManager->flush();
    
        return $newToken;
    }

    public function getToken(string $token): ?Token
    {
        // Recherche du token dans la base de données
        $token = $this->entityManager->getRepository(Token::class)->findOneBy(['value' => $token, 'isValid' => true], ['createdAt' => 'DESC'], ['expiresAt' => 'DESC']);
    
        // Vérifie si le token existe et est valide
        if (!$token) {
            return null;
        }
    
        // Vérifie si le token a expiré
        if ($token->getExpiresAt() < new \DateTime()) {
            $token->setIsValid(false);
            $this->entityManager->persist($token);
            $this->entityManager->flush();
            return null;
        }
    
        return $token;
    }

    public function getValidTokens(): array
    {
        // Fetch valid tokens from the database
        $tokens = $this->entityManager->getRepository(Token::class)->findBy(['isValid' => true]);
        return $tokens;
    }
}

?>