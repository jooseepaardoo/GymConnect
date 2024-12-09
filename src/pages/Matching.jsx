import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { setProfiles, setCurrentProfile, addMatch } from '../store/slices/matchingSlice';

function Matching() {
  const { user } = useSelector((state) => state.auth);
  const { profiles, currentProfile } = useSelector((state) => state.matching);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('__name__', '!=', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProfiles = [];
        querySnapshot.forEach((doc) => {
          fetchedProfiles.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        dispatch(setProfiles(fetchedProfiles));
        if (fetchedProfiles.length > 0) {
          dispatch(setCurrentProfile(fetchedProfiles[0]));
        }
      } catch (error) {
        console.error('Error al obtener perfiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user, dispatch]);

  const handleLike = async () => {
    if (!currentProfile) return;

    try {
      await addDoc(collection(db, 'likes'), {
        fromUser: user.uid,
        toUser: currentProfile.id,
        timestamp: serverTimestamp(),
      });

      // Verificar si hay match
      const q = query(
        collection(db, 'likes'),
        where('fromUser', '==', currentProfile.id),
        where('toUser', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // ¡Es un match!
        await addDoc(collection(db, 'matches'), {
          users: [user.uid, currentProfile.id],
          timestamp: serverTimestamp(),
        });
        dispatch(addMatch(currentProfile));
      }

      // Mostrar siguiente perfil
      const nextProfile = profiles[profiles.indexOf(currentProfile) + 1];
      dispatch(setCurrentProfile(nextProfile));
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleSkip = () => {
    const nextProfile = profiles[profiles.indexOf(currentProfile) + 1];
    dispatch(setCurrentProfile(nextProfile));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            No hay más perfiles disponibles
          </h2>
          <p className="mt-2 text-gray-600">
            Vuelve más tarde para encontrar nuevos compañeros de entrenamiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          src={currentProfile.photoURL || 'https://via.placeholder.com/400'}
          alt={currentProfile.name}
          className="w-full h-96 object-cover"
        />
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">{currentProfile.name}</h2>
          <p className="mt-2 text-gray-600">{currentProfile.location}</p>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">Objetivos</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {currentProfile.objectives.map((objective) => (
                <span
                  key={objective}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {objective}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">Experiencia</h3>
            <p className="mt-1 text-gray-600">
              {currentProfile.experience.charAt(0).toUpperCase() + currentProfile.experience.slice(1)}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">Horarios preferidos</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {currentProfile.preferredTime.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleSkip}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Saltar
            </button>
            <button
              onClick={handleLike}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Me interesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Matching;