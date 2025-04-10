<?php

namespace App\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

use App\Entity\Reply;
use App\Entity\ReplyLike;
use App\Entity\User;
use App\Entity\Post;
use App\Entity\UserBlock;
use App\Repository\PostRepository;
use App\Repository\ReplyRepository;
use App\Repository\ReplyLikeRepository;
use App\Repository\UserBlockRepository;

class ReplyController extends AbstractController
{
    // Récupérer les réponses d'un post
    #[Route('/posts/{id}/replies', name: 'reply.index', methods: ['GET'])]
    public function index(
        Request $request,
        PostRepository $postRepository,
        ReplyRepository $replyRepository,
        UserBlockRepository $blockRepository,
        int $id
    ): JsonResponse {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Récupérer l'auteur du post
        $postAuthor = $post->getUser();

        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);

        $paginator = $replyRepository->paginateByPost($post, $page, $limit);
        $totalReplies = $paginator->count();

        // Liste pour stocker les réponses filtrées
        $filteredReplies = [];
        $hiddenRepliesCount = 0;

        foreach ($paginator as $reply) {
            $replyUser = $reply->getUser();
            $isBanned = $replyUser->isBanned();

            // Vérifier si l'auteur de la réponse est bloqué par l'auteur du post
            $isBlocked = $blockRepository->findBlock($postAuthor, $replyUser) !== null;

            // Ne pas inclure les réponses des utilisateurs bloqués
            if ($isBlocked) {
                $hiddenRepliesCount++;
                continue;
            }

            $filteredReplies[] = [
                'id' => $reply->getId(),
                'content' => $isBanned
                    ? "Ce compte a été bloqué pour non respect des conditions d'utilisation"
                    : $reply->getContent(),
                'created_at' => $reply->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $replyUser->getId(),
                    'username' => $replyUser->getUsername(),
                    'isBanned' => $isBanned,
                    'profilePicturePath' => $replyUser->getProfilePicturePath(),
                ],
                'likesCount' => $isBanned ? 0 : count($reply->getLikes()),
            ];
        }

        $adjustedTotal = $totalReplies - $hiddenRepliesCount;

        return $this->json([
            'replies' => $filteredReplies,
            'total' => $adjustedTotal,
            'current_page' => $page,
            'per_page' => $limit,
            'has_more' => ($page * $limit) < $adjustedTotal,
        ]);
    }

    // récupérer le nombre de réponses d'un post (en excluant celles des utilisateurs bloqués)
    #[Route('/posts/{id}/replies/count', name: 'reply.count', methods: ['GET'])]
    public function count(
        PostRepository $postRepository,
        ReplyRepository $replyRepository,
        UserBlockRepository $blockRepository,
        int $id
    ): JsonResponse {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $postAuthor = $post->getUser();

        // Récupérer toutes les réponses du post
        $replies = $replyRepository->findBy(['post' => $post]);
        $visibleRepliesCount = 0;

        foreach ($replies as $reply) {
            $replyUser = $reply->getUser();
            $isBlocked = $blockRepository->findBlock($postAuthor, $replyUser) !== null;

            if (!$isBlocked) {
                $visibleRepliesCount++;
            }
        }

        return $this->json([
            'repliesCount' => $visibleRepliesCount,
        ]);
    }

    // Ajouter une réponse à un post
    #[Route('/posts/{id}/reply', name: 'reply.create', methods: ['POST'])]
    public function create(
        Request $request,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        UserBlockRepository $blockRepository,
        int $id
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->isBanned()) {
            return new JsonResponse(['error' => 'Banned users cannot reply to posts'], Response::HTTP_FORBIDDEN);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $content = trim($data['content'] ?? '');

        if (empty($content)) {
            return new JsonResponse(['error' => 'Content cannot be empty'], Response::HTTP_BAD_REQUEST);
        }

        $postAuthor = $post->getUser();

        if ($blockRepository->isUserBlocked($user, $postAuthor)) {
            return new JsonResponse(['error' => 'You cannot reply to this post because you have been blocked by the author'], Response::HTTP_FORBIDDEN);
        }

        if ($blockRepository->isUserBlocked($user, $postAuthor)) {
            return new JsonResponse(['error' => 'You cannot reply to this post because you have been blocked by the author'], Response::HTTP_FORBIDDEN);
        }

        if (strlen($content) > 280) {
            return new JsonResponse(['error' => 'Content cannot exceed 280 characters'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $reply = new Reply();
            $reply->setContent($content);
            $reply->setUser($user);
            $reply->setPost($post);
            $reply->setCreatedAt(new \DateTime());

            $entityManager->persist($reply);
            $entityManager->flush();

            return $this->json([
                'id' => $reply->getId(),
                'content' => $reply->getContent(),
                'created_at' => $reply->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'profilePicturePath' => $user->getProfilePicturePath(),
                ],
                'likesCount' => 0,
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            $logger->error('Error creating reply: ' . $e->getMessage());
            return new JsonResponse(['error' => 'An error occurred while creating the reply'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Supprimer une réponse
    #[Route('/replies/{id}', name: 'reply.delete', methods: ['DELETE'])]
    public function delete(
        ReplyRepository $replyRepository,
        EntityManagerInterface $entityManager,
        int $id
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $reply = $replyRepository->find($id);
        if (!$reply) {
            return new JsonResponse(['error' => 'Reply not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est l'auteur de la réponse ou un admin
        if ($reply->getUser()->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'You are not authorized to delete this reply'], Response::HTTP_FORBIDDEN);
        }

        $entityManager->remove($reply);
        $entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    // Liker/Unliker une réponse
    #[Route('/replies/{id}/like', name: 'reply.like', methods: ['POST'])]
    public function like(
        ReplyRepository $replyRepository,
        ReplyLikeRepository $replyLikeRepository,
        EntityManagerInterface $entityManager,
        UserBlockRepository $blockRepository,
        int $id
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $reply = $replyRepository->find($id);
        if (!$reply) {
            return new JsonResponse(['error' => 'Reply not found'], Response::HTTP_NOT_FOUND);
        }

        // Récupérer le post parent de la réponse
        $post = $reply->getPost();

        // Vérifie si l'utilisateur a été bloqué par l'auteur du post
        $postAuthor = $post->getUser();
        if ($blockRepository->isUserBlocked($user, $postAuthor)) {
            return new JsonResponse(['error' => 'You cannot like this reply because you have been blocked by the author'], Response::HTTP_FORBIDDEN);
        }

        if ($user->isBanned()) {
            return new JsonResponse(['error' => 'Banned users cannot like replies'], Response::HTTP_FORBIDDEN);
        }

        $like = $replyLikeRepository->findOneByUserAndReply($user, $reply);

        // Si déjà liké, on retire le like
        if ($like) {
            $entityManager->remove($like);
            $liked = false;
        } else {
            // Sinon on ajoute un like
            $like = new ReplyLike();
            $like->setUser($user);
            $like->setReply($reply);
            $entityManager->persist($like);
            $liked = true;
        }

        $entityManager->flush();

        return $this->json([
            'liked' => $liked,
            'likesCount' => count($reply->getLikes()),
        ]);
    }

    // Vérifier si l'utilisateur a liké une réponse
    #[Route('/replies/{id}/likes', name: 'reply.get_likes', methods: ['GET'])]
    public function getLikes(
        ReplyRepository $replyRepository,
        ReplyLikeRepository $replyLikeRepository,
        int $id
    ): JsonResponse {
        $reply = $replyRepository->find($id);
        if (!$reply) {
            return new JsonResponse(['error' => 'Reply not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        $liked = false;

        if ($user instanceof User) {
            $like = $replyLikeRepository->findOneByUserAndReply($user, $reply);
            $liked = $like !== null;
        }

        return $this->json([
            'liked' => $liked,
            'likesCount' => count($reply->getLikes()),
        ]);
    }
}
