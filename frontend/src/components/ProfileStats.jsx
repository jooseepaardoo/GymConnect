import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

function ProfileStats({ userId }) {
  const [stats, setStats] = useState({
    matches: 0,
    likes: 0,
    messagesSent: 0,
    successfulConnections: 0,
    activeChats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener matches
        const matchesQuery = query(
          collection(db, 'matches'),
          where('users', 'array-contains', userId)
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        const matchesCount = matchesSnapshot.size;

        // Obtener likes recibidos
        const likesQuery = query(
          collection(db, 'likes'),
          where('toUser', '==', userId)
        );
        const likesSnapshot = await getDocs(likesQuery);
        const likesCount = likesSnapshot.size;

        // Obtener mensajes enviados
        const messagesQuery = query(
          collection(db, 'messages'),
          where('senderId', '==', userId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesCount = messagesSnapshot.size;

        // Calcular conexiones exitosas (matches con al menos 5 mensajes intercambiados)
        let successfulCount = 0;
        let activeChatsCount = 0;
        const now = new Date();

        for (const match of matchesSnapshot.docs) {
          const matchId = match.id;
          const messagesInMatchQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', matchId)
          );
          const messagesInMatch = await getDocs(messagesInMatchQuery);
          
          if (messagesInMatch.size >= 5) {
            successfulCount++;
          }

          // Verificar si hay mensajes en los últimos 7 días
          const recentMessages = messagesInMatch.docs.some(msg => {
            const msgDate = msg.data().timestamp?.toDate();
            return msgDate && (now - msgDate) / (1000 * 60 * 60 * 24) <= 7;
          });

          if (recentMessages) {
            activeChatsCount++;
          }
        }

        setStats({
          matches: matchesCount,
          likes: likesCount,
          messagesSent: messagesCount,
          successfulConnections: successfulCount,
          activeChats: activeChatsCount,
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Estadísticas de perfil
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary-600">
            {stats.matches}
          </div>
          <div className="text-sm text-gray-600">Matches</div>
        </div>
        <div className="bg-pink-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-pink-600">
            {stats.likes}
          </div>
          <div className="text-sm text-gray-600">Likes recibidos</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.messagesSent}
          </div>
          <div className="text-sm text-gray-600">Mensajes enviados</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.successfulConnections}
          </div>
          <div className="text-sm text-gray-600">Conexiones exitosas</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats.activeChats}
          </div>
          <div className="text-sm text-gray-600">Chats activos</div>
        </div>
      </div>
    </div>
  );
}

export default ProfileStats;