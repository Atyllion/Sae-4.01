<?php

namespace App\Repository;

use App\Entity\ReplyLike;
use App\Entity\Reply;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ReplyLike>
 */
class ReplyLikeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ReplyLike::class);
    }

    public function findOneByUserAndReply(User $user, Reply $reply): ?ReplyLike
    {
        return $this->createQueryBuilder('rl')
            ->where('rl.user = :user')
            ->andWhere('rl.reply = :reply')
            ->setParameter('user', $user)
            ->setParameter('reply', $reply)
            ->getQuery()
            ->getOneOrNullResult();
    }
}