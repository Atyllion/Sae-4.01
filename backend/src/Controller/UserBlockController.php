<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserBlock;
use App\Repository\UserRepository;
use App\Repository\UserBlockRepository;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class UserBlockController extends AbstractController
{
    #[Route('/users/{id}/block', name: 'user.block', methods: ['POST'])]
    public function block(
        int $id,
        UserRepository $userRepository,
        UserBlockRepository $blockRepository,
        SubscriptionRepository $subscriptionRepository,
        EntityManagerInterface $entityManager,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // L'utilisateur ne peut pas se bloquer lui-même
        if ($currentUser->getId() === $id) {
            return new JsonResponse(['error' => 'Cannot block yourself'], Response::HTTP_BAD_REQUEST);
        }

        $userToBlock = $userRepository->find($id);
        if (!$userToBlock) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si l'utilisateur est déjà bloqué
        $existingBlock = $blockRepository->findBlock($currentUser, $userToBlock);
        if ($existingBlock) {
            return new JsonResponse(['error' => 'User already blocked'], Response::HTTP_CONFLICT);
        }

        // Créer le blocage
        $block = new UserBlock();
        $block->setBlocker($currentUser);
        $block->setBlocked($userToBlock);
        
        $entityManager->persist($block);

        // Supprimer les abonnements dans les deux sens
        $subscriptions = $subscriptionRepository->findBy([
            'follower' => $userToBlock,
            'following' => $currentUser
        ]);
        
        foreach ($subscriptions as $subscription) {
            $entityManager->remove($subscription);
        }

        $entityManager->flush();

        return new JsonResponse([
            'message' => 'User blocked successfully',
            'isBlocked' => true
        ]);
    }

    #[Route('/users/{id}/unblock', name: 'user.unblock', methods: ['POST'])]
    public function unblock(
        int $id,
        UserRepository $userRepository,
        UserBlockRepository $blockRepository,
        EntityManagerInterface $entityManager,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $userToUnblock = $userRepository->find($id);
        if (!$userToUnblock) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Trouver le blocage existant
        $block = $blockRepository->findBlock($currentUser, $userToUnblock);
        if (!$block) {
            return new JsonResponse(['error' => 'User not blocked'], Response::HTTP_BAD_REQUEST);
        }

        // Supprimer le blocage
        $entityManager->remove($block);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'User unblocked successfully',
            'isBlocked' => false
        ]);
    }

    #[Route('/users/{id}/is-blocked', name: 'user.is_blocked', methods: ['GET'])]
    public function isBlocked(
        int $id,
        UserRepository $userRepository,
        UserBlockRepository $blockRepository,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        if (!$currentUser) {
            return new JsonResponse(['isBlocked' => false]);
        }

        $user = $userRepository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $block = $blockRepository->findBlock($currentUser, $user);
        
        return new JsonResponse([
            'isBlocked' => $block !== null,
        ]);
    }
    
    #[Route('/users/blockedlist', name: 'user.blocked_list', methods: ['GET'])]
    public function getBlockedUsers(
        UserBlockRepository $blockRepository,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $blockedUsers = $blockRepository->getBlockedUsers($currentUser);
        $response = [];
        
        foreach ($blockedUsers as $user) {
            $response[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'profilePicturePath' => $user->getProfilePicturePath(),
            ];
        }

        return new JsonResponse($response);
    }
}