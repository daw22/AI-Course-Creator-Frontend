import usePortalStore from "@/state/portal";
import useGraphHistoryStore from "@/state/graphHistory";
import useCreationStore from "@/state/creationState";
import LoadingMessage from "./loadingMessage";


const RewindProgress = () => {
  const closePortal = usePortalStore((state) => state.closePortal);
  const rewindGraph = useGraphHistoryStore((state) => state.rewindtoCheckpoint);
  const history = useGraphHistoryStore((state) => state.history);
  const reset = useCreationStore((state) => state.reset);
  const currentState = useCreationStore((state) => state.currentState);
  const rewindStep = useCreationStore((state) => state.rewindToStep);
  const steps = ["title", "prerequisites", "target", "outline"];
  const currentStep = steps.indexOf(currentState);
  const loadingMessage = useCreationStore((state) => state.loadingMessage);

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
      <h2 className="text-xl font-semibold mb-4">Rewind Progress</h2>
      <p className="mb-4">
        You are about to rewind your progress to an earlier step. This action
        cannot be undone.
      </p>
      <p className="mb-4">
        Current Step: <strong>{currentState}</strong>
      </p>
      {loadingMessage && <LoadingMessage message={loadingMessage} />}
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