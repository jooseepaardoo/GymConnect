import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const WORKOUT_SUGGESTIONS = {
  'perder peso': [
    {
      title: 'Cardio HIIT',
      description: 'Entrenamiento de alta intensidad para quemar grasa',
      duration: '30-45 min',
      difficulty: 'Intermedio',
      benefits: ['Quema de grasa', 'Mejora cardiovascular', 'Aumento de metabolismo'],
    },
    {
      title: 'Circuito Full Body',
      description: 'Ejercicios compuestos para todo el cuerpo',
      duration: '45-60 min',
      difficulty: 'Principiante-Intermedio',
      benefits: ['Tonificación', 'Pérdida de peso', 'Resistencia'],
    },
  ],
  'ganar músculo': [
    {
      title: 'Hipertrofia Upper Body',
      description: 'Entrenamiento de fuerza para tren superior',
      duration: '60-75 min',
      difficulty: 'Intermedio-Avanzado',
      benefits: ['Ganancia muscular', 'Fuerza', 'Definición'],
    },
    {
      title: 'Lower Body Power',
      description: 'Rutina de potencia para tren inferior',
      duration: '45-60 min',
      difficulty: 'Intermedio',
      benefits: ['Fuerza', 'Masa muscular', 'Potencia'],
    },
  ],
  'mejorar resistencia': [
    {
      title: 'Resistencia Progresiva',
      description: 'Entrenamiento de resistencia cardiovascular',
      duration: '45-60 min',
      difficulty: 'Principiante-Intermedio',
      benefits: ['Resistencia', 'Capacidad aeróbica', 'Recuperación'],
    },
    {
      title: 'Endurance Circuit',
      description: 'Circuito de resistencia muscular',
      duration: '30-45 min',
      difficulty: 'Intermedio',
      benefits: ['Resistencia muscular', 'Definición', 'Coordinación'],
    },
  ],
};

function TrainingSuggestions({ userId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        const userObjectives = userData.objectives || [];

        // Obtener sugerencias basadas en los objetivos del usuario
        const relevantSuggestions = userObjectives.reduce((acc, objective) => {
          if (WORKOUT_SUGGESTIONS[objective]) {
            acc.push(...WORKOUT_SUGGESTIONS[objective]);
          }
          return acc;
        }, []);

        // Obtener usuarios con objetivos similares
        const similarUsersQuery = query(
          collection(db, 'users'),
          where('objectives', 'array-contains-any', userObjectives),
          where('__name__', '!=', userId)
        );
        const similarUsersSnapshot = await getDocs(similarUsersQuery);
        
        // Obtener rutinas favoritas de usuarios similares
        const popularWorkouts = [];
        similarUsersSnapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.favoriteWorkouts) {
            popularWorkouts.push(...userData.favoriteWorkouts);
          }
        });

        // Combinar sugerencias con rutinas populares
        setSuggestions([...relevantSuggestions, ...popularWorkouts]);
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Sugerencias de entrenamiento
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((workout, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 cursor-pointer transition-colors"
            onClick={() => setSelectedWorkout(workout)}
          >
            <h4 className="font-medium text-gray-900">{workout.title}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {workout.description}
            </p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="mr-3">⏱ {workout.duration}</span>
              <span>📊 {workout.difficulty}</span>
            </div>
            <div className="mt-2">
              {workout.benefits.map((benefit, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-1 mb-1"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedWorkout && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-medium text-gray-900">
                {selectedWorkout.title}
              </h3>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">{selectedWorkout.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Duración</h4>
                  <p className="text-gray-600">{selectedWorkout.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Dificultad</h4>
                  <p className="text-gray-600">{selectedWorkout.difficulty}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">Beneficios</h4>
                <ul className="mt-2 space-y-1">
                  {selectedWorkout.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Aquí se podría implementar la lógica para guardar
                    // la rutina como favorita
                    setSelectedWorkout(null);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Guardar como favorito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainingSuggestions;