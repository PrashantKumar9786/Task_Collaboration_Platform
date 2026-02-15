import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { boardAPI, listAPI, taskAPI } from '../services/api';
import { socketService } from '../services/socket';
import { ListComponent } from '../components/ListComponent';
import { TaskCard } from '../components/TaskCard';
import { useAuth } from '../contexts/AuthContext';

export const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardAPI.getBoard(boardId!),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (boardId) {
      socketService.joinBoard(boardId);

      const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      };

      socketService.onListCreated(handleRefresh);
      socketService.onListUpdated(handleRefresh);
      socketService.onListDeleted(handleRefresh);
      socketService.onTaskCreated(handleRefresh);
      socketService.onTaskUpdated(handleRefresh);
      socketService.onTaskDeleted(handleRefresh);
      socketService.onTaskMoved(handleRefresh);

      return () => {
        socketService.leaveBoard(boardId);
        socketService.off('list:created');
        socketService.off('list:updated');
        socketService.off('list:deleted');
        socketService.off('task:created');
        socketService.off('task:updated');
        socketService.off('task:deleted');
        socketService.off('task:moved');
      };
    }
  }, [boardId, queryClient]);

  const createListMutation = useMutation({
    mutationFn: (name: string) => listAPI.createList(boardId!, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setIsCreatingList(false);
      setNewListName('');
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, listId, position }: { taskId: string; listId: string; position: number }) =>
      taskAPI.moveTask(taskId, listId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeTaskId = active.id as string;
    const overContainerId = over.id as string;

    let targetListId: string;
    let targetPosition: number;

    if (overContainerId.startsWith('list-')) {
      targetListId = overContainerId.replace('list-', '');
      const targetList = board?.lists?.find(l => l.id === targetListId);
      targetPosition = targetList?.tasks?.length || 0;
    } else {
      const overTask = board?.lists
        ?.flatMap(l => l.tasks)
        ?.find(t => t.id === overContainerId);
      
      if (!overTask) return;
      
      targetListId = overTask.listId;
      targetPosition = overTask.position;
    }

    moveTaskMutation.mutate({
      taskId: activeTaskId,
      listId: targetListId,
      position: targetPosition,
    });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createListMutation.mutate(newListName);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Board not found</p>
          <button
            onClick={() => navigate('/boards')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Boards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/boards')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
              {board.description && (
                <p className="text-sm text-gray-600">{board.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Board Content */}
      <main className="px-4 py-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <SortableContext
              items={board.lists?.map(l => l.id) || []}
              strategy={horizontalListSortingStrategy}
            >
              {board.lists?.map(list => (
                <ListComponent key={list.id} list={list} boardId={boardId!} />
              ))}
            </SortableContext>

            {/* Add List */}
            <div className="flex-shrink-0 w-72">
              {isCreatingList ? (
                <form onSubmit={handleCreateList} className="bg-white p-4 rounded-lg shadow">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition text-sm"
                    >
                      Add List
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingList(false);
                        setNewListName('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-300 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingList(true)}
                  className="w-full bg-white bg-opacity-50 hover:bg-opacity-75 p-4 rounded-lg text-gray-700 font-medium transition"
                >
                  + Add List
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};
