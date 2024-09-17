import { createUsername } from '@Utils';
import { useCallback, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

import LandingPage from './LandingPage';

interface LandingLoaderData {
  generatedUsername: string;
}

function Landing() {
  const { generatedUsername = '' } = useLoaderData() as LandingLoaderData;
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [username, setUsername] = useState(generatedUsername);

  const generateRandomUsername = useCallback(() => {
    setUsername(createUsername());
  }, [setUsername]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error, { id: 'toast-landing-error' });
      navigate(location.pathname, { replace: true, state: null }); // clear location state
    }
  }, [state?.error, location.pathname, navigate]);

  return (
    <>
      <Toaster />
      <LandingPage
        username={username}
        roomId={roomId}
        generateRandomUsername={generateRandomUsername}
      />
    </>
  );
}

export default Landing;
