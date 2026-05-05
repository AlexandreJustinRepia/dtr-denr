import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-sm text-gray-600 mt-1">Please enter your credentials to log in.</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-700 bg-green-50 p-3 rounded border border-green-200">
                    {status}
                </div>
            )}

            {errors.email && errors.email.includes('seconds') && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                    <div className="text-red-600 mt-0.5">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">Account Locked Temporarily</h3>
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        <p className="text-xs text-red-500 mt-2 font-medium">This is a security measure to prevent brute-force attacks.</p>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" /> Email Address
                    </InputLabel>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="your@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={errors.email?.includes('seconds')}
                    />

                    {(!errors.email || !errors.email.includes('seconds')) && (
                        <InputError message={errors.email} className="mt-2" />
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-500" /> Password
                    </InputLabel>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={errors.email?.includes('seconds')}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-green-600 hover:text-green-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full gap-2"
                        disabled={processing || errors.email?.includes('seconds')}
                    >
                        {processing ? 'Logging in...' : (
                            <>
                                <LogIn className="w-4 h-4" />
                                {errors.email?.includes('seconds') ? 'Locked' : 'Sign In'}
                            </>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
