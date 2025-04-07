<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Response;

class CorsListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => ['onKernelResponse', 9999],
            KernelEvents::REQUEST => ['onKernelRequest', 9999],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        // N'ajoute pas d'en-têtes CORS aux requêtes autres que OPTIONS
        if (!$event->isMainRequest() || $event->getRequest()->getMethod() !== 'OPTIONS') {
            return;
        }

        $request = $event->getRequest();
        // Récupérer l'origine de la requête
        $origin = $request->headers->get('Origin');

        $response = new Response();
        
        // Définir l'origine spécifique (pas de wildcard avec credentials)
        if ($origin) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:8090');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '3600');
        $response->setStatusCode(Response::HTTP_NO_CONTENT);
        
        $event->setResponse($response);
        $event->stopPropagation();
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        $request = $event->getRequest();
        
        // Récupérer l'origine de la requête
        $origin = $request->headers->get('Origin');
        
        // Définir l'origine spécifique (pas de wildcard avec credentials)
        if ($origin) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:8090');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
    }
}