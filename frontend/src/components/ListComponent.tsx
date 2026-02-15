import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { List, Task } from '../types';
import { listAPI, taskAPI } from '../services/api';
import { TaskCard } from './TaskCard';

interface ListComponentProps {
  list: List & { tasks?: Task[] };
  boardId: string;
}

export const ListComponent: React.FC<ListComponentProps> = ({ list, boardId }) => {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const queryClient = useQueryClient();

  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
  });

  const createTaskMutation = useMutation({
    mutationFn: (title: string) => taskAPI.createTask(list.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setIsCreatingTask(false);
      setNewTaskTitle('');
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: () => listAPI.deleteList(list.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate(newTaskTitle);
    }
  };

  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{list.name}</h3>
        <button
          onClick={() => deleteListMutation.mutate()}
          className="p-1 text-gray-500 hover:text-red-600 transition"
        >
          🗑️
        </button>
      </div>

      <div ref={setNodeRef} className="space-y-2 min-h-[100px]">
        <SortableContext
          items={list.tasks?.map(t => t.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {list.tasks?.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-3">
        {isCreatingTask ? (
          <form onSubmit={handleCreateTask}>
            <textarea
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2 text-sm"
              autoFocus
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 text-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingTask(false);
                  setNewTaskTitle('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreatingTask(true)}
            className="w-full text-left text-gray-600 hover:bg-gray-200 p-2 rounded-md text-sm"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};
