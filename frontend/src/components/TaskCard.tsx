import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../types';
import { taskAPI } from '../services/api';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateMutation = useMutation({
    mutationFn: (newTitle: string) => taskAPI.updateTask(task.id, { title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskAPI.deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });

  const handleSave = () => {
    if (title.trim() && title !== task.title) {
      updateMutation.mutate(title);
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
          autoFocus
          rows={2}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              setTitle(task.title);
              setIsEditing(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm text-gray-900 flex-1">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-xs text-gray-500 hover:text-blue-600"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this task?')) {
                deleteMutation.mutate();
              }
            }}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            🗑️
          </button>
        </div>
      </div>
      {task.assignedUsers && task.assignedUsers.length > 0 && (
        <div className="flex gap-1 mt-2">
          {task.assignedUsers.map((au) => (
            <span
              key={au.userId}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium"
              title={au.user.name}
            >
              {au.user.name.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
