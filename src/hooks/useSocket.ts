import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addCommentRealTime, updateCommentRealTime, deleteCommentRealTime } from '../store/slices/commentSlice';

interface UseSocketProps {
  topicId: string;
}

export const useSocket = ({ topicId }: UseSocketProps) => {
  const socket = useRef<Socket>();
  const dispatch = useDispatch();

  const connect = useCallback(() => {
    if (!socket.current) {
      socket.current = io('http://localhost:5000', {
        withCredentials: true,
        cors: {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"]
        }
      });

      // Set up event listeners
      socket.current.on('commentAdded', (data: Comment) => {
        dispatch(addCommentRealTime(data)); // Tambahkan komentar baru ke state Redux
      });

      socket.current.on('commentUpdated', (data: Comment) => {
        dispatch(updateCommentRealTime(data)); // Update komentar di state Redux
      });

      socket.current.on('commentDeleted', (data: { id: string }) => {
        dispatch(deleteCommentRealTime(data.id)); // Hapus komentar dari state Redux
      });

      // Join topic room
      socket.current.emit('joinTopic', topicId);
    }
  }, [topicId, dispatch]);

  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.emit('leaveTopic', topicId);
      socket.current.disconnect();
      socket.current = undefined; // Reset socket instance
    }
  }, [topicId,dispatch]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return socket.current;
};