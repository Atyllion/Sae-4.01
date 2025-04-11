<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;

class CreatePostPayload
{
    #[Assert\NotBlank(message: "Content is required")]
    #[Assert\Length(
        max: 280,
        maxMessage: "Content exceeds 280 characters"
    )]
    public string $content;

    #[Assert\NotBlank(message: "User is required")]
    public object $user;
}
?>