import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '../assets/Logo.png';

const loginSchema = z.object({
  userName: z.string().min(1, 'Informe seu nome de usuário'),
  password: z.string().min(1, 'Informe sua senha'),
  remember: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post<{ token: string }>('login', {
        userName: data.userName.trim(),
        password: data.password,
      });

      const token = response.data.token;
      if (!token) {
        throw new Error('Token não retornado pela API');
      }

      const success = await login(token, data.remember);
      if (success) {
        toast.success('Login realizado com sucesso! Bem-vindo(a).');
        navigate('/');
      } else {
        toast.error('Não foi possível carregar o perfil do usuário.');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('Usuário ou senha inválidos.');
      } else {
        toast.error('Erro de conexão com o servidor. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <img src={logoImg} alt="Planejamento Pessoal Logo" className="w-14 h-14 object-contain" />
          </div>
          <div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold tracking-wide text-slate-100">
              Planejamento <span className="text-emerald-400">Pessoal</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Gerencie suas finanças com simplicidade e clareza</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center justify-between">
            <span>Acessar Conta</span>
            <span className="text-xs font-normal text-slate-400">Entre com seus dados</span>
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome de Usuário"
              placeholder="Digite seu usuário"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.userName?.message}
              autoComplete="username"
              {...register('userName')}
            />

            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-slate-200 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            {/* Checkbox Lembrar de mim */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500/20"
                  {...register('remember')}
                />
                <span>Lembrar de mim</span>
              </label>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            {/* Link para Cadastro */}
            <div className="pt-4 text-center border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
