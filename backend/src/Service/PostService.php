<?php

namespace App\Service;

use App\Dto\Payload\CreatePostPayload;
use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;


class PostService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function create(CreatePostPayload $payload): Post
    {
        // Création d'un nouvel objet Post
        $post = new Post();
        $post->setContent($payload->content);
        $post->setCreatedAt(new \DateTime());
        $post->setUser($payload->user);

        // Sauvegarde dans la base de données
        $this->entityManager->persist($post);
        $this->entityManager->flush();

        return $post;
    }
}

?>