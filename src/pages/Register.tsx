import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Eye, EyeOff, Lock, User, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '../assets/Logo.png';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo'),
    username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
    birthday: z.string().min(1, 'Informe sua data de nascimento'),
    email: z.string().email('Informe um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await api.post('users', {
        name: data.name,
        username: data.username,
        birthday: data.birthday,
        email: data.email,
        password: data.password,
      });

      toast.success('Cadastro realizado com sucesso! Faça seu login para começar.');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao cadastrar usuário. Verifique se os dados já não foram utilizados.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <img src={logoImg} alt="Planejamento Pessoal" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="font-brand text-2xl font-bold tracking-wide text-slate-100">
            Criar Nova <span className="text-emerald-400">Conta</span>
          </h1>
          <p className="text-xs text-slate-400">Preencha os campos abaixo para iniciar o seu planejamento</p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Ex.: João da Silva"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Nome de Usuário (Login)"
              placeholder="Ex.: joaosilva"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Data de Nascimento"
              type="date"
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.birthday?.message}
              {...register('birthday')}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seuemail@exemplo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
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
              {...register('password')}
            />

            <Input
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repita sua senha"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 hover:text-slate-200 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Actions */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              Criar Minha Conta
            </Button>

            <div className="pt-4 text-center border-t border-slate-800/80">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para o Login</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
