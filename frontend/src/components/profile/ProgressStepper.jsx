import React from 'react';

const ProgressStepper = ({ steps, activeStep, completed }) => {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step */}
          <div className="flex flex-col items-center">
            {/* Circle */}
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white
                ${completed.includes(index) ? 'bg-green-600' : 
                  activeStep === index ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              {completed.includes(index) ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {/* Label */}
            <div className="mt-2 text-sm font-medium">
              {step}
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div 
              className={`w-20 h-1 mx-2 
                ${completed.includes(index) ? 'bg-green-600' : 'bg-gray-300'}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressStepper; 