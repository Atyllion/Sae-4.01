<?php

namespace App\Controller;

use App\Entity\Likes;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\LikesRepository;
use App\Repository\PostRepository;
use App\Repository\UserBlockRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class LikesController extends AbstractController
{
    // Route pour liker ou disliker un post
    #[Route('/posts/{id}/like', name: 'post.like', methods: ['POST'])]
    public function toggleLike(
        Post $post,
        #[CurrentUser] User $user,
        EntityManagerInterface $entityManager,
        LikesRepository $likesRepository,
        PostRepository $postRepository,
        UserBlockRepository $blockRepository
    ): JsonResponse {
        // Vérifie si le post appartient à un utilisateur banni
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifie si l'utilisateur a été bloqué par l'auteur du post
        $postAuthor = $post->getUser();
        if ($blockRepository->isUserBlocked($user, $postAuthor)) {
            return new JsonResponse(['error' => 'You cannot like this post because you have been blocked by the author'], Response::HTTP_FORBIDDEN);
        }

        if ($post->getUser()->isBanned()) {
            return new JsonResponse([
                'error' => 'You cannot interact with content from a banned user',
                'postBanned' => true
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur a déjà liké le post
        $existingLike = $likesRepository->findOneByUserAndPost($user, $post);

        if ($existingLike) {
            // Si le like existe, on le supprime
            $entityManager->remove($existingLike);
            $entityManager->flush(); // Effectue la suppression

            // Récupère le nombre de likes après la suppression, en excluant les utilisateurs bloqués
            $updatedLikesCount = $this->getFilteredLikesCount($post, $blockRepository);

            return $this->json([
                'liked' => false,
                'likesCount' => $updatedLikesCount,
                'message' => 'Post unliked successfully'
            ]);
        } else {
            // Si pas de like, on en crée un nouveau
            $like = new Likes();
            $like->setUser($user);
            $like->setPost($post);

            $entityManager->persist($like);
            $entityManager->flush();

            // Récupère le nombre de likes après l'ajout, en excluant les utilisateurs bloqués
            $updatedLikesCount = $this->getFilteredLikesCount($post, $blockRepository);

            return $this->json([
                'liked' => true,
                'likesCount' => $updatedLikesCount,
                'message' => 'Post liked successfully'
            ]);
        }
    }

    // Route pour obtenir le nombre de likes d'un post
    #[Route('/posts/{id}/likes', name: 'post.likes', methods: ['GET'])]
    public function getLikes(
        Post $post,
        #[CurrentUser] ?User $user,
        LikesRepository $likesRepository,
        UserBlockRepository $blockRepository
    ): JsonResponse {
        $liked = false;
        if ($user) {
            $liked = $likesRepository->hasUserLikedPost($user, $post);
        }

        // Récupère le nombre de likes en excluant les utilisateurs bloqués
        $filteredLikesCount = $this->getFilteredLikesCount($post, $blockRepository);

        return $this->json([
            'likesCount' => $filteredLikesCount,
            'liked' => $liked
        ]);
    }

    // Compter les likes en excluant ceux des utilisateurs bloqués
    private function getFilteredLikesCount(Post $post, UserBlockRepository $blockRepository): int 
    {
        $postAuthor = $post->getUser();
        $allLikes = $post->getLikes();
        $filteredCount = 0;

        foreach ($allLikes as $like) {
            $likeUser = $like->getUser();
            // Vérifier si l'auteur du like est bloqué par l'auteur du post
            $isBlocked = $blockRepository->findBlock($postAuthor, $likeUser) !== null;
            
            if (!$isBlocked) {
                $filteredCount++;
            }
        }

        return $filteredCount;
    }
}
