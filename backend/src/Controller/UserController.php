<?php

namespace App\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use Symfony\Component\Mime\Email;

use App\Security\EmailVerifier;
use App\Repository\UserRepository;
use App\Service\UserService;
use App\Entity\User;
use App\Dto\Payload\CreateUserPayload;
use App\Dto\Payload\UpdateUserPayload;

use App\Form\RegistrationFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserController extends AbstractController
{
    // Affichage de tous les utilisateurs
    #[Route('/users', name: 'user.index')]
    public function index(UserRepository $userRepository, SerializerInterface $serializer): Response
    {
        $users = $userRepository->findAll();

        $data = $serializer->serialize($users, 'json', [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            }
        ]);

        return new JsonResponse($data, 200, [], true);
    }

    // Affichage d'un utilisateur
    #[Route('/user/{id}', name: 'user.show')]
    public function show(UserRepository $userRepository, SerializerInterface $serializer, int $id): Response
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = $serializer->serialize($user, 'json', [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            }
        ]);

        return new JsonResponse($data, 200, [], true);
    }

    // Récupération du profil public d'un utilisateur
    #[Route('/user/profile/{id}', name: 'user.public.profile', methods: ['GET'])]
    public function publicProfile(UserRepository $userRepository, int $id): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $response = [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'isVerified' => $user->isVerified(),
            'bio' => $user->getBio(),
            'localization' => $user->getLocalization(),
            'isBanned' => $user->isBanned(),
        ];

        return $this->json($response);
    }

    // modification d'un utilisateur (TODO : uniquement pour les admins)
    #[Route('/updateuser/{id}', name: 'user.patch', methods: ['PATCH'])]
    public function patch(
        Request $request,
        UserRepository $userRepository,
        UserService $userService,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        int $id
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Récupération de l'utilisateur
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Création du payload
        $payload = new UpdateUserPayload();
        $payload->username = $data['username'] ?? null;
        $payload->email = $data['email'] ?? null;

        // Validation du payload
        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Mise à jour de l'utilisateur
        $user = $userService->update($user, $payload);

        // Sérialisation et retour de l'utilisateur mis à jour
        $responseData = $serializer->serialize($user, 'json', [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            }
        ]);

        return new JsonResponse($responseData, 200, [], true);
    }

    // Sign up d'un utilisateur
    #[Route('/signup', name: 'user.create', methods: ['POST'], format: 'json')]
    public function create(
        Request $request,
        UserService $userService,
        UserRepository $userRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher,
        EmailVerifier $emailVerifier,
        EntityManagerInterface $entityManager
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Validate input
        if (!isset($data['username'], $data['email'], $data['password'])) {
            return new JsonResponse(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email format'], Response::HTTP_BAD_REQUEST);
        }

        // Check if username or email already exists
        if ($userRepository->findOneBy(['username' => $data['username']])) {
            return new JsonResponse(['error' => 'Username already exists'], Response::HTTP_CONFLICT);
        }

        if ($userRepository->findOneBy(['email' => $data['email']])) {
            return new JsonResponse(['error' => 'Email already exists'], Response::HTTP_CONFLICT);
        }

        // Create user payload
        $payload = new CreateUserPayload();
        $payload->username = $data['username'];
        $payload->email = $data['email'];

        // Hash the password
        $payload->password = $data['password']; // Pass plain password, let service hash it

        $payload->roles = ['ROLE_USER'];

        // Validate payload
        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            // Create user
            $user = $userService->create($payload, $passwordHasher);

            // Persist the user to generate an ID
            $entityManager->persist($user);
            $entityManager->flush();

            // Send email verification
            $email = (new Email())
                ->from('no-reply@example.com')
                ->to($user->getEmail())
                ->subject('Please Confirm your Email Address');
            $emailVerifier->sendEmailConfirmation('user.verify_email', $user, $email);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'An error occurred during user creation: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $responseData = $serializer->serialize($user, 'json');

        return new JsonResponse([
            'message' => 'User created successfully. Please verify your email.',
            'user' => json_decode($responseData, true)
        ], Response::HTTP_CREATED);
    }

    // Banir un utilisateur
    #[Route('/ban/{id}', name: 'user.ban', methods: ['POST'])]
    public function ban(
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        int $id
    ): JsonResponse {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        if ($user->isBanned()) {
            return new JsonResponse(['message' => 'User is already banned'], Response::HTTP_BAD_REQUEST);
        }

        // Banni l'utilisateur
        $user->setIsBanned(true);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User banned successfully'], Response::HTTP_OK);
    }

    // Débannir un utilisateur
    #[Route('/unban/{id}', name: 'user.unban', methods: ['POST'])]
    public function unban(
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        int $id
    ): JsonResponse {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$user->isBanned()) {
            return new JsonResponse(['message' => 'User is not banned'], Response::HTTP_BAD_REQUEST);
        }

        // Débanni l'utilisateur
        $user->setIsBanned(false);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User unbanned successfully'], Response::HTTP_OK);
    }
}
