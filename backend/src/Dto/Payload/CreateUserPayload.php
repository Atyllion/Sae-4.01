<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;

class CreateUserPayload
{
    #[Assert\NotBlank(message: "Username is required")]
    #[Assert\Length(
        max: 255,
        maxMessage: "Username exceeds 255 characters"
    )]
    public string $username;

    #[Assert\NotBlank(message: "Email is required")]
    #[Assert\Email(message: "Invalid email format")]
    #[Assert\Length(
        max: 255,
        maxMessage: "Email exceeds 255 characters"
    )]
    public string $email;

    #[Assert\NotBlank(message: "Password is required")]
    #[Assert\Length(
        min: 8,
        minMessage: "Password must be at least 8 characters long",
        max: 255,
        maxMessage: "Password exceeds 255 characters"
    )]
    public string $password;

    #[Assert\NotBlank(message: "Roles are required")]
    public array $roles = ['ROLE_USER'];
}
?>