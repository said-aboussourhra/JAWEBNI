<?php

namespace App\Modules\Tenancy\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TenantSwitchController extends Controller
{
    public function switch(Request $request)
    {
        $validated = $request->validate([
            'business_id' => ['required', 'uuid', 'exists:businesses,id'],
        ]);

        $user = auth()->user();

        // Verify access to tenant
        $hasAccess = $user->businesses()->where('businesses.id', $validated['business_id'])->exists() || $user->is_super_admin;
        if (!$hasAccess) {
            abort(403, 'Unauthorized access to this business.');
        }

        $user->current_business_id = $validated['business_id'];
        $user->save();

        return redirect()->route('pulse');
    }
}
