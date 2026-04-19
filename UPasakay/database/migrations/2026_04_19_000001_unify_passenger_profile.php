<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('passengers')) {
            Schema::table('passengers', function (Blueprint $table) {
                // add new columns where missing
                if (!Schema::hasColumn('passengers', 'phone_number')) {
                    $table->string('phone_number')->nullable()->after('email');
                }

                if (!Schema::hasColumn('passengers', 'student_id')) {
                    $table->string('student_id')->nullable()->after('passenger_type');
                }

                if (!Schema::hasColumn('passengers', 'employee_id')) {
                    $table->string('employee_id')->nullable()->after('student_id');
                }

                if (!Schema::hasColumn('passengers', 'verification_status')) {
                    $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending')->after('employee_id');
                }

                if (!Schema::hasColumn('passengers', 'profile_completed')) {
                    $table->boolean('profile_completed')->default(false)->after('verification_status');
                }

                // Add department_office while preserving existing department column values
                if (!Schema::hasColumn('passengers', 'department_office')) {
                    $table->string('department_office')->nullable()->after('passenger_number');
                }

                // Ensure passenger_type and passenger_status use controlled values
                if (Schema::hasColumn('passengers', 'passenger_type')) {
                    // no-op here; rely on application validation to restrict values
                } else {
                    $table->enum('passenger_type', ['student', 'faculty', 'employee', 'other'])->default('student')->after('passenger_number');
                }

                if (!Schema::hasColumn('passengers', 'passenger_status')) {
                    $table->enum('passenger_status', ['active', 'inactive', 'blocked'])->default('active')->after('verification_status');
                }
            });
        }

        // migrate existing department -> department_office if needed
        if (Schema::hasColumn('passengers', 'department') && Schema::hasColumn('passengers', 'department_office')) {
            // Copy values in a raw query to avoid depending on Eloquent at migration time
            try {
                $prefix = Schema::getConnection()->getTablePrefix();
                $tableName = $prefix . 'passengers';
                \DB::statement("UPDATE {$tableName} SET department_office = department WHERE department_office IS NULL");
            } catch (\Throwable $e) {
                // ignore copy errors in environments without DB available at migration generation time
            }

            // keep old column for compatibility; do not drop here to avoid breaking older codepaths immediately
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('passengers', function (Blueprint $table) {
            if (Schema::hasColumn('passengers', 'phone_number')) {
                $table->dropColumn('phone_number');
            }
            if (Schema::hasColumn('passengers', 'student_id')) {
                $table->dropColumn('student_id');
            }
            if (Schema::hasColumn('passengers', 'employee_id')) {
                $table->dropColumn('employee_id');
            }
            if (Schema::hasColumn('passengers', 'verification_status')) {
                $table->dropColumn('verification_status');
            }
            if (Schema::hasColumn('passengers', 'profile_completed')) {
                $table->dropColumn('profile_completed');
            }
            if (Schema::hasColumn('passengers', 'department_office')) {
                $table->dropColumn('department_office');
            }
            // Do not drop passenger_type/passenger_status here; leave as-is to avoid unsafe down migrations
        });
    }
};
