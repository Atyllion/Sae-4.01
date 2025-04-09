import React from 'react';
import { Link } from 'react-router-dom';
import ProfilPicture from '../Profil-Picture/Profil-Picture';

interface PostHeaderProps {
    user: { id: number; username: string };
    isAuthor: boolean;
    userBanned: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({ user, isAuthor, userBanned }) => {
    return (
        <div className='flex flex-row items-center gap-4'>
            {isAuthor ? (
                <Link to="/profil" className='flex flex-row items-center gap-4 w-fit'>
                    <ProfilPicture userId={user.id.toString()} />
                    <p className='text-bg font-bold text-lg w-fit py-2 hover:text-indigo-500 transition-colors' title='Votre Profil'>{user?.username || 'Unknown User'}</p>
                </Link>
            ) : userBanned ? (
                <div className='flex flex-row items-start bg-red-500 rounded-2xl gap-4 w-full'>
                    <p className='text-bg font-bold text-lg text-white w-fit p-2' title='Utilisateur banni'>Utilisateur Banni</p>
                </div>
            ) : (
                <Link to={`/user/${user.id}`} className='flex flex-row items-center gap-4 w-fit'>
                    <ProfilPicture userId={user.id.toString()} />
                    <p className='text-bg font-bold text-lg w-fit py-2 hover:text-blue-500 transition-colors' title={`Visiter le profil de ${user.username}`}>{user?.username || 'Unknown User'}</p>
                </Link>
            )}
        </div>
    );
};

export default PostHeader;