import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ACHIEVEMENTS = {
  firstMatch: {
    id: 'firstMatch',
    title: 'Primer Match',
    description: 'Conseguiste tu primer match',
    icon: '🤝',
  },
  activeChatter: {
    id: 'activeChatter',
    title: 'Conversador Activo',
    description: 'Enviaste más de 100 mensajes',
    icon: '💬',
  },
  popularUser: {
    id: 'popularUser',
    title: 'Usuario Popular',
    description: 'Recibiste más de 50 likes',
    icon: '⭐',
  },
  consistentUser: {
    id: 'consistentUser',
    title: 'Usuario Constante',
    description: 'Iniciaste sesión 7 días seguidos',
    icon: '📅',
  },
  profileCompleted: {
    id: 'profileCompleted',
    title: 'Perfil Completo',
    description: 'Completaste todos los campos de tu perfil',
    icon: '✅',
  },
  successfulConnector: {
    id: 'successfulConnector',
    title: 'Conector Exitoso',
    description: 'Tuviste 5 conexiones exitosas',
    icon: '🌟',
  },
  photoUploader: {
    id: 'photoUploader',
    title: 'Fotogénico',
    description: 'Subiste tu primera foto de perfil',
    icon: '📸',
  },
  locationSharer: {
    id: 'locationSharer',
    title: 'Ubicación Compartida',
    description: 'Compartiste tu ubicación',
    icon: '📍',
  },
  scheduleOptimizer: {
    id: 'scheduleOptimizer',
    title: 'Organizador',
    description: 'Configuraste tus horarios preferidos',
    icon: '⏰',
  },
  goalSetter: {
    id: 'goalSetter',
    title: 'Definidor de Objetivos',
    description: 'Estableciste tus objetivos de entrenamiento',
    icon: '🎯',
  },
};

function Achievements({ userId }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        const userAchievements = userData.achievements || [];

        // Verificar nuevos logros
        const newAchievements = [];

        // Verificar perfil completo
        if (
          userData.name &&
          userData.photoURL &&
          userData.objectives?.length > 0 &&
          userData.experience &&
          userData.location &&
          userData.preferredTime?.length > 0 &&
          !userAchievements.includes('profileCompleted')
        ) {
          newAchievements.push('profileCompleted');
        }

        // Verificar foto de perfil
        if (userData.photoURL && !userAchievements.includes('photoUploader')) {
          newAchievements.push('photoUploader');
        }

        // Verificar ubicación
        if (userData.location && !userAchievements.includes('locationSharer')) {
          newAchievements.push('locationSharer');
        }

        // Verificar horarios
        if (
          userData.preferredTime?.length > 0 &&
          !userAchievements.includes('scheduleOptimizer')
        ) {
          newAchievements.push('scheduleOptimizer');
        }

        // Verificar objetivos
        if (
          userData.objectives?.length > 0 &&
          !userAchievements.includes('goalSetter')
        ) {
          newAchievements.push('goalSetter');
        }

        // Si hay nuevos logros, actualizarlos en la base de datos
        if (newAchievements.length > 0) {
          const updatedAchievements = [...userAchievements, ...newAchievements];
          await updateDoc(doc(db, 'users', userId), {
            achievements: updatedAchievements,
          });

          // Mostrar el último logro conseguido
          setNewAchievement(ACHIEVEMENTS[newAchievements[newAchievements.length - 1]]);
        }

        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error al obtener logros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Logros
      </h3>

      {newAchievement && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{newAchievement.icon}</span>
            <div>
              <h4 className="font-medium text-green-800">
                ¡Nuevo logro desbloqueado!
              </h4>
              <p className="text-sm text-green-600">
                {newAchievement.title} - {newAchievement.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Object.values(ACHIEVEMENTS).map((achievement) => {
          const isUnlocked = achievements.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 ${
                isUnlocked
                  ? 'bg-primary-50 text-primary-900'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <h4 className="font-medium">{achievement.title}</h4>
              <p className="text-sm mt-1">{achievement.description}</p>
              {!isUnlocked && (
                <div className="mt-2 text-xs text-gray-500">
                  🔒 Bloqueado
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Achievements;