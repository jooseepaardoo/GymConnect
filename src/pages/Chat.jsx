import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  setConversations,
  setCurrentConversation,
  setMessages,
  addMessage,
} from '../store/slices/chatSlice';

function Chat() {
  const { user } = useSelector((state) => state.auth);
  const { conversations, currentConversation, messages } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Obtener conversaciones
    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationsData = [];
      for (const doc of snapshot.docs) {
        const matchData = doc.data();
        const otherUserId = matchData.users.find((id) => id !== user.uid);
        const userDoc = await getDocs(
          query(collection(db, 'users'), where('__name__', '==', otherUserId))
        );
        if (!userDoc.empty) {
          conversationsData.push({
            id: doc.id,
            ...matchData,
            otherUser: {
              id: otherUserId,
              ...userDoc.docs[0].data(),
            },
          });
        }
      }
      dispatch(setConversations(conversationsData));
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  useEffect(() => {
    if (!currentConversation) return;

    // Obtener mensajes
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', currentConversation.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(setMessages(messagesData));
    });

    return () => unsubscribe();
  }, [currentConversation, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    try {
      const messageData = {
        conversationId: currentConversation.id,
        senderId: user.uid,
        text: newMessage,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900">Conversaciones</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => dispatch(setCurrentConversation(conversation))}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                currentConversation?.id === conversation.id
                  ? 'bg-primary-50'
                  : ''
              }`}
            >
              <div className="flex items-center">
                <img
                  src={
                    conversation.otherUser.photoURL ||
                    'https://via.placeholder.com/40'
                  }
                  alt={conversation.otherUser.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {conversation.otherUser.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {conversation.otherUser.location}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {currentConversation ? (
          <>
            {/* Encabezado del chat */}
            <div className="p-4 bg-white border-b">
              <div className="flex items-center">
                <img
                  src={
                    currentConversation.otherUser.photoURL ||
                    'https://via.placeholder.com/40'
                  }
                  alt={currentConversation.otherUser.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {currentConversation.otherUser.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentConversation.otherUser.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user.uid
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderId === user.uid
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Formulario de mensaje */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm border-gray-300"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Enviar
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Selecciona una conversación para comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;