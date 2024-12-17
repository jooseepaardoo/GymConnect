import { useState, useEffect } from 'react';
import api from '../services/api';
import { Switch } from '@headlessui/react';

const DEFAULT_SETTINGS = {
  showOnlineStatus: true,
  showLastActive: true,
  showLocation: true,
  allowMessages: true,
  showProfileInSearch: true,
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: true,
  showStats: true,
  showAchievements: true,
};

function PrivacySettings({ userId }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get(`/users/${userId}/privacy-settings`);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...response,
        });
      } catch (error) {
        console.error('Error al obtener configuración:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const handleToggle = async (setting) => {
    try {
      setSaving(true);
      const newSettings = {
        ...settings,
        [setting]: !settings[setting],
      };
      
      await api.put(`/users/${userId}/privacy-settings`, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Configuración de privacidad
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Visibilidad del perfil</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Mostrar estado en línea</span>
              <p className="text-sm text-gray-500">Otros usuarios pueden ver cuando estás activo</p>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onChange={() => handleToggle('showOnlineStatus')}
              className={`${
                settings.showOnlineStatus ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            >
              <span
                className={`${
                  settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Mostrar última conexión</span>
              <p className="text-sm text-gray-500">Otros usuarios pueden ver cuándo fue tu última actividad</p>
            </div>
            <Switch
              checked={settings.showLastActive}
              onChange={() => handleToggle('showLastActive')}
              className={`${
                settings.showLastActive ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Mostrar ubicación</span>
              <p className="text-sm text-gray-500">Tu ubicación será visible para otros usuarios</p>
            </div>
            <Switch
              checked={settings.showLocation}
              onChange={() => handleToggle('showLocation')}
              className={`${
                settings.showLocation ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Mensajes y comunicación</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Permitir mensajes</span>
              <p className="text-sm text-gray-500">Otros usuarios pueden enviarte mensajes después de hacer match</p>
            </div>
            <Switch
              checked={settings.allowMessages}
              onChange={() => handleToggle('allowMessages')}
              className={`${
                settings.allowMessages ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Aparecer en búsquedas</span>
              <p className="text-sm text-gray-500">Tu perfil aparecerá en los resultados de búsqueda</p>
            </div>
            <Switch
              checked={settings.showProfileInSearch}
              onChange={() => handleToggle('showProfileInSearch')}
              className={`${
                settings.showProfileInSearch ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Notificaciones</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Notificaciones activadas</span>
              <p className="text-sm text-gray-500">Recibir notificaciones de la aplicación</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onChange={() => handleToggle('notificationsEnabled')}
              className={`${
                settings.notificationsEnabled ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Notificaciones por email</span>
              <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className={`${
                settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Notificaciones push</span>
              <p className="text-sm text-gray-500">Recibir notificaciones push en el navegador</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              className={`${
                settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Estadísticas y logros</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Mostrar estadísticas</span>
              <p className="text-sm text-gray-500">Otros usuarios pueden ver tus estadísticas</p>
            </div>
            <Switch
              checked={settings.showStats}
              onChange={() => handleToggle('showStats')}
              className={`${
                settings.showStats ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Mostrar logros</span>
              <p className="text-sm text-gray-500">Otros usuarios pueden ver tus logros</p>
            </div>
            <Switch
              checked={settings.showAchievements}
              onChange={() => handleToggle('showAchievements')}
              className={`${
                settings.showAchievements ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {saving && (
        <div className="mt-4 text-sm text-gray-500">
          Guardando cambios...
        </div>
      )}
    </div>
  );
}

export default PrivacySettings;