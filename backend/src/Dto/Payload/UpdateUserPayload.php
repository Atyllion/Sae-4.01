<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateUserPayload
{
    // #[Assert\NotBlank(message: "Username is required")]
    #[Assert\Length(
        max: 255,
        maxMessage: "Username exceeds 255 characters"
    )]
    public ?string $username = null; // Rendre le champ optionnel

    // #[Assert\NotBlank(message: "Email is required")]
    #[Assert\Email(message: "Invalid email format")]
    #[Assert\Length(
        max: 255,
        maxMessage: "Email exceeds 255 characters"
    )]
    public ?string $email = null; // Rendre le champ optionnel
}

?>