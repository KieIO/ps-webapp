import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { syncUserPermissions } from '@/features/rbac/thunks/syncPermissions';
import { setAuth } from '@/store/slices/authSlice';
import { authApi } from '../api';
import type { LoginRequest } from '../schemas/auth.schema';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: ({ token, user }) => {
      dispatch(setAuth({ token, user }));
      dispatch(syncUserPermissions(user.role));
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
};
