<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Passenger extends Authenticatable
{
    use HasApiTokens, Notifiable;

    public const PASSENGER_TYPES = ['student', 'faculty', 'employee', 'other'];
    public const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'];
    public const PASSENGER_STATUSES = ['active', 'inactive', 'blocked'];
    public const DEPARTMENT_OFFICES = [
        'Office of the Chancellor',
        'Office of the Vice Chancellor for Academic Affairs (OVCAA)',
        'Office of the Vice Chancellor for Administration (OVCA)',
        'Office of the University Registrar (OUR)',
        'Office of Student Affairs (OSA)',
        'Campus Maintenance Office (CMO)',
        'College of Communication, Art, and Design',
        'School of Management',
        'College of Science',
        'College of Social Science',
        'UP High School Cebu',
    ];

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'password_hash',
        'passenger_number',
        'department',
        'department_office',
        'phone_number',
        'passenger_type',
        'passenger_status',
        'verification_status',
        'student_id',
        'employee_id',
        'profile_completed',
        'proof_document_path',
        'reviewed_at',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'profile_completed' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function (self $passenger) {
            $passenger->profile_completed = self::isProfileComplete($passenger);
        });
    }

    public static function isProfileComplete(self $passenger): bool
    {
        if (empty($passenger->full_name) || empty($passenger->passenger_number) || empty($passenger->passenger_type)) {
            return false;
        }

        if ($passenger->passenger_type === 'student') {
            return !empty($passenger->student_id) && !empty($passenger->proof_document_path);
        }

        if (in_array($passenger->passenger_type, ['faculty', 'employee'], true)) {
            return !empty($passenger->employee_id)
                && !empty($passenger->department_office)
                && !empty($passenger->proof_document_path);
        }

        return true;
    }

    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class, 'user_id', 'user_id');
    }
}