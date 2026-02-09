'use client';

import { useState, useEffect } from 'react';
import { MapPin, User, Phone, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: 'es' | 'en';
  address?: Address;
  onSave: (address: Address) => Promise<void>;
}

const translations = {
  es: {
    titleAdd: 'Agregar Dirección',
    titleEdit: 'Editar Dirección',
    fullName: 'Nombre Completo',
    fullNamePlaceholder: 'Juan Pérez',
    street: 'Calle y Número',
    streetPlaceholder: 'Av. Principal #123',
    city: 'Ciudad',
    cityPlaceholder: 'Hermosillo',
    state: 'Estado',
    statePlaceholder: 'Sonora',
    zipCode: 'Código Postal',
    zipCodePlaceholder: '83000',
    phone: 'Teléfono',
    phonePlaceholder: '662 123 4567',
    setAsDefault: 'Establecer como dirección principal',
    cancel: 'Cancelar',
    save: 'Guardar Dirección',
    saving: 'Guardando...',
    errors: {
      nameRequired: 'El nombre es requerido',
      streetRequired: 'La calle es requerida',
      cityRequired: 'La ciudad es requerida',
      stateRequired: 'El estado es requerido',
      zipCodeRequired: 'El código postal es requerido',
      zipCodeInvalid: 'Código postal inválido',
      phoneRequired: 'El teléfono es requerido',
      phoneInvalid: 'Teléfono inválido'
    }
  },
  en: {
    titleAdd: 'Add Address',
    titleEdit: 'Edit Address',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    street: 'Street Address',
    streetPlaceholder: 'Main St #123',
    city: 'City',
    cityPlaceholder: 'Hermosillo',
    state: 'State',
    statePlaceholder: 'Sonora',
    zipCode: 'ZIP Code',
    zipCodePlaceholder: '83000',
    phone: 'Phone',
    phonePlaceholder: '662 123 4567',
    setAsDefault: 'Set as default address',
    cancel: 'Cancel',
    save: 'Save Address',
    saving: 'Saving...',
    errors: {
      nameRequired: 'Name is required',
      streetRequired: 'Street is required',
      cityRequired: 'City is required',
      stateRequired: 'State is required',
      zipCodeRequired: 'ZIP code is required',
      zipCodeInvalid: 'Invalid ZIP code',
      phoneRequired: 'Phone is required',
      phoneInvalid: 'Invalid phone'
    }
  }
};

export function AddressModal({
  isOpen,
  onClose,
  isDarkMode,
  language,
  address,
  onSave
}: AddressModalProps) {
  const [formData, setFormData] = useState<Address>({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData(address);
      } else {
        setFormData({
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          isDefault: false
        });
      }
      setErrors({});
    }
  }, [isOpen, address]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.nameRequired;
    }

    if (!formData.street.trim()) {
      newErrors.street = t.errors.streetRequired;
    }

    if (!formData.city.trim()) {
      newErrors.city = t.errors.cityRequired;
    }

    if (!formData.state.trim()) {
      newErrors.state = t.errors.stateRequired;
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = t.errors.zipCodeRequired;
    } else if (!/^\d{5}$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = t.errors.zipCodeInvalid;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.errors.phoneRequired;
    } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = t.errors.phoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Address, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`max-w-2xl border p-6 md:p-8 ${
          isDarkMode ? 'border-[#3d2f23] bg-[#1a1512]' : 'border-gray-200 bg-white'
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-2xl tracking-tight md:text-3xl ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {address ? t.titleEdit : t.titleAdd}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className={`block text-sm mb-2 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}
            >
              {t.fullName}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className={`w-5 h-5 ${
                  errors.name 
                    ? 'text-red-500'
                    : isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
                }`} />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className={`w-full pl-12 pr-4 py-3 border transition-colors ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode 
                      ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                } focus:outline-none`}
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <label
              htmlFor="street"
              className={`block text-sm mb-2 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}
            >
              {t.street}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Home className={`w-5 h-5 ${
                  errors.street 
                    ? 'text-red-500'
                    : isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
                }`} />
              </div>
              <input
                id="street"
                type="text"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder={t.streetPlaceholder}
                className={`w-full pl-12 pr-4 py-3 border transition-colors ${
                  errors.street
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode 
                      ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                } focus:outline-none`}
              />
            </div>
            {errors.street && (
              <p className="mt-2 text-sm text-red-500">{errors.street}</p>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="city"
                className={`block text-sm mb-2 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}
              >
                {t.city}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className={`w-5 h-5 ${
                    errors.city 
                      ? 'text-red-500'
                      : isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder={t.cityPlaceholder}
                  className={`w-full pl-12 pr-4 py-3 border transition-colors ${
                    errors.city
                      ? 'border-red-500 focus:border-red-500'
                      : isDarkMode 
                        ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                  } focus:outline-none`}
                />
              </div>
              {errors.city && (
                <p className="mt-2 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="state"
                className={`block text-sm mb-2 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}
              >
                {t.state}
              </label>
              <input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder={t.statePlaceholder}
                className={`w-full px-4 py-3 border transition-colors ${
                  errors.state
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode 
                      ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                } focus:outline-none`}
              />
              {errors.state && (
                <p className="mt-2 text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          {/* ZIP Code & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="zipCode"
                className={`block text-sm mb-2 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}
              >
                {t.zipCode}
              </label>
              <input
                id="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder={t.zipCodePlaceholder}
                maxLength={5}
                className={`w-full px-4 py-3 border transition-colors ${
                  errors.zipCode
                    ? 'border-red-500 focus:border-red-500'
                    : isDarkMode 
                      ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                } focus:outline-none`}
              />
              {errors.zipCode && (
                <p className="mt-2 text-sm text-red-500">{errors.zipCode}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className={`block text-sm mb-2 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}
              >
                {t.phone}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className={`w-5 h-5 ${
                    errors.phone 
                      ? 'text-red-500'
                      : isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className={`w-full pl-12 pr-4 py-3 border transition-colors ${
                    errors.phone
                      ? 'border-red-500 focus:border-red-500'
                      : isDarkMode 
                        ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                  } focus:outline-none`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Set as Default */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => handleChange('isDefault', e.target.checked)}
                className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.setAsDefault}
              </span>
            </label>
          </div>

          {/* Actions */}
          <DialogFooter className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border transition-colors ${
                isDarkMode 
                  ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47]' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-6 py-3 transition-opacity ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
              }`}
            >
              {isLoading ? t.saving : t.save}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
