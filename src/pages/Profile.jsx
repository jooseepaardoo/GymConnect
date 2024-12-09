import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../firebase/config';
import { setUser } from '../store/slices/authSlice';
import ProfileStats from '../components/ProfileStats';
import Achievements from '../components/Achievements';
import TrainingSuggestions from '../components/TrainingSuggestions';
import PrivacySettings from '../components/PrivacySettings';

const objectives = [
  'Perder peso',
  'Ganar músculo',
  'Mejorar resistencia',
  'Mantener forma física',
  'Preparar competición',
];

const experienceLevels = [
  'principiante',
  'intermedio',
  'avanzado',
];

const timePreferences = [
  'mañana',
  'tarde',
  'noche',
];

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    objectives: [],
    experience: '',
    location: '',
    preferredTime: [],
    photoURL: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL });
      await updateDoc(doc(db, 'users', user.uid), { photoURL });

      setProfileData((prev) => ({ ...prev, photoURL }));
      dispatch(setUser({ ...user, photoURL }));
    } catch (error) {
      console.error('Error al subir la foto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), profileData);
      await updateProfile(auth.currentUser, {
        displayName: profileData.name,
      });

      dispatch(setUser({
        ...user,
        displayName: profileData.name,
      }));
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Perfil</h3>
          <p className="mt-1 text-sm text-gray-600">
            Esta información será mostrada a otros usuarios.
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto de perfil
                  </label>
                  <div className="mt-2 flex items-center space-x-5">
                    <img
                      src={profileData.photoURL || 'https://via.placeholder.com/100'}
                      alt="Foto de perfil"
                      className="h-20 w-20 rounded-full"
                    />
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Cambiar foto
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Objetivos
                  </label>
                  <div className="mt-2 space-y-2">
                    {objectives.map((objective) => (
                      <div key={objective} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.objectives.includes(objective)}
                          onChange={() => handleCheckboxChange('objectives', objective)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          {objective}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nivel de experiencia
                  </label>
                  <select
                    name="experience"
                    value={profileData.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Selecciona un nivel</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ciudad, Área"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Horario preferido
                  </label>
                  <div className="mt-2 space-y-2">
                    {timePreferences.map((time) => (
                      <div key={time} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.preferredTime.includes(time)}
                          onChange={() => handleCheckboxChange('preferredTime', time)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <ProfileStats userId={user.uid} />
        <Achievements userId={user.uid} />
        <TrainingSuggestions userId={user.uid} />
        <PrivacySettings userId={user.uid} />
      </div>
    </div>
  );
}

export default Profile;