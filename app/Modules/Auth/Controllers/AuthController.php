<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            if (empty($user->current_business_id)) {
                $business = $user->businesses()->first();
                if ($business) {
                    $user->current_business_id = $business->id;
                    $user->save();
                }
            }

            return redirect()->intended(route('pulse'));
        }

        return back()->withErrors([
            'email' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        ]);
    }

    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['required', 'string'],
            'password' => ['required', 'min:8', 'confirmed'],
            'city' => ['nullable', 'string'],
            'default_language' => ['nullable', 'string', 'in:darija,ar,fr,en'],
        ]);

        $business = Business::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['business_name'],
            'slug' => Str::slug($validated['business_name']).'-'.Str::random(5),
            'phone_number' => $validated['phone'],
            'city' => $validated['city'] ?? 'Casablanca',
            'country' => 'Morocco',
            'currency' => 'MAD',
            'default_language' => $validated['default_language'] ?? 'darija',
            'primary_color' => '#0F9D8C',
            'status' => 'trial',
            'onboarding_completed' => false,
            'onboarding_step' => 1,
            'ai_readiness_score' => 20,
        ]);

        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'current_business_id' => $business->id,
            'role' => 'owner',
            'preferred_locale' => 'ar',
        ]);

        $user->businesses()->attach($business->id, ['role' => 'owner']);

        Auth::login($user);

        return redirect()->route('onboarding');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function showForgotPassword(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'أرسلنا لك رابط إعادة تعيين كلمة المرور على بريدك الإلكتروني.')
            : back()->withErrors(['email' => 'تعذر إرسال رابط إعادة التعيين، تحقق من البريد الإلكتروني.']);
    }

    public function showResetPassword(Request $request, string $token): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user) use ($validated) {
                $user->forceFill([
                    'password' => Hash::make($validated['password']),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('success', 'تم تغيير كلمة المرور بنجاح، يمكنك الدخول الآن.')
            : back()->withErrors(['email' => 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية.']);
    }
}
