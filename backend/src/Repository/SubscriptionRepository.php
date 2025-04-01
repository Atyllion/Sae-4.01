<?php
// src/Repository/SubscriptionRepository.php
namespace App\Repository;

use App\Entity\Subscription;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    public function findOneByFollowerAndFollowing(User $follower, User $following): ?Subscription
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.follower = :follower')
            ->andWhere('s.following = :following')
            ->setParameter('follower', $follower)
            ->setParameter('following', $following)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countFollowersByUser(User $user): int
    {
        return $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->andWhere('s.following = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countFollowingByUser(User $user): int
    {
        return $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->andWhere('s.follower = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}