<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\UserBlock;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserBlockRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserBlock::class);
    }

    public function findBlock(User $blocker, User $blocked): ?UserBlock
    {
        return $this->createQueryBuilder('b')
            ->where('b.blocker = :blocker')
            ->andWhere('b.blocked = :blocked')
            ->setParameter('blocker', $blocker)
            ->setParameter('blocked', $blocked)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function getBlockedUsers(User $blocker): array
    {
        $em = $this->getEntityManager();
        $dql = "
            SELECT u
            FROM App\Entity\User u
            JOIN App\Entity\UserBlock b WITH b.blocked = u
            WHERE b.blocker = :blocker
        ";
        
        $query = $em->createQuery($dql);
        $query->setParameter('blocker', $blocker);
        
        return $query->getResult();
    }

    public function isUserBlocked(User $user, User $potentialBlocker): bool
    {
        $block = $this->findBlock($potentialBlocker, $user);
        return $block !== null;
    }
}