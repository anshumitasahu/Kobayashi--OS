import { useEffect, useState } from 'react';
import Home from './components/Home';
import Loading from './components/layout/Loading';

function App() {

  const [isLoading, setIsLoading] = useState(true);

  const hideLoading = () => {
    if (isLoading) {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeOutId = setTimeout(hideLoading, 5000)
    return () => {
      clearTimeout(timeOutId);
    }
  }, [])

  return (
    <>
      {
        isLoading && <Loading />
      }
      <div>
        <Home />
      </div>
    </>
  )
}

export default App
