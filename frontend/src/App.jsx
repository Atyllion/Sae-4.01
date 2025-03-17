import './App.css'
import Home from './components/Home/Home.jsx'

const response = await fetch('http://localhost:8080/posts');
console.log(await response.json());

function App() {

  return (
    <>
      <Home />
    </>
  )
}

export default App
