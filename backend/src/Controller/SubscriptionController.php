<?php
// src/Controller/SubscriptionController.php
namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\User;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class SubscriptionController extends AbstractController
{
    #[Route('/api/users/{id}/follow', name: 'user.follow', methods: ['POST'])]
    public function follow(
        int $id,
        UserRepository $userRepository,
        SubscriptionRepository $subscriptionRepository,
        EntityManagerInterface $entityManager,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        // Vérifier l'authentification
        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Trouver l'utilisateur à suivre
        $userToFollow = $userRepository->find($id);
        if (!$userToFollow) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Empêcher de se suivre soi-même
        if ($currentUser->getId() === $userToFollow->getId()) {
            return new JsonResponse(['error' => 'Cannot follow yourself'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'abonnement existe déjà
        $existingSubscription = $subscriptionRepository->findOneByFollowerAndFollowing($currentUser, $userToFollow);

        if ($existingSubscription) {
            return new JsonResponse(['error' => 'Already following this user'], Response::HTTP_CONFLICT);
        }

        // Créer le nouvel abonnement
        $subscription = new Subscription();
        $subscription->setFollower($currentUser);
        $subscription->setFollowing($userToFollow);

        $entityManager->persist($subscription);
        $entityManager->flush();

        // Récupérer les compteurs mis à jour
        $followersCount = $subscriptionRepository->countFollowersByUser($userToFollow);
        $followingCount = $subscriptionRepository->countFollowingByUser($userToFollow);

        return new JsonResponse([
            'message' => 'Followed successfully',
            'isFollowing' => true,
            'followersCount' => $followersCount,
            'followingCount' => $followingCount,
        ]);
    }

    #[Route('/api/users/{id}/unfollow', name: 'user.unfollow', methods: ['POST'])]
    public function unfollow(
        int $id,
        UserRepository $userRepository,
        SubscriptionRepository $subscriptionRepository,
        EntityManagerInterface $entityManager,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        // Vérifier l'authentification
        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Trouver l'utilisateur à ne plus suivre
        $userToUnfollow = $userRepository->find($id);
        if (!$userToUnfollow) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Trouver l'abonnement existant
        $subscription = $subscriptionRepository->findOneByFollowerAndFollowing($currentUser, $userToUnfollow);

        if (!$subscription) {
            return new JsonResponse(['error' => 'Not following this user'], Response::HTTP_BAD_REQUEST);
        }

        // Supprimer l'abonnement
        $entityManager->remove($subscription);
        $entityManager->flush();

        // Récupérer les compteurs mis à jour
        $followersCount = $subscriptionRepository->countFollowersByUser($userToUnfollow);
        $followingCount = $subscriptionRepository->countFollowingByUser($userToUnfollow);

        return new JsonResponse([
            'message' => 'Unfollowed successfully',
            'isFollowing' => false,
            'followersCount' => $followersCount,
            'followingCount' => $followingCount,
        ]);
    }

    #[Route('/api/users/{id}/is-following', name: 'user.is_following', methods: ['GET'])]
    public function isFollowing(
        int $id,
        UserRepository $userRepository,
        SubscriptionRepository $subscriptionRepository,
        #[CurrentUser] ?User $currentUser
    ): JsonResponse {
        if (!$currentUser) {
            return new JsonResponse(['isFollowing' => false]);
        }

        $userToCheck = $userRepository->find($id);
        if (!$userToCheck) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $subscription = $subscriptionRepository->findOneByFollowerAndFollowing($currentUser, $userToCheck);
        $followersCount = $subscriptionRepository->countFollowersByUser($userToCheck);
        $followingCount = $subscriptionRepository->countFollowingByUser($userToCheck);

        return new JsonResponse([
            'isFollowing' => $subscription !== null,
            'followersCount' => $followersCount,
            'followingCount' => $followingCount,
        ]);
    }
}
