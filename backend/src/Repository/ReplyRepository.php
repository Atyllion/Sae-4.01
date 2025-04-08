<?php

namespace App\Repository;

use App\Entity\Reply;
use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reply>
 */
class ReplyRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reply::class);
    }

    public function paginateByPost(Post $post, int $page = 1, int $limit = 10): Paginator
    {
        $firstResult = ($page - 1) * $limit;

        $query = $this->createQueryBuilder('r')
            ->where('r.post = :post')
            ->setParameter('post', $post)
            ->orderBy('r.created_at', 'ASC')
            ->setFirstResult($firstResult)
            ->setMaxResults($limit)
            ->getQuery();

        return new Paginator($query);
    }
}