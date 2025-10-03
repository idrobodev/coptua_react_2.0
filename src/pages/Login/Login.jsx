import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "features/dashboard/Breadcrumbs";
import { useAuth } from "shared/contexts";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const location = useLocation();
  const redirect_url = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError("");
      setLoading(true);
      
      await login(data.email, data.password);
      window.location.href = redirect_url;
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs title="Iniciar Sesión" />
      <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl p-8">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-800">Iniciar Sesión</h2>
                  <p className="text-sm text-gray-500 mt-1">Accede con tu correo y contraseña</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="tu@correo.com"
                    aria-invalid={!!errors.email}
                    {...register("email", { required: true })}
                  />
                  {errors.email && (
                    <span className="mt-1 block text-xs text-red-600">Este campo es obligatorio</span>
                  )}
                </div>

                <div className="mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                      aria-invalid={!!errors.password}
                      {...register("password", { required: true })}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 grid place-items-center px-3 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="mt-1 block text-xs text-red-600">Este campo es obligatorio</span>
                  )}
                </div>

                <button
                  className="mt-6 w-full rounded-lg bg-primary py-2.5 px-4 font-medium text-white shadow-md transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Iniciar Sesión"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
