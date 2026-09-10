<?php

use App\Modules\AIEngine\Controllers\AIStudioController;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Billing\Controllers\BillingController;
use App\Modules\Booking\Controllers\BookingController;
use App\Modules\Business\Controllers\BusinessPulseController;
use App\Modules\Business\Controllers\OnboardingController;
use App\Modules\Campaigns\Controllers\CampaignController;
use App\Modules\CRM\Controllers\CustomerController;
use App\Modules\RAG\Controllers\RAGDocumentController;
use App\Modules\Tenancy\Controllers\SuperAdminController;
use App\Modules\Tenancy\Controllers\TenantSwitchController;
use App\Modules\WhatsAppBot\Controllers\InboxController;
use App\Modules\WhatsAppBot\Controllers\WebhookController;
use App\Modules\Workflow\Controllers\WorkflowController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Meta Cloud Webhook Endpoints
Route::get('/api/webhook/whatsapp', [WebhookController::class, 'verify'])->name('webhook.whatsapp.verify');
Route::post('/api/webhook/whatsapp', [WebhookController::class, 'handle'])->name('webhook.whatsapp.handle');

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return redirect()->route('login');
    });
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated & Tenant-Scoped Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/tenant/switch', [TenantSwitchController::class, 'switch'])->name('tenant.switch');

    // Onboarding Experience
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('/onboarding/step', [OnboardingController::class, 'saveStep'])->name('onboarding.save-step');

    // Business Pulse (Living AI Operating System Hub)
    Route::get('/pulse', [BusinessPulseController::class, 'index'])->name('pulse');
    
    // AI Inbox 3-Panel Workspace
    Route::get('/inbox', [InboxController::class, 'index'])->name('inbox');
    Route::post('/inbox/send', [InboxController::class, 'sendMessage'])->name('inbox.send');
    Route::post('/inbox/toggle-ai', [InboxController::class, 'toggleAI'])->name('inbox.toggle-ai');

    // AI Studio Hub & Workspaces
    Route::get('/ai-studio', [AIStudioController::class, 'index'])->name('ai-studio');
    Route::post('/ai-studio/knowledge', [AIStudioController::class, 'storeKnowledge'])->name('ai-studio.knowledge.store');
    Route::post('/ai-studio/personality', [AIStudioController::class, 'updatePersonality'])->name('ai-studio.personality.update');
    Route::post('/ai-studio/test-simulation', [AIStudioController::class, 'runTestSimulation'])->name('ai-studio.test-simulation');

    // RAG Document Ingestion
    Route::post('/rag/documents/upload', [RAGDocumentController::class, 'upload'])->name('rag.documents.upload');
    Route::delete('/rag/documents/{id}', [RAGDocumentController::class, 'destroy'])->name('rag.documents.destroy');

    // Customer Intelligence & AI Memory (CRM)
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers');
    Route::post('/customers/{id}/memory', [CustomerController::class, 'updateMemory'])->name('customers.memory.update');
    Route::post('/customers/{id}/notes', [CustomerController::class, 'addNote'])->name('customers.notes.store');

    // Booking & Appointment Workspace
    Route::get('/booking', [BookingController::class, 'index'])->name('booking');
    Route::post('/booking/store', [BookingController::class, 'store'])->name('booking.store');

    // Automation & Visual Workflows
    Route::get('/automation', [WorkflowController::class, 'index'])->name('automation');
    Route::post('/automation/store', [WorkflowController::class, 'store'])->name('automation.store');

    // Campaign Mission Control
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns');
    Route::post('/campaigns/store', [CampaignController::class, 'store'])->name('campaigns.store');

    // Intelligence Storytelling Analytics
    Route::get('/analytics', function () {
        return Inertia::render('Analytics/Index');
    })->name('analytics');

    // Billing & Manual Bank Transfer (RIB / IBAN Settings)
    Route::get('/settings', [BillingController::class, 'index'])->name('settings');
    Route::post('/settings/bank-transfer', [BillingController::class, 'submitBankTransfer'])->name('settings.bank-transfer');

    // Super Admin Control Center
    Route::get('/admin', [SuperAdminController::class, 'index'])->name('admin');
    Route::post('/admin/payments/{id}/approve', [SuperAdminController::class, 'approvePayment'])->name('admin.payments.approve');
    Route::post('/admin/payments/{id}/reject', [SuperAdminController::class, 'rejectPayment'])->name('admin.payments.reject');
    Route::post('/admin/bank-settings', [SuperAdminController::class, 'updateBankSettings'])->name('admin.bank-settings.update');
});