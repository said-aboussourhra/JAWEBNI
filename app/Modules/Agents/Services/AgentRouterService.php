<?php

namespace App\Modules\Agents\Services;

class AgentRouterService
{
    public function routeMessage(string $message): array
    {
        $normalized = mb_strtolower(trim($message));

        // 1. Complaint Detection
        if (preg_match('/(شكوى|مشكل|استرجاع|فلوسي|retard|remboursement|نصابين|ردولي|réclamation|mauvais)/ui', $normalized)) {
            return [
                'agent_type' => 'complaint',
                'agent_name' => 'Complaint Agent (وكيل معالجة الشكاوى)',
                'intent' => 'complaint_escalation',
                'confidence' => 45,
                'requires_handoff' => true,
            ];
        }

        // 2. Booking Detection
        if (preg_match('/(موعد|حجز|rendez-vous|rdv|booking|قياس|نجي عندكم|ساعة|الجمعة|السبت|غدا)/ui', $normalized)) {
            return [
                'agent_type' => 'booking',
                'agent_name' => 'Booking Agent (وكيل الحجوزات والمواعيد)',
                'intent' => 'appointment_booking',
                'confidence' => 98,
                'requires_handoff' => false,
            ];
        }

        // 3. Sales & Purchase Inquiry Detection
        if (preg_match('/(شحال|ثمن|prix|combien|قفطان|جلابة|بلغة|توصيل|livraison|كازا|طنجة|مقاس|taille|شراء|commande|دفع)/ui', $normalized)) {
            return [
                'agent_type' => 'sales',
                'agent_name' => 'Sales Agent (وكيل المبيعات والعروض)',
                'intent' => 'purchase_inquiry',
                'confidence' => 96,
                'requires_handoff' => false,
            ];
        }

        // 4. Order Support / Tracking Detection
        if (preg_match('/(فين وصل|suivi|colis|أمانة|livreur|فين المحل|أوقات العمل)/ui', $normalized)) {
            return [
                'agent_type' => 'support',
                'agent_name' => 'Support Agent (وكيل الدعم والتتبع)',
                'intent' => 'order_support',
                'confidence' => 93,
                'requires_handoff' => false,
            ];
        }

        // 5. Default FAQ Agent
        return [
            'agent_type' => 'faq',
            'agent_name' => 'FAQ Agent (وكيل الأسئلة العامة)',
            'intent' => 'general_faq',
            'confidence' => 90,
            'requires_handoff' => false,
        ];
    }
}