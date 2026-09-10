<?php

namespace App\Modules\Agents\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Agents\Models\AIAgent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgentControlRoomController extends Controller
{
    public function updateAgent(Request $request, string $id)
    {
        $validated = $request->validate([
            'instructions' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:active,paused'],
        ]);

        $agent = AIAgent::findOrFail($id);
        $agent->update($validated);

        return back()->with('success', 'Agent settings updated successfully.');
    }
}