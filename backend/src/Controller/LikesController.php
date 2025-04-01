<?php

namespace App\Controller;

use App\Entity\Likes;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\LikesRepository;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class LikesController extends AbstractController
{
    // Route pour liker ou disliker un post
    #[Route('/api/posts/{id}/like', name: 'post.like', methods: ['POST'])]
    public function toggleLike(
        Post $post,
        #[CurrentUser] User $user,
        EntityManagerInterface $entityManager,
        LikesRepository $likesRepository
    ): JsonResponse {
        // Vérifier si l'utilisateur a déjà liké le post
        $existingLike = $likesRepository->findOneByUserAndPost($user, $post);
        
        if ($existingLike) {
            // Si le like existe, on le supprime
            $entityManager->remove($existingLike);
            $entityManager->flush(); // Effectue la suppression
            
            // Récupère le nombre ACTUEL de likes après la suppression
            $updatedLikesCount = $likesRepository->getPostLikesCount($post);
            
            return $this->json([
                'liked' => false,
                'likesCount' => $updatedLikesCount, // Compteur à jour
                'message' => 'Post unliked successfully'
            ]);
        } else {
            // Si pas de like, on en crée un nouveau
            $like = new Likes();
            $like->setUser($user);
            $like->setPost($post);
            
            $entityManager->persist($like);
            $entityManager->flush();
            
            return $this->json([
                'liked' => true,
                'likesCount' => $post->getLikesCount(),
                'message' => 'Post liked successfully'
            ]);
        }
    }
    
    // Route pour obtenir le nombre de likes d'un post
    // et savoir si l'utilisateur a liké le post
    #[Route('/api/posts/{id}/likes', name: 'post.likes', methods: ['GET'])]
    public function getLikes(
        Post $post,
        #[CurrentUser] ?User $user,
        LikesRepository $likesRepository
    ): JsonResponse {
        $liked = false;
        if ($user) {
            $liked = $likesRepository->hasUserLikedPost($user, $post);
        }
        
        return $this->json([
            'likesCount' => $post->getLikesCount(),
            'liked' => $liked
        ]);
    }
}