import React, { useState, useRef, useEffect } from 'react';
import { MotorcycleProfile } from '../../types/fuel';
import { Modal } from '../common/Modal';
import { parseNumberSafe } from '../../utils/formatters';
import { compressImage } from '../../utils/imageCompressor';
import { ShieldCheck, Check, Camera, Trash2 } from 'lucide-react';

interface BikeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  bikeProfile: MotorcycleProfile;
  onSaveProfile: (profile: MotorcycleProfile) => void;
}

export const BikeConfigModal: React.FC<BikeConfigModalProps> = ({
  isOpen,
  onClose,
  bikeProfile,
  onSaveProfile,
}) => {
  const [model, setModel] = useState(bikeProfile.model);
  const [edition, setEdition] = useState(bikeProfile.edition);
  const [modelYear, setModelYear] = useState(String(bikeProfile.modelYear));
  const [fuelCapacity, setFuelCapacity] = useState(String(bikeProfile.fuelCapacityLitres));
  const [initialOdo, setInitialOdo] = useState(String(bikeProfile.initialOdometer));
  const [registration, setRegistration] = useState(bikeProfile.registrationNumber || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(bikeProfile.customPhotoUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setModel(bikeProfile.model);
      setEdition(bikeProfile.edition);
      setModelYear(String(bikeProfile.modelYear));
      setFuelCapacity(String(bikeProfile.fuelCapacityLitres));
      setInitialOdo(String(bikeProfile.initialOdometer));
      setRegistration(bikeProfile.registrationNumber || '');
      setPhotoUrl(bikeProfile.customPhotoUrl);
    }
  }, [isOpen, bikeProfile]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1000, 0.82);
      setPhotoUrl(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      make: 'Royal Enfield',
      model: model.trim() || 'Hunter 350',
      edition: edition.trim() || 'Graphite Grey',
      modelYear: parseNumberSafe(modelYear) || 2026,
      fuelCapacityLitres: parseNumberSafe(fuelCapacity) || 13,
      initialOdometer: parseNumberSafe(initialOdo) || 0,
      registrationNumber: registration.trim(),
      customPhotoUrl: photoUrl,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Motorcycle Profile"
      subtitle="Royal Enfield Hunter 350 Specifications"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Motorcycle Photo Upload / Preview Section */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">
            Motorcycle Photo
          </label>
          {photoUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-graphite-750 bg-graphite-950 h-36">
              <img
                src={photoUrl}
                alt="Hunter 350 Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 right-2 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl bg-graphite-900/90 text-white text-xs font-bold border border-graphite-700 flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5 text-hunter-lime" />
                  <span>Change</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="p-1 rounded-xl bg-graphite-900/90 text-rose-400 hover:text-rose-300 border border-graphite-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-5 rounded-2xl border border-dashed border-graphite-700 hover:border-hunter-lime/60 bg-graphite-950/50 hover:bg-graphite-950 flex flex-col items-center justify-center space-y-1.5 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-graphite-800 flex items-center justify-center group-hover:scale-105 transition">
                <Camera className="w-5 h-5 text-hunter-lime" />
              </div>
              <span className="text-xs font-bold text-slate-200">
                Upload Photo from Gallery / Camera
              </span>
              <span className="text-[10px] text-slate-400">
                Personalize your Hunter 350 dashboard
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 p-2.5 rounded-2xl bg-hunter-lime/10 border border-hunter-lime/30 text-xs">
          <ShieldCheck className="w-4 h-4 text-hunter-lime shrink-0" />
          <span className="text-slate-200 dark:text-slate-200 text-slate-800 text-[11px]">
            J-Series 349cc Air-Oil Cooled Engine • 13L Fuel Tank
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Edition / Colour
            </label>
            <input
              type="text"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Model Year
            </label>
            <input
              type="number"
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Tank Capacity (L)
            </label>
            <input
              type="number"
              step="0.5"
              value={fuelCapacity}
              onChange={(e) => setFuelCapacity(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Initial Odo (km)
            </label>
            <input
              type="number"
              value={initialOdo}
              onChange={(e) => setInitialOdo(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              Registration No.
            </label>
            <input
              type="text"
              placeholder="e.g. KA 03 RE 2026"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white dark:text-white text-slate-900 uppercase focus:outline-none focus:border-hunter-lime"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-graphite-800 text-slate-300 font-bold text-xs hover:bg-graphite-750 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 font-black text-xs uppercase tracking-wider shadow-dial shadow-hunter-lime/20 flex items-center justify-center space-x-1.5 transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
