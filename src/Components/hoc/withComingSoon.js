"use client";
import { useEffect, useState } from "react";

// Toggle this to enable/disable the coming soon overlay
const isOn = false;

const withComingSoon = (WrappedComponent, options = {}) => {
  return function ComingSoonWrapper(props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) return null;

    // If coming soon is turned off, just return the component normally
    if (!isOn) {
      return <WrappedComponent {...props} />;
    }

    return (
      <div className="relative">
        <div className="pointer-events-none opacity-20">
          <WrappedComponent {...props} />
        </div>

        {/* Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 rounded-lg bg-white p-8 text-center shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">Доаѓаме наскоро!</h2>
            <p className="mb-4 text-gray-600">
              Подгответе се за учење - почнуваме официјално од 10ти февруари.
            </p>
            <p className="text-sm text-gray-500">
              Ви благодариме на разбирањето.
            </p>
          </div>
        </div>
      </div>
    );
  };
};

export default withComingSoon;
