import { navigate } from "wouter/use-browser-location";

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { id: 1, label: "Dados básicos" , link:'/'},
    { id: 2, label: "Seu projeto", link:'/projeto' },
    { id: 3, label: "Resultado", link:'/resultado' },
  ];

  return (
    <>
      {/* Mobile/Tablet: Horizontal stepper */}
      <div className="flex items-center gap-4 mb-8 lg:hidden">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step.id < currentStep
                    ? "bg-green-500 text-white"
                    : step.id === currentStep
                    ? "bg-green-500 text-white"
                    : "border-2 border-gray-300 text-gray-400"
                }`}
                style={{cursor:'pointer'}}
                onClick={()=>navigate(`${step.link}`)}
              >
                {step.id < currentStep ? "✓" : step.id}
              </button>
              <button
                className={`${
                  step.id <= currentStep
                    ? "text-green-600 font-semibold"
                    : "text-gray-400"
                }`}
                style={{cursor:'pointer'}}
                onClick={()=>navigate(`${step.link}`)}
              >
                {step.label}
              </button>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Vertical stepper on the left */}
      <div className="hidden lg:flex flex-col gap-8 min-w-[200px]">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col">
            <div className="flex items-center gap-3">
              <button
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step.id < currentStep
                    ? "bg-green-500 text-white"
                    : step.id === currentStep
                    ? "bg-green-500 text-white"
                    : "border-2 border-gray-300 text-gray-400"
                }`}
                style={{cursor:'pointer'}}
                onClick={()=>navigate(`${step.link}`)}
              >
                {step.id < currentStep ? "✓" : step.id}
              </button>
              <button
                className={`${
                  step.id <= currentStep
                    ? "text-green-600 font-semibold"
                    : "text-gray-400"
                }`}
                style={{cursor:'pointer'}}
                onClick={()=>navigate(`${step.link}`)}
              >
                {step.label}
              </button>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-16 ml-5 ${
                  step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
