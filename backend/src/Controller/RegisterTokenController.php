<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegisterTokenController extends AbstractController
{
    #[Route('/register_token', name: 'token.register', methods: ['POST'], format: 'json')]
    public function registerToken(Request $request, UserService $userService, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
    
        if (!isset($data['email'], $data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required'], Response::HTTP_BAD_REQUEST);
        }
    
        try {
            // Vérifie si l'utilisateur existe déjà avec l'email fourni
            $existingUser = $userService->findUserByEmail($data['email']);
            if ($existingUser) {
            return new JsonResponse(['error' => 'User with this email already exists'], Response::HTTP_CONFLICT);
            }

            // Crée un nouvel utilisateur
            $user = new User();
            $user->setEmail($data['email']);
            $user->setPassword($passwordHasher->hashPassword($user, $data['password']));

            // Sauvegarde l'utilisateur
            $userService->saveUser($user);

            // Génère un token pour le nouvel utilisateur
            $token = $userService->registerToken($user);

            return new JsonResponse([
            'token' => $token->getValue(),
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ],
            'createdAt' => $token->getCreatedAt()->format('Y-m-d H:i:s'),
            'expiresAt' => $token->getExpiresAt()->format('Y-m-d H:i:s'),
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/get_token', name: 'token.verify', methods: ['GET'], format: 'json')]
    public function verifyToken(Request $request, UserService $userService): JsonResponse
    {
        $tokenValue = str_replace('Bearer ', '', $request->headers->get('Authorization'));

        if (!$tokenValue) {
            return new JsonResponse(['error' => 'Token is required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Récupère le token valide depuis le UserService
            $token = $userService->getToken($tokenValue);

            if (!$token) {
                return new JsonResponse(['error' => 'Invalid or expired token'], Response::HTTP_UNAUTHORIZED);
            }

            return new JsonResponse([
                'token' => $token->getValue(),
                'user' => [
                    'id' => $token->getUser()->getId(),
                    'email' => $token->getUser()->getEmail(),
                    'roles' => $token->getUser()->getRoles(),
                    'username' => $token->getUser()->getUsername(),
                    'isVerified' => $token->getUser()->IsVerified(),
                    'localization' => $token->getUser()->getLocalization(),
                    'bio' => $token->getUser()->getBio(),
                    'isBanned' => $token->getUser()->isBanned(),
                    'profilePicturePath' => $token->getUser()->getProfilePicturePath(),
                    'bannerPicturePath' => $token->getUser()->getBannerPicturePath(),
                ],
                'createdAt' => $token->getCreatedAt()->format('Y-m-d H:i:s'),
                'expiresAt' => $token->getExpiresAt()->format('Y-m-d H:i:s'),
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    #[Route('/get_tokens', name: 'tokens.get', methods: ['GET'], format: 'json')]
    public function getTokens(Request $request, UserService $userService): JsonResponse
    {
        try {
            // Récupère tous les tokens valides
            $tokens = $userService->getValidTokens();

            $response = [];
            foreach ($tokens as $token) {
                $response[] = [
                    'token' => $token->getValue(),
                    'user' => [
                        'id' => $token->getUser()->getId(),
                        'username' => $token->getUser()->getUsername(),
                        'email' => $token->getUser()->getEmail(),
                    ],
                    'createdAt' => $token->getCreatedAt()->format('Y-m-d H:i:s'),
                    'expiresAt' => $token->getExpiresAt()->format('Y-m-d H:i:s'),
                ];
            }

            return new JsonResponse($response, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

?>