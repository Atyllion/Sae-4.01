<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class FileUploadService
{
    private $targetDirectory;
    private $slugger;

    public function __construct($targetDirectory, SluggerInterface $slugger)
    {
        $this->targetDirectory = $targetDirectory;
        $this->slugger = $slugger;
    }

    public function upload(UploadedFile $file, string $directory = '')
    {
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $fileName = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

        $uploadDir = $this->targetDirectory;
        if (!empty($directory)) {
            $uploadDir .= '/' . $directory;
            
            // Créer le répertoire s'il n'existe pas
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
        }

        try {
            $file->move($uploadDir, $fileName);
        } catch (FileException $e) {
            throw new \Exception('Une erreur est survenue lors du téléchargement du fichier: ' . $e->getMessage());
        }

        return $directory ? $directory . '/' . $fileName : $fileName;
    }

    public function getTargetDirectory()
    {
        return $this->targetDirectory;
    }
}