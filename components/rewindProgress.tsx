import usePortalStore from "@/state/portal";
import useGraphHistoryStore from "@/state/graphHistory";
import useCreationStore from "@/state/creationState";

const RewindProgress = () => {
  const closePortal = usePortalStore((state) => state.closePortal);
  const rewindGraph = useGraphHistoryStore((state) => state.rewindtoCheckpoint);
  const history = useGraphHistoryStore((state) => state.history);
  const reset = useCreationStore((state) => state.reset);
  const currentState = useCreationStore((state) => state.currentState);
  const rewindStep = useCreationStore((state) => state.rewindToStep);
  const steps = ["title", "prerequisites", "target", "outline"];
  const currentStep = steps.indexOf(currentState);

  const handleRewind = () => {
    // just return if it is current step
    if (!rewindStep || rewindStep >= currentStep + 1) return;
    // Implement rewind logic here, e.g., updating state or calling a function
    console.log(`Rewind to step ${rewindStep}`);
    switch (rewindStep) {
      case 1:
        rewindGraph(history[0].threadId, null);
        reset();
        break;
      default:
        break;
    }
  };

  return (
    <div className="text-white">
      Are you sure you want to rewind to this step? All progress after this step will be lost.
      <div className="mt-4 flex justify-end gap-4">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          onClick={closePortal}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
          onClick={() => {
            handleRewind();
            closePortal();
          }}
        >
          Rewind
        </button>
      </div>
    </div>
  );
};

export default RewindProgress;