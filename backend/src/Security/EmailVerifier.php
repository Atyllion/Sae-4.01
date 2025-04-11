<?php

namespace App\Security;

use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mailer\MailerInterface;
use App\Entity\User;
use Symfony\Component\Mime\Address;
use Symfony\Component\HttpFoundation\Request;

class EmailVerifier
{
    private VerifyEmailHelperInterface $verifyEmailHelper;
    private MailerInterface $mailer;

    public function __construct(VerifyEmailHelperInterface $verifyEmailHelper, MailerInterface $mailer)
    {
        $this->verifyEmailHelper = $verifyEmailHelper;
        $this->mailer = $mailer;
    }

    public function sendEmailConfirmation(string $verifyEmailRouteName, User $user, Email $email): void
    {
        $signatureComponents = $this->verifyEmailHelper->generateSignature(
            $verifyEmailRouteName,
            $user->getEmail(),
            $user->getId(),
            ['id' => $user->getId()]
        );

        // Utilisez l'URL signée générée par VerifyEmailHelper
        $uriWithId = $signatureComponents->getSignedUrl();
    
        $email->html(
            sprintf(
                '<p>Bonjour %s,</p><p>Veuillez confirmer votre email en cliquant sur le lien suivant :</p><a href="%s">Confirmer mon email</a>',
                $user->getUsername(),
                $uriWithId
            )
        );
    
        $this->mailer->send($email);
    }

    public function handleEmailConfirmation(Request $request, User $user): void
    {
        try {
            $this->verifyEmailHelper->validateEmailConfirmation(
                $request->getUri(),
                $user->getEmail(),
                $user->getId(),
                ['id' => $user->getId()]
            );
        } catch (VerifyEmailExceptionInterface $e) {
            throw $e;
        }
    }
}