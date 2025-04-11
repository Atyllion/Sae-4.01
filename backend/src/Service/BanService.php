<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;

class BanService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Vérifie si un utilisateur est banni
     */
    public function isUserBanned(User $user): bool
    {
        return $user->isBanned();
    }

    /**
     * Vérifie si l'utilisateur peut effectuer une action
     * Retourne une réponse d'erreur si l'utilisateur est banni, null sinon
     */
    public function checkUserCanPerformAction(User $user): ?JsonResponse
    {
        if ($this->isUserBanned($user)) {
            return new JsonResponse([
                'error' => 'Vous ne pouvez pas effectuer cette action car votre compte a été banni.',
                'banned' => true
            ], Response::HTTP_FORBIDDEN);
        }
        
        return null; // Aucune erreur, l'utilisateur peut effectuer l'action
    }
}