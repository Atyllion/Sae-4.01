<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use App\Service\UserService;
use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mailer\MailerInterface;
use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasher;

class SecurityController extends AbstractController
{

    private LoggerInterface $logger;
    private UserService $userService;

    public function __construct(LoggerInterface $logger, UserService $userService)
    {
        $this->logger = $logger;
        $this->userService = $userService;
    }

    // Connexion d'un utilisateur
    #[Route('/login', name: 'user.login', methods: ['POST'], format: 'json')]
    public function login(
        #[CurrentUser()] ?User $user,
        UserPasswordHasherInterface $passwordHasher,
        Request $request
    ): Response {
        if (!$user) {
            return new JsonResponse(['error' => 'user'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $plainPassword = $data['password'] ?? '';

        $this->logger->info('User email: ' . $user->getEmail());
        $this->logger->info('Password valid: ' . $passwordHasher->isPasswordValid($user, $plainPassword));

        // Vérifiez si le mot de passe est valide
        if (!$passwordHasher->isPasswordValid($user, $plainPassword)) {
            return new JsonResponse([
                'error' => 'Mot de passe ou email incorrect veuiller réessayer',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifiez si l'utilisateur est banni
        if ($user->isBanned()) {
            return new JsonResponse([
                'error' => 'Votre compte a été banni. Veuillez contacter un administrateur.',
                'banned' => true
            ], Response::HTTP_FORBIDDEN);
        }

        // Génère un token pour l'utilisateur
        $token = $this->userService->registerToken($user);

        return new JsonResponse([
            'token' => $token->getValue(),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
            ],
            'createdAt' => $token->getCreatedAt()->format('Y-m-d H:i:s'),
            'expiresAt' => $token->getExpiresAt()->format('Y-m-d H:i:s'),
        ], Response::HTTP_OK);
    }

    // Vérification de l'authentification par mail avec authentification anonyme
    #[Route('/verify-email', name: 'user.verify_email', methods: ['GET'])]
    public function verifyUserEmail(Request $request, EmailVerifier $emailVerifier, UserRepository $userRepository, EntityManagerInterface $entityManager): Response
    {
        // Récupérer l'ID de l'utilisateur depuis l'URL
        $userId = $request->query->get('id');

        // Vérifier que l'ID est présent
        if (null === $userId) {
            return new Response('Missing user ID', Response::HTTP_BAD_REQUEST);
        }

        // Rechercher l'utilisateur dans la base de données
        $user = $userRepository->find($userId);

        // Vérifier que l'utilisateur existe
        if (null === $user) {
            return new Response('User not found', Response::HTTP_NOT_FOUND);
        }

        try {
            // Valider le lien de confirmation d'email
            $emailVerifier->handleEmailConfirmation($request, $user);

            // Marquer l'utilisateur comme vérifié
            $user->setIsVerified(true);
            $entityManager->flush();

            $htmlContent = '
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Vérification réussie</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }
                        .container {
                            background: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                        h1 {
                            color: #2196F3; /* Blue color */
                        }
                        p {
                            margin: 10px 0;
                        }
                        a {
                            color: #2196F3; /* Blue color */
                            text-decoration: none;
                            font-weight: bold;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Vérification réussie</h1>
                        <p>Bonjour ' . htmlspecialchars($user->getUsername()) . ',</p>
                        <p>Votre email a été vérifié avec succès.</p>
                        <p>Vous pouvez maintenant fermer cette fenêtre</p>
                    </div>
                </body>
                </html>
            ';

            return new Response($htmlContent, Response::HTTP_OK, ['Content-Type' => 'text/html']);
        } catch (VerifyEmailExceptionInterface $e) {
            return new Response($e->getReason(), Response::HTTP_BAD_REQUEST);
        }
    }
}
