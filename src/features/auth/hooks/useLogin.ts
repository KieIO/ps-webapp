import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { setAuth } from '@/store/slices/authSlice';
import { setRolePermissions } from '@/store/slices/permissionSlice';
import { authApi } from '../api';
import type { LoginRequest } from '../schemas/auth.schema';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: ({ token, user }) => {
      dispatch(setAuth({ token, user }));
      dispatch(setRolePermissions(user.role));
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
};
