<?php

namespace App\Repository;

use App\Entity\Likes;
use App\Entity\Post;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class LikesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Likes::class);
    }

    public function findOneByUserAndPost(User $user, Post $post): ?Likes
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.user = :user')
            ->andWhere('l.post = :post')
            ->setParameter('user', $user)
            ->setParameter('post', $post)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    
    public function getPostLikesCount(Post $post): int
    {
        return $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->andWhere('l.post = :post')
            ->setParameter('post', $post)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
    
    public function hasUserLikedPost(User $user, Post $post): bool
    {
        $like = $this->findOneByUserAndPost($user, $post);
        return $like !== null;
    }
}