<?php

namespace App\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use App\Repository\UserRepository;
use App\Repository\PostRepository;
use App\Service\PostService;
use App\Dto\Payload\CreatePostPayload;
use Psr\Log\LoggerInterface;

class PostController extends AbstractController
{
    // No additional code is needed at $PLACEHOLDER$ for this functionality.
    // To access other pages, you can use the `/posts` endpoint with query parameters `page` and `count`.
    // Example:
    // - `/posts?page=2&count=5` to get the second page with 5 posts per page.
    // - `/posts?page=3&count=10` to get the third page with 10 posts per page.


    // Récupération de tous les posts
    #[Route('/posts', name: 'posts.get', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): JsonResponse
    {
        $count = $request->query->getInt('count', 5);
        $page = $request->query->getInt('page', 1);

        $paginator = $postRepository->paginateAllOrderedByLatest($page, $count);
        $totalPostsCount = $paginator->count();
        $previousPage = $page > 1 ? $page - 1 : null;
        $nextPage = ($page * $count) < $totalPostsCount ? $page + 1 : null;

        $posts = [];
        foreach ($paginator as $post) {
            $user = $post->getUser();
            $isBanned = $user->isBanned();

            $posts[] = [
                'id' => $post->getId(),
                'content' => $isBanned
                    ? "Ce compte a été bloqué pour non respect des conditions d'utilisation"
                    : $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'isBanned' => $isBanned, // Ajout de l'information de bannissement
                ],
                // Ne pas inclure les likes si l'utilisateur est banni
                'likesCount' => $isBanned ? 0 : count($post->getLikes()),
            ];
        }

        return $this->json([
            'posts' => $posts,
            'total' => $totalPostsCount,
            'current_page' => $page,
            'per_page' => $count,
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
        ]);
    }

    // Récupération d'un post
    #[Route('/post/{id}', name: 'post.show', methods: ['GET'])]
    public function show(int $id, PostRepository $postRepository): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $post->getUser();
        $isBanned = $user->isBanned();

        $response = [
            'id' => $post->getId(),
            'content' => $isBanned
                ? ""
                : $post->getContent(),
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'isBanned' => $isBanned, // Ajout de l'information de bannissement
            ],
            // Ne pas inclure les likes si l'utilisateur est banni
            'likesCount' => $isBanned ? 0 : count($post->getLikes()),
        ];

        return $this->json($response);
    }

    // Suppression d'un post
    #[Route('/post/{id}', name: 'post.delete', methods: ['DELETE'])]
    public function delete(int $id, PostRepository $postRepository, \Doctrine\ORM\EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    // Récupération des posts d'un utilisateur
    #[Route('/posts/user/{userId}', name: 'posts.user', methods: ['GET'])]
    public function userPosts(Request $request, int $userId, PostRepository $postRepository, UserRepository $userRepository): JsonResponse
    {
        $count = $request->query->getInt('count', 5);
        $page = $request->query->getInt('page', 1);

        // Récupérer l'utilisateur pour vérifier s'il est banni
        $userObject = $userRepository->find($userId);
        $isUserBanned = $userObject ? $userObject->isBanned() : false;

        $paginator = $postRepository->paginateByUserOrderedByLatest($userId, $page, $count);
        $totalPostsCount = $paginator->count();
        $previousPage = $page > 1 ? $page - 1 : null;
        $nextPage = ($page * $count) < $totalPostsCount ? $page + 1 : null;

        $posts = [];
        foreach ($paginator as $post) {
            $posts[] = [
                'id' => $post->getId(),
                'content' => $isUserBanned 
                    ? ""
                    : $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $post->getUser()->getId(),
                    'username' => $post->getUser()->getUsername(),
                    'isBanned' => $isUserBanned,
                ],
                // Ne pas inclure les likes si l'utilisateur est banni
                'likesCount' => $isUserBanned ? 0 : count($post->getLikes()),
            ];
        }

        return $this->json([
            'posts' => $posts,
            'total' => $totalPostsCount,
            'current_page' => $page,
            'per_page' => $count,
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
        ]);
    }

    // Création d'un post
    #[Route('/posts', name: 'posts.create', methods: ['POST'], format: 'json')]
    public function create(
        Request $request,
        PostService $postService,
        ValidatorInterface $validator,
        LoggerInterface $logger
    ): Response {
        $data = json_decode($request->getContent(), true);

        $payload = new CreatePostPayload();
        $payload->content = trim($data['content'] ?? '');

        // Ensure the user is set in the payload
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'User not authenticated or invalid user type'], Response::HTTP_UNAUTHORIZED);
        }
        $payload->user = $user;

        $logger->info('Contenu reçu : ' . $payload->content);
        $logger->info('Longueur du contenu : ' . strlen($payload->content));

        $errors = $validator->validate($payload, null, ['Default']);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $post = $postService->create($payload, $user);
        $response = [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
            ],
        ];

        return new JsonResponse($response, Response::HTTP_CREATED);
    }
}
