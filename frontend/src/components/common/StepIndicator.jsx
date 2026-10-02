import { Check } from "lucide-react";

const StepIndicator = ({ steps, currentStep }) => (
    <div className="flex items-center justify-center mb-10">
        {steps.map((label, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            return (
                <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-base ${isDone
                                    ? "bg-brand-600 text-white"
                                    : isActive
                                        ? "bg-brand-100 text-brand-600 border-2 border-brand-600"
                                        : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {isDone ? <Check size={16} /> : stepNum}
                        </div>
                        <span className={`text-xs mt-1.5 font-medium ${isActive ? "text-brand-600" : "text-gray-500"}`}>
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 mb-5 ${isDone ? "bg-brand-600" : "bg-gray-200"}`} />
                    )}
                </div>
            );
        })}
    </div>
);

export default StepIndicator;