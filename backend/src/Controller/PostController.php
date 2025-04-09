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

use App\Entity\Post;
use App\Entity\User;
use App\Entity\PostMedia;
use Doctrine\ORM\EntityManagerInterface;

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

            $mediaData = [];
            foreach ($post->getMedia() as $media) {
                $mediaData[] = $media->getMediaPath();
            }

            $posts[] = [
                'id' => $post->getId(),
                'content' => $isBanned
                    ? "Ce compte a été bloqué pour non respect des conditions d'utilisation"
                    : ($post->isCensored()
                        ? "Ce message enfreint les conditions d'utilisation de la plateforme"
                        : $post->getContent()),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'isBanned' => $isBanned,
                ],
                'likesCount' => $isBanned || $post->isCensored() ? 0 : count($post->getLikes()),
                'repliesCount' => $isBanned || $post->isCensored() ? 0 : count($post->getReplies()),
                'media' => $isBanned || $post->isCensored() ? [] : $mediaData,
                'isCensored' => $post->isCensored()
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
                ? "Ce compte a été bloqué pour non respect des conditions d'utilisation"
                : ($post->isCensored()
                    ? "Ce message enfreint les conditions d'utilisation de la plateforme"
                    : $post->getContent()),
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'isBanned' => $isBanned,
            ],
            'likesCount' => $isBanned ? 0 : count($post->getLikes()),
            'repliesCount' => $isBanned ? 0 : count($post->getReplies()),
            'media' => $isBanned ? [] : array_map(function ($media) {
                return $media->getMediaPath();
            }, $post->getMedia()->toArray()),
            'isCensored' => $post->isCensored()
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

            $mediaData = [];
            foreach ($post->getMedia() as $media) {
                $mediaData[] = $media->getMediaPath();
            }

            $posts[] = [
                'id' => $post->getId(),
                'content' => $isUserBanned
                    ? ""
                    : ($post->isCensored()
                        ? "Ce message enfreint les conditions d'utilisation de la plateforme"
                        : $post->getContent()),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $post->getUser()->getId(),
                    'username' => $post->getUser()->getUsername(),
                    'isBanned' => $isUserBanned,
                ],
                // Ne pas inclure les likes si l'utilisateur est banni
                'likesCount' => $isUserBanned ? 0 : count($post->getLikes()),
                'repliesCount' => $isUserBanned ? 0 : count($post->getReplies()),
                'media' => $isUserBanned ? [] : $mediaData,
                'isCensored' => $post->isCensored()
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

    // Création d'un post (avec ou sans médias)
    #[Route('/posts_create', name: 'posts.create', methods: ['POST'])]
    public function create(
        Request $request,
        PostService $postService,
        ValidatorInterface $validator,
        LoggerInterface $logger,
        \Doctrine\ORM\EntityManagerInterface $entityManager
    ): Response {
        try { // Ajout d'un try-catch global pour capturer toutes les erreurs
            $user = $this->getUser();
            if (!$user || !$user instanceof \App\Entity\User) {
                return new JsonResponse(['error' => 'User not authenticated or invalid user type'], Response::HTTP_UNAUTHORIZED);
            }

            if ($user->isBanned()) {
                return new JsonResponse(['error' => 'Banned users cannot create posts'], Response::HTTP_FORBIDDEN);
            }

            // Vérifier si la requête contient du JSON ou du FormData
            $isJsonRequest = str_contains($request->headers->get('Content-Type', ''), 'application/json');

            // Récupérer le contenu du post
            $content = '';
            if ($isJsonRequest) {
                $data = json_decode($request->getContent(), true);
                $content = trim($data['content'] ?? '');
            } else {
                $content = trim($request->request->get('content', ''));
            }

            // Créer un nouveau post
            $post = new \App\Entity\Post();
            $post->setContent($content);
            $post->setCreatedAt(new \DateTime());
            $post->setUser($user);

            // MODIFICATION CRUCIALE: Persister le post AVANT de créer les médias
            $entityManager->persist($post);
            $entityManager->flush(); // Flush pour générer un ID pour le post

            $logger->info('Post created with ID: ' . $post->getId());

            // Traiter les fichiers médias s'il y en a
            $uploadedMediaPaths = [];
            $mediaFiles = $request->files->get('media');

            if ($mediaFiles) {
                $uploadDirectory = $this->getParameter('posts_media_directory');
                $logger->info('Upload directory: ' . $uploadDirectory);

                // Créer le répertoire s'il n'existe pas
                if (!is_dir($uploadDirectory)) {
                    mkdir($uploadDirectory, 0775, true);
                    $logger->info('Created upload directory');
                }

                foreach ($mediaFiles as $mediaFile) {
                    // Vérifier si le fichier est une image ou une vidéo avec une validation plus souple
                    $mimeType = $mediaFile->getMimeType();
                    $originalFilename = $mediaFile->getClientOriginalName();

                    $logger->info('Processing file: ' . $originalFilename . ' with type: ' . $mimeType);

                    // Validation plus souple des types MIME
                    $isValidImage = preg_match('/^image\/(jpe?g|png|gif|webp)/i', $mimeType);
                    $isValidVideo = preg_match('/^video\/(mp4|webm|ogg)/i', $mimeType);
                    $isValid = $isValidImage || $isValidVideo;

                    if (!$isValid) {
                        $extension = strtolower(pathinfo($originalFilename, PATHINFO_EXTENSION));
                        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg'])) {
                            $isValid = true;
                            $logger->info('Validated by extension: ' . $extension);
                        }
                    }

                    if (!$isValid) {
                        $logger->warning('Invalid mime type: ' . $mimeType);
                        continue;
                    }

                    // Générer un nom de fichier unique
                    $fileName = uniqid('post_media_') . '_' . $mediaFile->getClientOriginalName();

                    try {
                        // Déplacer le fichier téléchargé vers le répertoire de destination
                        $mediaFile->move($uploadDirectory, $fileName);
                        $uploadedMediaPaths[] = $fileName;
                        $logger->info('File uploaded: ' . $fileName);
                    } catch (\Exception $e) {
                        $logger->error('Error uploading file: ' . $e->getMessage());
                        return new JsonResponse(['error' => 'Failed to upload media file: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
                    }
                }

                // Associer les médias au post déjà persisté
                foreach ($uploadedMediaPaths as $mediaPath) {
                    $postMedia = new \App\Entity\PostMedia();
                    $postMedia->setPost($post); // Post déjà persisté avec un ID
                    $postMedia->setMediaPath($mediaPath);
                    $entityManager->persist($postMedia);
                    $logger->info('Media path: ' . $mediaPath . ' associated with post #' . $post->getId());
                }

                // Flush pour sauvegarder les médias
                $entityManager->flush();
            }

            // Valider le contenu du post uniquement si pas de médias
            if (empty($uploadedMediaPaths) && empty(trim($content))) {
                return new JsonResponse(['error' => 'Post content cannot be empty if no media is provided'], Response::HTTP_BAD_REQUEST);
            }

            // Préparer la réponse
            $mediaData = array_map(function ($path) {
                return $path;
            }, $uploadedMediaPaths);

            $response = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                ],
                'media' => $mediaData
            ];

            return new JsonResponse($response, Response::HTTP_CREATED);
        } catch (\Exception $e) {
            // Log l'erreur complète
            $logger->error('CRITICAL ERROR: ' . $e->getMessage());
            $logger->error('Stack trace: ' . $e->getTraceAsString());

            // Retourner une réponse d'erreur détaillée
            return new JsonResponse([
                'error' => 'Failed to create post: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Modification d'un post
    #[Route('/post/{id}/update', name: 'post.update', methods: ['POST'])]
    public function update(
        int $id,
        Request $request,
        PostRepository $postRepository,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            // Récupérer l'utilisateur connecté
            $currentUser = $this->getUser();
            if (!$currentUser || !$currentUser instanceof User) {
                return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Récupérer le post
            $post = $postRepository->find($id);
            if (!$post) {
                return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur est le propriétaire du post
            if ($post->getUser()->getId() !== $currentUser->getId()) {
                return new JsonResponse(['error' => 'You are not authorized to update this post'], Response::HTTP_FORBIDDEN);
            }

            $logger->info('Starting post update with POST method for post ID: ' . $id);

            // 1. D'abord supprimer les médias à supprimer
            $mediaToDelete = $request->request->all('mediaToDelete') ?: [];
            $logger->info('Media to delete: ' . json_encode($mediaToDelete));

            $uploadDirectory = $this->getParameter('posts_media_directory');
            $mediaDeleted = [];

            if (!empty($mediaToDelete)) {
                $mediaCollection = $post->getMedia()->toArray(); // Convertir en tableau pour éviter les problèmes d'itération

                foreach ($mediaToDelete as $mediaPath) {
                    foreach ($mediaCollection as $media) {
                        $path = $media->getMediaPath();
                        if ($path === $mediaPath || basename($path) === basename($mediaPath)) {
                            // Supprimer le fichier physique
                            $filePath = $uploadDirectory . '/' . $path;
                            if (file_exists($filePath)) {
                                unlink($filePath);
                                $logger->info('Deleted physical file: ' . $filePath);
                            }

                            // Dissocier et supprimer l'entité
                            $post->removeMedia($media);
                            $entityManager->remove($media);
                            $mediaDeleted[] = $path;
                            $logger->info('Removed media entity: ' . $path);
                            break;
                        }
                    }
                }

                // Effectuer le flush pour les suppressions avant d'ajouter les nouveaux médias
                $entityManager->flush();
                $logger->info('Media deletion flush completed, deleted: ' . implode(', ', $mediaDeleted));
            }

            // 2. Mettre à jour le contenu
            $content = trim($request->request->get('content', ''));
            $post->setContent($content);
            $entityManager->flush();
            $logger->info('Content updated: ' . $content);

            // 3. Ajouter les nouveaux médias
            $mediaFiles = $request->files->get('media');
            $newMediaPaths = [];

            if ($mediaFiles && count($mediaFiles) > 0) {
                if (!is_dir($uploadDirectory)) {
                    mkdir($uploadDirectory, 0775, true);
                    $logger->info('Created upload directory: ' . $uploadDirectory);
                }

                foreach ($mediaFiles as $mediaFile) {
                    // Validation du type de fichier
                    $mimeType = $mediaFile->getMimeType();
                    $isValidImage = preg_match('/^image\/(jpe?g|png|gif|webp)/i', $mimeType);
                    $isValidVideo = preg_match('/^video\/(mp4|webm|ogg)/i', $mimeType);
                    $isValid = $isValidImage || $isValidVideo;

                    if (!$isValid) {
                        $extension = strtolower(pathinfo($mediaFile->getClientOriginalName(), PATHINFO_EXTENSION));
                        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg'])) {
                            $isValid = true;
                        }
                    }

                    if ($isValid) {
                        // Générer un nom unique avec timestamp pour éviter les problèmes de cache
                        $fileName = uniqid('post_media_' . time() . '_') . '_' . $mediaFile->getClientOriginalName();
                        $mediaFile->move($uploadDirectory, $fileName);

                        // Créer et associer l'entité PostMedia
                        $postMedia = new PostMedia();
                        $postMedia->setPost($post);
                        $postMedia->setMediaPath($fileName);
                        $entityManager->persist($postMedia);
                        $newMediaPaths[] = $fileName;
                        $logger->info('Added new media: ' . $fileName);
                    }
                }

                // Flush pour les nouveaux médias
                $entityManager->flush();
                $logger->info('New media flush completed, added: ' . implode(', ', $newMediaPaths));
            }

            // 4. Récupérer le post mis à jour depuis la base de données
            $entityManager->clear(); // Vider l'unité de travail pour forcer un rechargement frais
            $post = $postRepository->find($id);

            if (!$post) {
                throw new \Exception("Post couldn't be retrieved after update");
            }

            // 5. Préparer la réponse
            $updatedMediaPaths = [];
            foreach ($post->getMedia() as $media) {
                $updatedMediaPaths[] = $media->getMediaPath();
            }

            $response = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $currentUser->getId(),
                    'username' => $currentUser->getUsername(),
                ],
                'media' => $updatedMediaPaths
            ];

            $logger->info('Update successful. Final media count: ' . count($updatedMediaPaths));

            return $this->json($response);
        } catch (\Exception $e) {
            $logger->error('Error updating post: ' . $e->getMessage());
            $logger->error('Stack trace: ' . $e->getTraceAsString());
            return new JsonResponse(['error' => 'Failed to update post: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Censure d'un post
    #[Route('/post/{id}/censor', name: 'post.censor', methods: ['POST'])]
    public function censorPost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User || !in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'Unauthorized access'], Response::HTTP_FORBIDDEN);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Toggle censored status
        $post->setCensored(!$post->isCensored());
        $entityManager->flush();

        return $this->json([
            'id' => $post->getId(),
            'isCensored' => $post->isCensored()
        ]);
    }
}
