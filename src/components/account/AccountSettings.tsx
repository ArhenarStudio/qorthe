"use client";

import React, { useState } from 'react';
import { Camera, Lock, Mail, Bell, Shield, HelpCircle } from 'lucide-react';
import { ProfilePictureModal } from './ProfilePictureModal';
import { SecurityModal } from './SecurityModal';
import { CommunicationModal } from './CommunicationModal';
import { NotificationsModal } from './NotificationsModal';
import { PrivacyModal } from './PrivacyModal';
import { HelpModal } from './HelpModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AccountSettings: React.FC = () => {
  const { user, supabase, refreshCustomer } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const handleProfileSave = async (newImage: Blob) => {
    if (!supabase || !user) {
      toast.error('Sesión no disponible');
      return;
    }

    try {
      // Upload to Supabase Storage (avatars bucket)
      const fileName = `${user.id}/avatar_${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, newImage, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('[Avatar] Upload error:', uploadError);
        // If bucket doesn't exist, save as base64 in metadata as fallback
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          await supabase.auth.updateUser({
            data: { avatar_url: base64.substring(0, 500000) } // Max 500KB as base64
          });
          toast.success('Foto de perfil actualizada');
          refreshCustomer();
        };
        reader.readAsDataURL(newImage);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Save URL in user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl }
      });

      toast.success('Foto de perfil actualizada');
      refreshCustomer();
    } catch (error: any) {
      console.error('[Avatar] Error:', error);
      toast.error('Error al subir la foto');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-wood-900 rounded-2xl p-8 border border-wood-100 dark:border-wood-800 shadow-[0_2px_20px_rgba(0,0,0,0.02)] transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 transition-colors">Gestión de Cuenta</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ConfigCard 
            icon={Camera}
            title="Foto de Perfil"
            description="Cambiar imagen"
            action="Subir"
            onClick={() => setIsProfileModalOpen(true)}
          />
          <ConfigCard 
            icon={Lock}
            title="Seguridad"
            description="Contraseña y Accesos"
            action="Actualizar"
            onClick={() => setIsSecurityModalOpen(true)}
          />
          <ConfigCard 
            icon={Mail}
            title="Comunicación"
            description="Email y Contacto"
            action="Editar"
            onClick={() => setIsCommunicationModalOpen(true)}
          />
          <ConfigCard 
            icon={Bell}
            title="Notificaciones"
            description="Alertas y Newsletter"
            action="Ajustar"
            onClick={() => setIsNotificationsModalOpen(true)}
          />
          <ConfigCard 
            icon={Shield}
            title="Privacidad"
            description="Datos Personales"
            action="Revisar"
            onClick={() => setIsPrivacyModalOpen(true)}
          />
          <ConfigCard 
            icon={HelpCircle}
            title="Ayuda"
            description="Soporte y Guías"
            action="Ver Centro"
            onClick={() => setIsHelpModalOpen(true)} 
          />
        </div>
      </div>

      <ProfilePictureModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleProfileSave}
      />
      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
      <CommunicationModal isOpen={isCommunicationModalOpen} onClose={() => setIsCommunicationModalOpen(false)} />
      <NotificationsModal isOpen={isNotificationsModalOpen} onClose={() => setIsNotificationsModalOpen(false)} />
      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};

const ConfigCard = ({ icon: Icon, title, description, action, onClick, highlight }: any) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between gap-4 h-full relative overflow-hidden ${
      highlight 
        ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 text-sand-50 dark:text-wood-900' 
        : 'bg-wood-50/30 dark:bg-wood-800/20 border-wood-100 dark:border-wood-700/50 hover:border-wood-300 dark:hover:border-wood-600 hover:bg-wood-50 dark:hover:bg-wood-800/50'
    }`}
  >
    <div className="flex items-start justify-between relative z-10">
      <div className={`p-2.5 rounded-lg shadow-sm ${
        highlight 
          ? 'bg-wood-800 dark:bg-wood-200 text-sand-100 dark:text-wood-900' 
          : 'bg-white dark:bg-wood-800 text-wood-900 dark:text-sand-100'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-[10px] uppercase font-bold transition-colors ${
        highlight 
          ? 'text-sand-200 dark:text-wood-600' 
          : 'text-wood-400 dark:text-wood-500 group-hover:text-wood-900 dark:group-hover:text-sand-100'
      }`}>
        {action}
      </span>
    </div>
    
    <div className="relative z-10">
      <h4 className={`font-medium text-base mb-1 ${
        highlight ? 'text-sand-50 dark:text-wood-900' : 'text-wood-900 dark:text-sand-100'
      }`}>{title}</h4>
      <p className={`text-xs truncate ${
        highlight ? 'text-sand-200 dark:text-wood-500' : 'text-wood-500 dark:text-wood-400'
      }`}>{description}</p>
    </div>
  </div>
);