<?php

namespace App\Http\Controllers;

use App\Models\Passenger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PassengerApprovalController extends Controller
{
    public function index(Request $request)
    {
        $counts = [
            'pending' => Passenger::where('passenger_status', 'pending')->count(),
            'active' => Passenger::where('passenger_status', 'active')->count(),
            'reviewed' => Passenger::whereIn('passenger_status', ['suspended', 'declined'])->count(),
        ];

        $requestedTab = $request->string('tab')->toString();
        $tab = in_array($requestedTab, ['pending', 'active', 'reviewed'], true)
            ? $requestedTab
            : ($counts['pending'] > 0 ? 'pending' : 'active');

        $query = Passenger::with('user')->latest();

        if ($tab === 'pending') {
            $query->where('passenger_status', 'pending');
        } elseif ($tab === 'active') {
            $query->where('passenger_status', 'active');
        } else {
            $query->whereIn('passenger_status', ['suspended', 'declined']);
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($q) use ($search) {
                $q->where('passenger_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        $passengers = $query->paginate(20)->withQueryString();

        $passengers->getCollection()->transform(function (Passenger $passenger) {
            return [
                'id' => $passenger->id,
                'name' => $passenger->user?->name ?: 'N/A',
                'email' => $passenger->user?->email ?: 'N/A',
                'student_id' => $passenger->passenger_number,
                'department' => $passenger->department,
                'passenger_type' => $passenger->passenger_type,
                'status' => $passenger->passenger_status,
                'registered_at' => optional($passenger->created_at)->format('M d, Y h:i A'),
                'proof_document_path' => $passenger->proof_document_path,
            ];
        });

        return Inertia::render('Passengers/Index', [
            'tab' => $tab,
            'counts' => $counts,
            'filters' => $request->only(['search']),
            'passengers' => $passengers,
        ]);
    }

    public function updateStatus(Request $request, Passenger $passenger)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,active,suspended,declined',
        ]);

        $status = $validated['status'];

        $passenger->update([
            'passenger_status' => $status,
            'reviewed_at' => $status === 'pending' ? null : now(),
        ]);

        return back()->with('success', 'Passenger status updated.');
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:passengers,id',
            'status' => 'required|string|in:active,suspended,declined',
        ]);

        Passenger::whereIn('id', $validated['ids'])->update([
            'passenger_status' => $validated['status'],
            'reviewed_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Passenger statuses updated.');
    }
}
