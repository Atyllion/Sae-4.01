<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class FileUploadService
{
    private $profilePicturesDirectory;
    private $bannerPicturesDirectory;
    private $slugger;

    public function __construct(
        string $profilePicturesDirectory,
        string $bannerPicturesDirectory,
        SluggerInterface $slugger
    ) {
        $this->profilePicturesDirectory = $profilePicturesDirectory;
        $this->bannerPicturesDirectory = $bannerPicturesDirectory;
        $this->slugger = $slugger;
    }

    public function uploadProfilePicture(UploadedFile $file): string
    {
        return $this->uploadFile($file, $this->profilePicturesDirectory);
    }

    public function uploadBannerPicture(UploadedFile $file): string
    {
        return $this->uploadFile($file, $this->bannerPicturesDirectory);
    }

    private function uploadFile(UploadedFile $file, string $targetDirectory): string
    {
        // Log pour le débogage
        error_log("Tentative d'upload dans le répertoire: " . $targetDirectory);
        error_log("Fichier original: " . $file->getClientOriginalName());
        error_log("MIME type: " . $file->getMimeType());

        // Récupérer le nom original du fichier et le sécuriser
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $extension = $file->guessExtension();
        
        // Garder le nom original mais ajouter un identifiant unique
        $fileName = $safeFilename . '-' . uniqid() . '.' . $extension;
        
        // S'assurer que les répertoires d'upload existent
        if (!file_exists($targetDirectory)) {
            if (!mkdir($targetDirectory, 0777, true)) {
                throw new \Exception('Server permission error: Cannot create directory ' . $targetDirectory);
            }
        }

        if (!is_writable($targetDirectory)) {
            throw new \Exception('Server permission error: Directory not writable ' . $targetDirectory);
        }
        
        try {
            // Déplacer le fichier vers le répertoire cible
            $file->move($targetDirectory, $fileName);
        } catch (FileException $e) {
            throw new \Exception('Une erreur est survenue lors du téléchargement du fichier: ' . $e->getMessage());
        }
        
        return $fileName;
    }
}