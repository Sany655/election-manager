'use client'
import toast from "react-hot-toast";

const useConfirmDelete = () => {

  const confirmDelete = async ({ itemName, onDelete, onSuccess, onError }) => {

    toast(
      (t) => (
        <div>
          <p className="text-gray-900 dark:text-gray-100 font-semibold">
            Are you sure you want to delete{" "}
            <span className="text-red-600">{itemName}</span>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => toast.dismiss(t.id)} // Dismiss the toast
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              onClick={async () => {
                toast.dismiss(t.id); // Dismiss the toast
                try {
                  await onDelete(); // Execute the deletion logic
                  if (onSuccess) onSuccess(); // Execute success callback (optional)
                  toast.dismiss();
                  toast.success(`${itemName} has been deleted.`);
                } catch (error) {
                  if (onError) onError(error); // Execute error callback (optional)
                  toast.dismiss();
                  toast.error(error.message || `Failed to delete ${itemName}.`);
                }
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" } // Keep the toast until the user interacts
    );
  };

  return { confirmDelete };
};

export default useConfirmDelete;
