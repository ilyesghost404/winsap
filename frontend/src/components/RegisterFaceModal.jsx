import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import toast from 'react-hot-toast';
import { Check, RefreshCw, AlertTriangle, UserCheck } from 'lucide-react';
import { registerFace } from '../services/employeeService';
import CameraCapture from './CameraCapture';
import LoadingSpinner from './LoadingSpinner';

const RegisterFaceModal = ({ isOpen, onClose, employee }) => {
  const [step, setStep] = useState(0); // 0: Front, 1: Left, 2: Right, 3: Review, 4: Loading
  const [captures, setCaptures] = useState({ front: null, left: null, right: null });
  const [error, setError] = useState('');

  const stepsConfig = [
    { label: 'Front Angle', instruction: 'Look directly into the camera with even lighting.' },
    { label: 'Left Profile', instruction: 'Turn head slightly to the left side.' },
    { label: 'Right Profile', instruction: 'Turn head slightly to the right side.' },
  ];

  const handleFaceCapture = (base64Image) => {
    const stepKeys = ['front', 'left', 'right'];
    setCaptures((prev) => ({
      ...prev,
      [stepKeys[step]]: base64Image,
    }));

    if (step < 2) {
      setStep((prev) => prev + 1);
    } else {
      setStep(3);
    }
  };

  const handleReset = () => {
    setCaptures({ front: null, left: null, right: null });
    setStep(0);
    setError('');
  };

  const handleSubmit = async () => {
    setStep(4);
    try {
      const imagesArray = [captures.front, captures.left, captures.right];
      await registerFace(employee.id, imagesArray);
      toast.success('Face biometric template registered successfully!');
      onClose();
      handleReset();
    } catch (err) {
      console.error('Register face error:', err);
      const errMsg = err.response?.data?.message || 'Face registration failed. Please try again.';
      setError(errMsg);
      setStep(3);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register Face Biometrics — ${employee?.first_name || ''} ${employee?.last_name || ''}`}
      subtitle="Capture 3 angles to generate AI facial embedding profile."
    >
      <div className="space-y-4">
        {step < 3 && (
          <div className="flex flex-col items-center space-y-4">
            {/* Step Indicators */}
            <div className="flex items-center justify-between w-full max-w-sm">
              {stepsConfig.map((s, idx) => (
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === idx
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : step > idx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > idx ? <Check size={13} /> : idx + 1}
                  </div>
                  <span className="ml-1.5 text-xs font-semibold text-slate-700 hidden sm:inline">
                    {s.label}
                  </span>
                  {idx < 2 && <div className="w-8 h-0.5 bg-slate-100 mx-2" />}
                </div>
              ))}
            </div>

            {/* Instruction Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 w-full text-center">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                {stepsConfig[step].label}
              </h4>
              <p className="text-slate-500 text-xs mt-0.5">{stepsConfig[step].instruction}</p>
            </div>

            {/* Camera */}
            <CameraCapture
              onCapture={handleFaceCapture}
              facingMode="user"
              showGuide={true}
              actionButtonLabel={`Capture ${stepsConfig[step].label}`}
            />
          </div>
        )}

        {/* Review Captures */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Review 3 Angles</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                Verify each profile is clear and well-lit before submitting.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {Object.keys(captures).map((key) => (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 w-full shadow-2xs">
                    <img src={captures[key]} alt={key} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {key}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" icon={RefreshCw} onClick={handleReset}>
                Retake
              </Button>
              <Button onClick={handleSubmit} icon={UserCheck}>
                Save Biometrics
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {step === 4 && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <LoadingSpinner size="lg" text="Securing and registering facial biometric template…" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RegisterFaceModal;
