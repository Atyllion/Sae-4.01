<?php
namespace App\Security;

use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Token\PostAuthenticationToken;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Service\UserService;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use \Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    private UserService $userService;

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        $tokenEntity = $this->userService->getToken($accessToken);

        if (!$tokenEntity) {
            throw new \Symfony\Component\Security\Core\Exception\AuthenticationException('Invalid or expired token');
        }

        $user = $tokenEntity->getUser();

        return new UserBadge($user->getEmail());
    }

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request): SelfValidatingPassport
    {
        $authorizationHeader = $request->headers->get('Authorization');

        if (!$authorizationHeader || !str_starts_with($authorizationHeader, 'Bearer ')) {
            throw new \Symfony\Component\Security\Core\Exception\AuthenticationException('No Bearer token found');
        }

        $token = substr($authorizationHeader, 7);

        $tokenEntity = $this->userService->getToken($token);

        if (!$tokenEntity) {
            throw new \Symfony\Component\Security\Core\Exception\AuthenticationException('Invalid or expired token');
        }

        $user = $tokenEntity->getUser();

        return new SelfValidatingPassport(new UserBadge($user->getEmail()));
    }

    public function onAuthenticationSuccess(): ?Response
    {
        return null; // Let the request continue
    }

    public function onAuthenticationFailure(\Symfony\Component\Security\Core\Exception\AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_UNAUTHORIZED);
    }
}