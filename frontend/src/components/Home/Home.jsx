// importer le UI du feed
import NewPost from '../../ui/NewPost/NewPost.jsx';

// importer le UI de la zone de texte
// import ... from './ui/...'

const response = await fetch('http://localhost:8080/posts');
console.log(await response.json());

export default function Home() {
  return (
      <>
        <NewPost />
      </>
  );
}